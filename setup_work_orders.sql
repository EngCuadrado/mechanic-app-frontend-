-- Habilitar work orders en una BD que ya tiene: users, companies, mechanics, vehicles, inventory_parts.
-- Conectate a db_aceb6b_mechanic. Ejecuta UN PASO a la vez (selecciona el bloque, Alt+X en DBeaver)
-- y revisa que no haya errores antes de pasar al siguiente. Cada sentencia se puede repetir sin duplicar nada.
-- Los triggers/vistas van dentro de EXEC porque CREATE TRIGGER debe ir solo en su lote.

-- ===================== PASO 1: endurecer inventory_parts =====================
-- (verificado: 0 filas con stock NULL o negativo)
ALTER TABLE dbo.inventory_parts ALTER COLUMN stock_quantity INT NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('dbo.inventory_parts') AND col_name(parent_object_id, parent_column_id) = 'stock_quantity')
  ALTER TABLE dbo.inventory_parts ADD CONSTRAINT DF_inventory_parts_stock DEFAULT 0 FOR stock_quantity;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_inventory_parts_stock')
  ALTER TABLE dbo.inventory_parts ADD CONSTRAINT CK_inventory_parts_stock CHECK (stock_quantity >= 0);

-- ===================== PASO 2: alquileres y facturas (work_orders las referencia) =====================
IF OBJECT_ID(N'dbo.vehicle_rentals', N'U') IS NULL
CREATE TABLE dbo.vehicle_rentals (
  id INT IDENTITY(1,1) PRIMARY KEY,
  vehicle_id INT NOT NULL,
  company_id INT NOT NULL,
  start_date date,
  expected_end_date date,
  actual_end_date date,
  billing_period nvarchar(255),
  rate_amount decimal(10,2),
  status nvarchar(255),
  contract_url nvarchar(255),
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT FK_rentals_vehicles FOREIGN KEY (vehicle_id) REFERENCES dbo.vehicles(vehicle_id),
  CONSTRAINT FK_rentals_companies FOREIGN KEY (company_id) REFERENCES dbo.companies(company_id)
);

IF OBJECT_ID(N'dbo.invoices', N'U') IS NULL
CREATE TABLE dbo.invoices (
  id INT IDENTITY(1,1) PRIMARY KEY,
  company_id INT NOT NULL,
  invoice_number nvarchar(255) UNIQUE,
  status nvarchar(255),
  issue_date date,
  due_date date,
  subtotal decimal(12,2),
  tax_rate decimal(5,2),
  tax_amount decimal(12,2),
  total_amount decimal(12,2),
  currency nvarchar(255),
  exchange_rate decimal(10,4),
  notes nvarchar(MAX),
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT FK_invoices_companies FOREIGN KEY (company_id) REFERENCES dbo.companies(company_id)
);

-- ===================== PASO 3: work_orders =====================
IF OBJECT_ID(N'dbo.work_orders', N'U') IS NULL
CREATE TABLE dbo.work_orders (
  work_order_id INT IDENTITY(1,1) PRIMARY KEY,
  vehicle_id INT NOT NULL,
  company_id INT NULL,
  rental_id INT NULL,
  invoice_id INT NULL,
  type nvarchar(255) NOT NULL,
  current_status nvarchar(255) NOT NULL DEFAULT N'Recibido',
  reported_issue nvarchar(MAX) NULL,
  notes nvarchar(MAX) NULL,
  created_by INT NULL,
  dropoff_driver_name nvarchar(255),
  pickup_driver_name nvarchar(255),
  dropoff_signature_url nvarchar(255),
  pickup_signature_url nvarchar(255),
  entry_timestamp datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exit_timestamp datetime NULL,
  total_internal_cost decimal(12,2),
  total_billed_price decimal(12,2),
  CONSTRAINT CK_WO_Type CHECK (type IN (N'Preventivo', N'Correctivo', N'Choque', N'Entrega', N'Devolucion')),
  CONSTRAINT CK_WO_Status CHECK (current_status IN (N'Recibido', N'En proceso', N'Listo', N'Entregado', N'Cancelado')),
  CONSTRAINT CK_WO_Delivered_Exit CHECK (current_status <> N'Entregado' OR exit_timestamp IS NOT NULL),
  CONSTRAINT FK_WO_CreatedBy FOREIGN KEY (created_by) REFERENCES dbo.users(user_id),
  CONSTRAINT FK_WO_Vehicle FOREIGN KEY (vehicle_id) REFERENCES dbo.vehicles(vehicle_id),
  CONSTRAINT FK_WO_Company FOREIGN KEY (company_id) REFERENCES dbo.companies(company_id),
  CONSTRAINT FK_WO_Rental FOREIGN KEY (rental_id) REFERENCES dbo.vehicle_rentals(id),
  CONSTRAINT FK_WO_Invoice FOREIGN KEY (invoice_id) REFERENCES dbo.invoices(id)
);

-- Una sola orden abierta por vehiculo
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_WO_OneOpenPerVehicle' AND object_id = OBJECT_ID('dbo.work_orders'))
  CREATE UNIQUE INDEX UX_WO_OneOpenPerVehicle ON dbo.work_orders(vehicle_id)
  WHERE current_status IN (N'Recibido', N'En proceso', N'Listo');

-- ===================== PASO 4: libro de movimientos de inventario =====================
IF OBJECT_ID(N'dbo.inventory_movements', N'U') IS NULL
CREATE TABLE dbo.inventory_movements (
  movement_id INT IDENTITY(1,1) PRIMARY KEY,
  part_id INT NOT NULL,
  quantity INT NOT NULL,
  movement_type nvarchar(20) NOT NULL,
  unit_cost decimal(10,2) NULL,
  work_order_id INT NULL,
  notes nvarchar(500) NULL,
  created_by INT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT CK_Movements_Type CHECK (
       (movement_type IN (N'Inicial', N'Compra', N'Devolucion') AND quantity > 0)
    OR (movement_type = N'Uso' AND quantity < 0)
    OR (movement_type = N'Ajuste' AND quantity <> 0)),
  CONSTRAINT FK_Movements_Part FOREIGN KEY (part_id) REFERENCES dbo.inventory_parts(inventory_part_id),
  CONSTRAINT FK_Movements_WO FOREIGN KEY (work_order_id) REFERENCES dbo.work_orders(work_order_id),
  CONSTRAINT FK_Movements_User FOREIGN KEY (created_by) REFERENCES dbo.users(user_id)
);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Movements_Part' AND object_id = OBJECT_ID('dbo.inventory_movements'))
  CREATE INDEX IX_Movements_Part ON dbo.inventory_movements(part_id, created_at);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Movements_WO' AND object_id = OBJECT_ID('dbo.inventory_movements'))
  CREATE INDEX IX_Movements_WO ON dbo.inventory_movements(work_order_id);

-- Saldo inicial = stock actual de cada repuesto. Solo si aun no hay trigger ni movimientos
-- (si no, el trigger sumaria el stock por segunda vez).
IF OBJECT_ID(N'dbo.TR_Movements_Apply', N'TR') IS NULL AND NOT EXISTS (SELECT 1 FROM dbo.inventory_movements)
  INSERT INTO dbo.inventory_movements (part_id, quantity, movement_type, notes)
  SELECT inventory_part_id, stock_quantity, N'Inicial', N'Saldo al habilitar movimientos'
  FROM dbo.inventory_parts WHERE stock_quantity > 0;

EXEC(N'
CREATE OR ALTER TRIGGER dbo.TR_Movements_Apply ON dbo.inventory_movements AFTER INSERT AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  UPDATE p SET stock_quantity = p.stock_quantity + m.q
  FROM dbo.inventory_parts p
  JOIN (SELECT part_id, SUM(quantity) AS q FROM inserted GROUP BY part_id) m ON m.part_id = p.inventory_part_id;
END');

EXEC(N'
CREATE OR ALTER TRIGGER dbo.TR_Movements_Immutable ON dbo.inventory_movements AFTER UPDATE, DELETE AS
  THROW 50003, N''Los movimientos de inventario no se editan ni se borran: registra un movimiento de Ajuste.'', 1;');

-- Debe devolver 0 filas; si no, alguien cambio stock_quantity a mano
EXEC(N'
CREATE OR ALTER VIEW dbo.inventory_stock_check AS
SELECT p.inventory_part_id, p.name, p.stock_quantity, ISNULL(SUM(m.quantity), 0) AS ledger_quantity
FROM dbo.inventory_parts p
LEFT JOIN dbo.inventory_movements m ON m.part_id = p.inventory_part_id
GROUP BY p.inventory_part_id, p.name, p.stock_quantity
HAVING p.stock_quantity <> ISNULL(SUM(m.quantity), 0)');

-- ===================== PASO 5: repuestos y servicios de la orden =====================
IF OBJECT_ID(N'dbo.work_order_parts', N'U') IS NULL
CREATE TABLE dbo.work_order_parts (
  work_order_part_id INT IDENTITY(1,1) PRIMARY KEY,
  work_order_id INT NOT NULL,
  part_id INT NOT NULL,
  quantity INT NOT NULL,
  total_unit_cost decimal(10,2) NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  CONSTRAINT CK_WOParts_Qty CHECK (quantity > 0),
  CONSTRAINT CK_WOParts_Amounts CHECK (total_unit_cost >= 0 AND unit_price >= 0),
  CONSTRAINT FK_WOParts_WO FOREIGN KEY (work_order_id) REFERENCES dbo.work_orders(work_order_id),
  CONSTRAINT FK_WOParts_Inventory FOREIGN KEY (part_id) REFERENCES dbo.inventory_parts(inventory_part_id)
);

IF OBJECT_ID(N'dbo.work_order_services', N'U') IS NULL
CREATE TABLE dbo.work_order_services (
  work_order_service_id INT IDENTITY(1,1) PRIMARY KEY,
  work_order_id INT NOT NULL,
  mechanic_id INT NULL,
  description nvarchar(255),
  internal_cost decimal(10,2),
  price decimal(10,2),
  CONSTRAINT CK_WOServices_Amounts CHECK (internal_cost >= 0 AND price >= 0),
  CONSTRAINT FK_WOServices_WO FOREIGN KEY (work_order_id) REFERENCES dbo.work_orders(work_order_id),
  CONSTRAINT FK_WOServices_Mechanic FOREIGN KEY (mechanic_id) REFERENCES dbo.mechanics(mechanic_id)
);

-- Orden Entregado: sin cambios. Cancelado: solo se pueden quitar repuestos (para devolver stock).
EXEC(N'
CREATE OR ALTER TRIGGER dbo.TR_WOParts_Stock ON dbo.work_order_parts AFTER INSERT, UPDATE, DELETE AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.work_orders w ON w.work_order_id = i.work_order_id
             WHERE w.current_status IN (N''Entregado'', N''Cancelado''))
     OR EXISTS (SELECT 1 FROM deleted d JOIN dbo.work_orders w ON w.work_order_id = d.work_order_id
                WHERE w.current_status = N''Entregado'')
    THROW 50001, N''La orden esta cerrada (Entregado/Cancelado): no se pueden modificar sus repuestos.'', 1;
  INSERT INTO dbo.inventory_movements (part_id, quantity, movement_type, work_order_id)
  SELECT part_id, -used, CASE WHEN used > 0 THEN N''Uso'' ELSE N''Devolucion'' END, work_order_id
  FROM (
    SELECT work_order_id, part_id, SUM(qty) AS used FROM (
      SELECT work_order_id, part_id, quantity AS qty FROM inserted
      UNION ALL
      SELECT work_order_id, part_id, -quantity FROM deleted
    ) x GROUP BY work_order_id, part_id HAVING SUM(qty) <> 0
  ) d;
END');

EXEC(N'
CREATE OR ALTER TRIGGER dbo.TR_WOServices_Closed ON dbo.work_order_services AFTER INSERT, UPDATE, DELETE AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  IF EXISTS (SELECT 1 FROM inserted i JOIN dbo.work_orders w ON w.work_order_id = i.work_order_id
             WHERE w.current_status IN (N''Entregado'', N''Cancelado''))
     OR EXISTS (SELECT 1 FROM deleted d JOIN dbo.work_orders w ON w.work_order_id = d.work_order_id
                WHERE w.current_status = N''Entregado'')
    THROW 50002, N''La orden esta cerrada (Entregado/Cancelado): no se pueden modificar sus servicios.'', 1;
END');

-- ===================== PASO 6: inspeccion, checklist y fotos =====================
IF OBJECT_ID(N'dbo.inspection_categories', N'U') IS NULL
CREATE TABLE dbo.inspection_categories (
  category_id INT IDENTITY(1,1) PRIMARY KEY,
  name nvarchar(100) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BIT NOT NULL DEFAULT 1
);

IF OBJECT_ID(N'dbo.inspection_checklist_items', N'U') IS NULL
CREATE TABLE dbo.inspection_checklist_items (
  item_id INT IDENTITY(1,1) PRIMARY KEY,
  name nvarchar(255) NOT NULL,
  input_type nvarchar(50) NOT NULL,
  -- Solo para 'select'/'radio': arreglo JSON de strings, ej: ["Limpio","Sucio","Requiere lavado profundo"]
  options nvarchar(MAX) NULL,
  category_id INT NULL,
  is_required BIT NOT NULL DEFAULT 1,
  is_active BIT NOT NULL DEFAULT 1,
  CONSTRAINT CK_Items_InputType CHECK (input_type IN (N'text', N'textarea', N'number', N'checkbox', N'date', N'select', N'radio')),
  CONSTRAINT CK_Items_Options CHECK (
    (input_type IN (N'select', N'radio') AND ISJSON(options) = 1 AND LEFT(LTRIM(options), 1) = N'[')
    OR (input_type NOT IN (N'select', N'radio') AND options IS NULL)),
  CONSTRAINT FK_Items_Category FOREIGN KEY (category_id) REFERENCES dbo.inspection_categories(category_id)
);

IF NOT EXISTS (SELECT 1 FROM dbo.inspection_categories)
  INSERT INTO dbo.inspection_categories (name, sort_order) VALUES
   (N'Pintura', 1), (N'Carrocería', 2), (N'Mecánico', 3), (N'Interior', 4),
   (N'Llantas', 5), (N'Luces', 6), (N'Fluidos', 7), (N'Documentos y accesorios', 8);

IF NOT EXISTS (SELECT 1 FROM dbo.inspection_checklist_items)
  INSERT INTO dbo.inspection_checklist_items (name, input_type, category_id, is_required)
  SELECT i.name, i.input_type, c.category_id, i.is_required
  FROM (VALUES
    (N'Pintura sin rayones', 'checkbox', N'Pintura', 1),
    (N'Observaciones de pintura', 'textarea', N'Pintura', 0),
    (N'Carrocería sin golpes', 'checkbox', N'Carrocería', 1),
    (N'Parabrisas y vidrios sin daños', 'checkbox', N'Carrocería', 1),
    (N'Espejos en buen estado', 'checkbox', N'Carrocería', 1),
    (N'Observaciones de carrocería', 'textarea', N'Carrocería', 0),
    (N'Motor funciona correctamente', 'checkbox', N'Mecánico', 1),
    (N'Frenos funcionan correctamente', 'checkbox', N'Mecánico', 1),
    (N'Aire acondicionado funciona', 'checkbox', N'Mecánico', 0),
    (N'Observaciones mecánicas', 'textarea', N'Mecánico', 0),
    (N'Asientos y tapicería limpios', 'checkbox', N'Interior', 1),
    (N'Tablero sin luces de advertencia', 'checkbox', N'Interior', 1),
    (N'Nivel de combustible (%)', 'number', N'Interior', 1),
    (N'Limpieza general', 'text', N'Interior', 0),
    (N'Llantas en buen estado', 'checkbox', N'Llantas', 1),
    (N'Presión de llantas (PSI)', 'number', N'Llantas', 0),
    (N'Llanta de repuesto presente', 'checkbox', N'Llantas', 1),
    (N'Luces delanteras funcionan', 'checkbox', N'Luces', 1),
    (N'Luces traseras y direccionales funcionan', 'checkbox', N'Luces', 1),
    (N'Nivel de aceite correcto', 'checkbox', N'Fluidos', 1),
    (N'Nivel de refrigerante correcto', 'checkbox', N'Fluidos', 1),
    (N'Tarjeta de circulación / documentos', 'checkbox', N'Documentos y accesorios', 1),
    (N'Triángulo, extintor y botiquín', 'checkbox', N'Documentos y accesorios', 0),
    (N'Gata y herramientas', 'checkbox', N'Documentos y accesorios', 0)
  ) AS i(name, input_type, category, is_required)
  JOIN dbo.inspection_categories c ON c.name = i.category;

IF NOT EXISTS (SELECT 1 FROM dbo.inspection_checklist_items WHERE name = N'Estado de limpieza')
  INSERT INTO dbo.inspection_checklist_items (name, input_type, options, category_id, is_required)
  SELECT N'Estado de limpieza', 'select', N'["Limpio","Sucio","Requiere lavado profundo"]', category_id, 1
  FROM dbo.inspection_categories WHERE name = N'Interior';

IF OBJECT_ID(N'dbo.vehicle_inspections', N'U') IS NULL
CREATE TABLE dbo.vehicle_inspections (
  vehicle_inspection_id INT IDENTITY(1,1) PRIMARY KEY,
  work_order_id INT NOT NULL,
  inspection_type nvarchar(50) NOT NULL CHECK (inspection_type IN (N'Entrada', N'Salida')),
  mileage INT,
  inspection_notes nvarchar(MAX),
  damage_map_url nvarchar(255),
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT UQ_Inspections_WO_Type UNIQUE (work_order_id, inspection_type),
  CONSTRAINT UQ_Inspections_Id_WO UNIQUE (vehicle_inspection_id, work_order_id),
  CONSTRAINT FK_Inspections_WO FOREIGN KEY (work_order_id) REFERENCES dbo.work_orders(work_order_id)
);

IF OBJECT_ID(N'dbo.work_order_photos', N'U') IS NULL
CREATE TABLE dbo.work_order_photos (
  work_order_photo_id INT IDENTITY(1,1) PRIMARY KEY,
  work_order_id INT NOT NULL,
  vehicle_inspection_id INT NULL,
  stage nvarchar(20) NOT NULL,
  photo_url nvarchar(255) NOT NULL,
  category nvarchar(255),
  uploaded_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT CK_WOPhotos_Stage CHECK (stage IN (N'Antes', N'Despues', N'Otro')),
  CONSTRAINT FK_WOPhotos_WO FOREIGN KEY (work_order_id) REFERENCES dbo.work_orders(work_order_id),
  CONSTRAINT FK_WOPhotos_Inspection FOREIGN KEY (vehicle_inspection_id, work_order_id)
    REFERENCES dbo.vehicle_inspections(vehicle_inspection_id, work_order_id)
);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_WOPhotos_WO' AND object_id = OBJECT_ID('dbo.work_order_photos'))
  CREATE INDEX IX_WOPhotos_WO ON dbo.work_order_photos(work_order_id);

IF OBJECT_ID(N'dbo.vehicle_inspection_results', N'U') IS NULL
CREATE TABLE dbo.vehicle_inspection_results (
  result_id INT IDENTITY(1,1) PRIMARY KEY,
  vehicle_inspection_id INT NOT NULL,
  item_id INT NOT NULL,
  value nvarchar(MAX),
  notes nvarchar(500),
  CONSTRAINT UQ_Results_Inspection_Item UNIQUE (vehicle_inspection_id, item_id),
  CONSTRAINT FK_Results_Inspection FOREIGN KEY (vehicle_inspection_id) REFERENCES dbo.vehicle_inspections(vehicle_inspection_id),
  CONSTRAINT FK_Results_ChecklistItem FOREIGN KEY (item_id) REFERENCES dbo.inspection_checklist_items(item_id)
);

-- ===================== PASO 7: verificacion (solo lectura) =====================
-- Esperado: las 12 tablas con filas (categorias=8, items=25, movimientos=repuestos con stock>0),
-- 3 triggers de work orders y 0 filas en inventory_stock_check.
SELECT t.name AS tabla, SUM(p.rows) AS filas
FROM sys.tables t JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0,1)
WHERE t.name IN ('vehicle_rentals','invoices','work_orders','inventory_movements','work_order_parts','work_order_services',
                 'inspection_categories','inspection_checklist_items','vehicle_inspections','work_order_photos','vehicle_inspection_results')
GROUP BY t.name ORDER BY t.name;

SELECT name AS trigger_name, OBJECT_NAME(parent_id) AS tabla, is_disabled FROM sys.triggers
WHERE name IN ('TR_Movements_Apply','TR_Movements_Immutable','TR_WOParts_Stock','TR_WOServices_Closed');

SELECT * FROM dbo.inventory_stock_check;
