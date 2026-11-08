-- VehicleRentalDB: script en orden de dependencias. Solo CREATE; el reset esta comentado al final.
IF DB_ID('VehicleRentalDB') IS NULL CREATE DATABASE [VehicleRentalDB]
GO
USE [VehicleRentalDB]
GO

-- ============ CATALOGOS Y USUARIOS ============
CREATE TABLE [users] (
  [user_id] INT IDENTITY(1,1) PRIMARY KEY,
  [name] nvarchar(255),
  [last_name] nvarchar(255),
  [email] nvarchar(255) NOT NULL UNIQUE,
  [password_hash] nvarchar(255) NOT NULL,
  [role] nvarchar(255) NOT NULL, -- superadmin, billing, inventory_manager
  [is_active] BIT NOT NULL DEFAULT 1
)
GO

-- password123456 (SHA-256 sin sal: solo para desarrollo)
INSERT INTO [users] ([name], [last_name], [email], [password_hash], [role])
VALUES ('Admin', 'User', 'admin@vehiclerental.com', 'a4dd5658ec0219465b705ea7c7435d9786a3c66d4f448cabd7488dabceafb699', 'superadmin')
GO

CREATE TABLE [mechanic_specialties] (
  [specialty_id] INT IDENTITY(1,1) PRIMARY KEY,
  [name] nvarchar(255) NOT NULL UNIQUE
)
GO

CREATE TABLE [mechanics] (
  [mechanic_id] INT IDENTITY(1,1) PRIMARY KEY,
  [first_name] nvarchar(255),
  [last_name] nvarchar(255),
  [specialty_id] INT NULL,
  [is_active] BIT NOT NULL DEFAULT 1,
  CONSTRAINT [FK_mechanics_specialties] FOREIGN KEY ([specialty_id])
    REFERENCES [mechanic_specialties]([specialty_id]) ON DELETE SET NULL
)
GO

CREATE TABLE [companies] (
  [company_id] INT IDENTITY(1,1) PRIMARY KEY,
  [name] nvarchar(255),
  [tax_id] nvarchar(255),
  [billing_address] nvarchar(MAX),
  [contact_email] nvarchar(255),
  [contact_phone] nvarchar(255),
  [default_currency] nvarchar(255) DEFAULT 'NIO',
  [logo_url] nvarchar(255),
  [is_active] BIT NOT NULL DEFAULT 1
)
GO

CREATE TABLE [brands] (
  [brand_id] INT IDENTITY(1,1) PRIMARY KEY,
  [brand_name] nvarchar(255) NOT NULL UNIQUE
)
GO

CREATE TABLE [models] (
  [model_id] INT IDENTITY(1,1) PRIMARY KEY,
  [brand_id] INT NOT NULL,
  [model_name] nvarchar(255) NOT NULL,
  CONSTRAINT [FK_models_brands] FOREIGN KEY ([brand_id]) REFERENCES [brands]([brand_id])
)
GO

-- ============ VEHICULOS ============
CREATE TABLE [vehicles] (
  [vehicle_id] INT IDENTITY(1,1) PRIMARY KEY,
  [company_id] INT NULL, -- Quien lo tiene AHORA. NULL = disponible
  [model_id] INT NOT NULL,
  [plate] nvarchar(255) UNIQUE,
  [vin] nvarchar(255) UNIQUE,
  [chassis_number] nvarchar(255) UNIQUE,
  [year] INT,
  [current_mileage] INT,
  [next_maintenance_date] date,
  [next_maintenance_mileage] INT,
  [insurance_expiration_date] date,
  [mechanical_inspection_expiration] date,
  [emissions_inspection_expiration] date,
  [status] nvarchar(255), -- Disponible, Alquilado, En Taller
  CONSTRAINT [FK_vehicles_models] FOREIGN KEY ([model_id]) REFERENCES [models]([model_id]),
  CONSTRAINT [FK_vehicles_companies] FOREIGN KEY ([company_id]) REFERENCES [companies]([company_id])
)
GO

CREATE TABLE [vehicle_attachments] (
  [vehicle_attachment_id] INT IDENTITY(1,1) PRIMARY KEY,
  [vehicle_id] INT NOT NULL,
  [attachment_type] nvarchar(255), -- seguro, inspeccion, etc.
  [attachment_url] nvarchar(255),
  [uploaded_at] datetime DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT [FK_attachments_vehicles] FOREIGN KEY ([vehicle_id]) REFERENCES [vehicles]([vehicle_id])
)
GO

-- ============ INVENTARIO ============
CREATE TABLE [inventory_parts] (
  [inventory_part_id] INT IDENTITY(1,1) PRIMARY KEY,
  [image_url] nvarchar(255) DEFAULT NULL,
  [name] nvarchar(255),
  [stock_quantity] INT NOT NULL DEFAULT 0 CHECK ([stock_quantity] >= 0),
  [unit_cost] decimal(10,2),       -- Costo de compra sin impuestos
  [tax_cost] decimal(10,2) DEFAULT (0.00), -- Porcentaje de impuesto sobre el costo
  [total_unit_cost] decimal(10,2), -- Costo por unidad con impuestos
  [base_price] decimal(10,2),      -- Precio de venta
  [currency] nvarchar(255) DEFAULT 'USD',
  [min_stock_alert] INT,
  [is_active] BIT NOT NULL DEFAULT 1
)
GO

-- ============ ALQUILERES Y FACTURAS (antes de work_orders) ============
CREATE TABLE [vehicle_rentals] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [vehicle_id] INT NOT NULL,
  [company_id] INT NOT NULL,
  [start_date] date,
  [expected_end_date] date, -- NULL = alquiler indefinido
  [actual_end_date] date,   -- Se llena al devolver el vehiculo
  [billing_period] nvarchar(255), -- Diario, Mensual, Anual
  [rate_amount] decimal(10,2),
  [status] nvarchar(255), -- Activo, Finalizado, Cancelado
  [contract_url] nvarchar(255),
  [created_at] datetime DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT [FK_rentals_vehicles] FOREIGN KEY ([vehicle_id]) REFERENCES [vehicles]([vehicle_id]),
  CONSTRAINT [FK_rentals_companies] FOREIGN KEY ([company_id]) REFERENCES [companies]([company_id])
)
GO

CREATE TABLE [invoices] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [company_id] INT NOT NULL,
  [invoice_number] nvarchar(255) UNIQUE,
  [status] nvarchar(255),
  [issue_date] date,
  [due_date] date,
  [subtotal] decimal(12,2),
  [tax_rate] decimal(5,2),
  [tax_amount] decimal(12,2),
  [total_amount] decimal(12,2),
  [currency] nvarchar(255),
  [exchange_rate] decimal(10,4),
  [notes] nvarchar(MAX),
  [created_at] datetime DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT [FK_invoices_companies] FOREIGN KEY ([company_id]) REFERENCES [companies]([company_id])
)
GO

-- ============ WORK ORDERS ============
-- El mecanico vive a nivel de servicio (work_order_services.mechanic_id), no de orden.
CREATE TABLE [work_orders] (
  [work_order_id] INT IDENTITY(1,1) PRIMARY KEY,
  [vehicle_id] INT NOT NULL,
  [company_id] INT NULL,  -- Snapshot de quien tenia el vehiculo
  [rental_id] INT NULL,   -- Vincula Entrega/Devolucion al contrato
  [invoice_id] INT NULL,
  [type] nvarchar(255) NOT NULL,
  -- Flujo simple. Si luego hay presupuesto/aprobacion, agregar 'Presupuestado','Aprobado' al CHECK.
  [current_status] nvarchar(255) NOT NULL DEFAULT N'Recibido',
  [reported_issue] nvarchar(MAX) NULL, -- Motivo de ingreso / trabajo a realizar
  [notes] nvarchar(MAX) NULL,
  [created_by] INT NULL,
  [dropoff_driver_name] nvarchar(255),
  [pickup_driver_name] nvarchar(255),
  [dropoff_signature_url] nvarchar(255),
  [pickup_signature_url] nvarchar(255),
  [entry_timestamp] datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  [exit_timestamp] datetime NULL, -- Se llena al entregar
  [total_internal_cost] decimal(12,2), -- Suma de partes + servicios; la calcula la app
  [total_billed_price] decimal(12,2),
  CONSTRAINT [CK_WO_Type] CHECK ([type] IN (N'Preventivo', N'Correctivo', N'Choque', N'Entrega', N'Devolucion')),
  CONSTRAINT [CK_WO_Status] CHECK ([current_status] IN (N'Recibido', N'En proceso', N'Listo', N'Entregado', N'Cancelado')),
  CONSTRAINT [CK_WO_Delivered_Exit] CHECK ([current_status] <> N'Entregado' OR [exit_timestamp] IS NOT NULL),
  CONSTRAINT [FK_WO_CreatedBy] FOREIGN KEY ([created_by]) REFERENCES [users]([user_id]),
  CONSTRAINT [FK_WO_Vehicle] FOREIGN KEY ([vehicle_id]) REFERENCES [vehicles]([vehicle_id]),
  CONSTRAINT [FK_WO_Company] FOREIGN KEY ([company_id]) REFERENCES [companies]([company_id]),
  CONSTRAINT [FK_WO_Rental]  FOREIGN KEY ([rental_id])  REFERENCES [vehicle_rentals]([id]),
  CONSTRAINT [FK_WO_Invoice] FOREIGN KEY ([invoice_id]) REFERENCES [invoices]([id])
)
GO

-- ============ MOVIMIENTOS DE INVENTARIO (libro de stock) ============
-- Cada cambio de stock es una fila con signo: entradas (+) y salidas (-). Es inmutable: un error se corrige
-- con otro movimiento 'Ajuste', no editando. inventory_parts.stock_quantity es el saldo, mantenido por trigger.
CREATE TABLE [inventory_movements] (
  [movement_id] INT IDENTITY(1,1) PRIMARY KEY,
  [part_id] INT NOT NULL,
  [quantity] INT NOT NULL,           -- Con signo: + entra, - sale
  [movement_type] nvarchar(20) NOT NULL,
  [unit_cost] decimal(10,2) NULL,    -- Solo en 'Compra': costo pagado por unidad
  [work_order_id] INT NULL,          -- Presente en 'Uso' y 'Devolucion'
  [notes] nvarchar(500) NULL,
  [created_by] INT NULL,
  [created_at] datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT [CK_Movements_Type] CHECK (
       ([movement_type] IN (N'Inicial', N'Compra', N'Devolucion') AND [quantity] > 0)
    OR ([movement_type] = N'Uso' AND [quantity] < 0)
    OR ([movement_type] = N'Ajuste' AND [quantity] <> 0)),
  CONSTRAINT [FK_Movements_Part] FOREIGN KEY ([part_id]) REFERENCES [inventory_parts]([inventory_part_id]),
  CONSTRAINT [FK_Movements_WO] FOREIGN KEY ([work_order_id]) REFERENCES [work_orders]([work_order_id]),
  CONSTRAINT [FK_Movements_User] FOREIGN KEY ([created_by]) REFERENCES [users]([user_id])
)
GO

CREATE INDEX [IX_Movements_Part] ON [inventory_movements]([part_id], [created_at])
GO
CREATE INDEX [IX_Movements_WO] ON [inventory_movements]([work_order_id])
GO

-- Aplica cada movimiento al saldo. Si deja stock negativo, el CHECK de inventory_parts revierte todo.
CREATE TRIGGER [TR_Movements_Apply] ON [inventory_movements] AFTER INSERT AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  UPDATE p SET stock_quantity = p.stock_quantity + m.q
  FROM [inventory_parts] p
  JOIN (SELECT part_id, SUM(quantity) AS q FROM inserted GROUP BY part_id) m ON m.part_id = p.inventory_part_id;
END
GO

CREATE TRIGGER [TR_Movements_Immutable] ON [inventory_movements] AFTER UPDATE, DELETE AS
  THROW 50003, N'Los movimientos de inventario no se editan ni se borran: registra un movimiento de Ajuste.', 1;
GO

-- Diferencias entre el saldo y la suma de movimientos (debe estar vacia). Detecta cambios directos a stock_quantity.
CREATE VIEW [inventory_stock_check] AS
SELECT p.inventory_part_id, p.name, p.stock_quantity, ISNULL(SUM(m.quantity), 0) AS ledger_quantity
FROM [inventory_parts] p
LEFT JOIN [inventory_movements] m ON m.part_id = p.inventory_part_id
GROUP BY p.inventory_part_id, p.name, p.stock_quantity
HAVING p.stock_quantity <> ISNULL(SUM(m.quantity), 0)
GO

CREATE TABLE [work_order_parts] (
  [work_order_part_id] INT IDENTITY(1,1) PRIMARY KEY,
  [work_order_id] INT NOT NULL,
  [part_id] INT NOT NULL,
  [quantity] INT NOT NULL,
  [total_unit_cost] decimal(10,2) NOT NULL, -- Snapshot del costo al usarlo
  [unit_price] decimal(10,2) NOT NULL,      -- Snapshot del precio al usarlo
  CONSTRAINT [CK_WOParts_Qty] CHECK ([quantity] > 0),
  CONSTRAINT [CK_WOParts_Amounts] CHECK ([total_unit_cost] >= 0 AND [unit_price] >= 0),
  CONSTRAINT [FK_WOParts_WO] FOREIGN KEY ([work_order_id]) REFERENCES [work_orders]([work_order_id]),
  CONSTRAINT [FK_WOParts_Inventory] FOREIGN KEY ([part_id]) REFERENCES [inventory_parts]([inventory_part_id])
)
GO

-- Agregar un repuesto a una orden registra un movimiento 'Uso'; editarlo o quitarlo registra la diferencia.
-- Si no hay stock, el CHECK de inventory_parts falla y todo se revierte.
-- Ordenes cerradas: Entregado no admite ningun cambio; Cancelado solo admite quitar repuestos (para devolver stock).
CREATE TRIGGER [TR_WOParts_Stock] ON [work_order_parts] AFTER INSERT, UPDATE, DELETE AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  IF EXISTS (SELECT 1 FROM inserted i JOIN [work_orders] w ON w.work_order_id = i.work_order_id
             WHERE w.current_status IN (N'Entregado', N'Cancelado'))
     OR EXISTS (SELECT 1 FROM deleted d JOIN [work_orders] w ON w.work_order_id = d.work_order_id
                WHERE w.current_status = N'Entregado')
    THROW 50001, N'La orden esta cerrada (Entregado/Cancelado): no se pueden modificar sus repuestos.', 1;
  -- Registra la diferencia como movimiento; TR_Movements_Apply actualiza el saldo.
  INSERT INTO [inventory_movements] ([part_id], [quantity], [movement_type], [work_order_id])
  SELECT part_id, -used, CASE WHEN used > 0 THEN N'Uso' ELSE N'Devolucion' END, work_order_id
  FROM (
    SELECT work_order_id, part_id, SUM(qty) AS used FROM (
      SELECT work_order_id, part_id, quantity AS qty FROM inserted
      UNION ALL
      SELECT work_order_id, part_id, -quantity FROM deleted
    ) x GROUP BY work_order_id, part_id HAVING SUM(qty) <> 0
  ) d;
END
GO

-- Una sola orden abierta por vehiculo
CREATE UNIQUE INDEX [UX_WO_OneOpenPerVehicle] ON [work_orders]([vehicle_id])
  WHERE [current_status] IN (N'Recibido', N'En proceso', N'Listo')
GO

CREATE TABLE [work_order_services] (
  [work_order_service_id] INT IDENTITY(1,1) PRIMARY KEY,
  [work_order_id] INT NOT NULL,
  [mechanic_id] INT NULL,
  [description] nvarchar(255),
  [internal_cost] decimal(10,2),
  [price] decimal(10,2),
  CONSTRAINT [CK_WOServices_Amounts] CHECK ([internal_cost] >= 0 AND [price] >= 0),
  CONSTRAINT [FK_WOServices_WO] FOREIGN KEY ([work_order_id]) REFERENCES [work_orders]([work_order_id]),
  CONSTRAINT [FK_WOServices_Mechanic] FOREIGN KEY ([mechanic_id]) REFERENCES [mechanics]([mechanic_id])
)
GO

-- Mismas reglas de orden cerrada que los repuestos
CREATE TRIGGER [TR_WOServices_Closed] ON [work_order_services] AFTER INSERT, UPDATE, DELETE AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  IF EXISTS (SELECT 1 FROM inserted i JOIN [work_orders] w ON w.work_order_id = i.work_order_id
             WHERE w.current_status IN (N'Entregado', N'Cancelado'))
     OR EXISTS (SELECT 1 FROM deleted d JOIN [work_orders] w ON w.work_order_id = d.work_order_id
                WHERE w.current_status = N'Entregado')
    THROW 50002, N'La orden esta cerrada (Entregado/Cancelado): no se pueden modificar sus servicios.', 1;
END
GO

-- ============ INSPECCION (CHECKLIST DINAMICO) ============
CREATE TABLE [inspection_categories] (
  [category_id] INT IDENTITY(1,1) PRIMARY KEY,
  [name] nvarchar(100) NOT NULL UNIQUE,
  [sort_order] INT NOT NULL DEFAULT 0,
  [is_active] BIT NOT NULL DEFAULT 1
)
GO

CREATE TABLE [inspection_checklist_items] (
  [item_id] INT IDENTITY(1,1) PRIMARY KEY,
  [name] nvarchar(255) NOT NULL,
  [input_type] nvarchar(50) NOT NULL,
  -- Solo para input_type 'select' o 'radio'; NULL en los demas.
  -- Formato: arreglo JSON de strings, ej: ["Limpio","Sucio","Requiere lavado profundo"]
  -- JSON y no CSV porque una opcion puede contener comas ("Rayon, leve"). El frontend usa JSON.parse(options).
  -- Se guarda el texto tal cual se muestra; el valor elegido va en vehicle_inspection_results.value.
  [options] nvarchar(MAX) NULL,
  [category_id] INT NULL,
  [is_required] BIT NOT NULL DEFAULT 1,
  [is_active] BIT NOT NULL DEFAULT 1,
  CONSTRAINT [CK_Items_InputType] CHECK ([input_type] IN (N'text', N'textarea', N'number', N'checkbox', N'date', N'select', N'radio')),
  CONSTRAINT [CK_Items_Options] CHECK (
    ([input_type] IN (N'select', N'radio') AND ISJSON([options]) = 1 AND LEFT(LTRIM([options]), 1) = N'[')
    OR ([input_type] NOT IN (N'select', N'radio') AND [options] IS NULL)),
  CONSTRAINT [FK_Items_Category] FOREIGN KEY ([category_id]) REFERENCES [inspection_categories]([category_id])
)
GO

-- Valores por defecto (editables desde la app)
INSERT INTO [inspection_categories] ([name], [sort_order]) VALUES
 (N'Pintura', 1), (N'Carrocería', 2), (N'Mecánico', 3), (N'Interior', 4),
 (N'Llantas', 5), (N'Luces', 6), (N'Fluidos', 7), (N'Documentos y accesorios', 8)
GO

INSERT INTO [inspection_checklist_items] ([name], [input_type], [category_id], [is_required])
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
JOIN [inspection_categories] c ON c.name = i.category
GO

-- Ejemplo de select con options (arreglo JSON de strings)
INSERT INTO [inspection_checklist_items] ([name], [input_type], [options], [category_id], [is_required])
SELECT N'Estado de limpieza', 'select', N'["Limpio","Sucio","Requiere lavado profundo"]', category_id, 1
FROM [inspection_categories] WHERE name = N'Interior'
GO

CREATE TABLE [vehicle_inspections] (
  [vehicle_inspection_id] INT IDENTITY(1,1) PRIMARY KEY,
  [work_order_id] INT NOT NULL,
  [inspection_type] nvarchar(50) NOT NULL CHECK ([inspection_type] IN (N'Entrada', N'Salida')),
  [mileage] INT, -- Km exacto al entregar/recibir
  [inspection_notes] nvarchar(MAX),
  [damage_map_url] nvarchar(255), -- Croquis con danos marcados
  [created_at] datetime DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT [UQ_Inspections_WO_Type] UNIQUE ([work_order_id], [inspection_type]), -- una Entrada y una Salida por orden
  CONSTRAINT [UQ_Inspections_Id_WO] UNIQUE ([vehicle_inspection_id], [work_order_id]), -- permite la FK compuesta de las fotos
  CONSTRAINT [FK_Inspections_WO] FOREIGN KEY ([work_order_id]) REFERENCES [work_orders]([work_order_id])
)
GO

-- Fotos de la orden. Para Entrega/Devolucion son evidencia: se ligan a la inspeccion correspondiente.
CREATE TABLE [work_order_photos] (
  [work_order_photo_id] INT IDENTITY(1,1) PRIMARY KEY,
  [work_order_id] INT NOT NULL,
  [vehicle_inspection_id] INT NULL, -- NULL = foto de la orden sin inspeccion (ej. reparaciones)
  [stage] nvarchar(20) NOT NULL,    -- Antes, Despues, Otro (documentos, danos previos, etc.)
  [photo_url] nvarchar(255) NOT NULL,
  [category] nvarchar(255),         -- Zona del vehiculo: frente, lateral izquierdo, tablero...
  [uploaded_at] datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT [CK_WOPhotos_Stage] CHECK ([stage] IN (N'Antes', N'Despues', N'Otro')),
  CONSTRAINT [FK_WOPhotos_WO] FOREIGN KEY ([work_order_id]) REFERENCES [work_orders]([work_order_id]),
  -- Compuesta: la inspeccion debe pertenecer a la misma orden que la foto (no se valida si es NULL)
  CONSTRAINT [FK_WOPhotos_Inspection] FOREIGN KEY ([vehicle_inspection_id], [work_order_id])
    REFERENCES [vehicle_inspections]([vehicle_inspection_id], [work_order_id])
)
GO

CREATE INDEX [IX_WOPhotos_WO] ON [work_order_photos]([work_order_id])
GO

CREATE TABLE [vehicle_inspection_results] (
  [result_id] INT IDENTITY(1,1) PRIMARY KEY,
  [vehicle_inspection_id] INT NOT NULL,
  [item_id] INT NOT NULL,
  [value] nvarchar(MAX),
  [notes] nvarchar(500),
  CONSTRAINT [UQ_Results_Inspection_Item] UNIQUE ([vehicle_inspection_id], [item_id]),
  CONSTRAINT [FK_Results_Inspection] FOREIGN KEY ([vehicle_inspection_id]) REFERENCES [vehicle_inspections]([vehicle_inspection_id]),
  CONSTRAINT [FK_Results_ChecklistItem] FOREIGN KEY ([item_id]) REFERENCES [inspection_checklist_items]([item_id])
)
GO

-- ============ DESCRIPCIONES (extended properties) ============
DECLARE @d TABLE (t sysname, c sysname NULL, v nvarchar(500));
INSERT INTO @d VALUES
 ('users', 'role', 'Ej: superadmin, billing, inventory_manager'),
 ('vehicles', 'company_id', 'Quien lo tiene AHORA. Null = Disponible'),
 ('vehicles', 'insurance_expiration_date', 'Vencimiento del seguro'),
 ('vehicles', 'mechanical_inspection_expiration', 'Inspeccion mecanica (Revisado)'),
 ('vehicles', 'emissions_inspection_expiration', 'Emision de gases'),
 ('vehicles', 'status', 'Ej: Disponible, Alquilado, En Taller'),
 ('vehicle_rentals', NULL, 'Acuerdo comercial. Detona Ordenes de Trabajo de Entrega y Devolucion.'),
 ('vehicle_rentals', 'start_date', 'Fecha inicio del alquiler'),
 ('vehicle_rentals', 'expected_end_date', 'Nullable. Si es Nulo, el alquiler es INDEFINIDO'),
 ('vehicle_rentals', 'actual_end_date', 'Se llena cuando el vehiculo es devuelto fisicamente'),
 ('vehicle_rentals', 'billing_period', 'Ej: Diario, Mensual, Anual'),
 ('vehicle_rentals', 'rate_amount', 'Tarifa pactada'),
 ('vehicle_rentals', 'status', 'Activo, Finalizado, Cancelado'),
 ('vehicle_rentals', 'contract_url', 'PDF del contrato firmado (Opcional)'),
 ('work_orders', 'company_id', 'Snapshot en la bitacora'),
 ('work_orders', 'rental_id', 'Nullable. Vincula la Entrega/Devolucion al contrato'),
 ('work_orders', 'invoice_id', 'Nullable'),
 ('work_orders', 'type', 'Preventivo, Correctivo, Choque, Entrega, Devolucion'),
 ('work_order_services', 'mechanic_id', 'Nullable'),
 ('vehicle_inspections', 'mileage', 'Kilometraje exacto al momento de entregar/recibir'),
 ('vehicle_inspections', 'damage_map_url', 'URL de la imagen del croquis con los danos marcados');

DECLARE @t sysname, @c sysname, @v nvarchar(500);
DECLARE cur CURSOR LOCAL FAST_FORWARD FOR SELECT t, c, v FROM @d;
OPEN cur; FETCH NEXT FROM cur INTO @t, @c, @v;
WHILE @@FETCH_STATUS = 0
BEGIN
  IF @c IS NULL
    EXEC sp_addextendedproperty @name = N'MS_Description', @value = @v,
      @level0type = N'Schema', @level0name = 'dbo', @level1type = N'Table', @level1name = @t;
  ELSE
    EXEC sp_addextendedproperty @name = N'MS_Description', @value = @v,
      @level0type = N'Schema', @level0name = 'dbo', @level1type = N'Table', @level1name = @t,
      @level2type = N'Column', @level2name = @c;
  FETCH NEXT FROM cur INTO @t, @c, @v;
END
CLOSE cur; DEALLOCATE cur;
GO

/* ============ RESET (descomentar SOLO para borrar todo) ============
DROP VIEW IF EXISTS inventory_stock_check;
DROP TABLE IF EXISTS inventory_movements, vehicle_inspection_results, vehicle_inspections, inspection_checklist_items, inspection_categories,
  work_order_photos, work_order_services, work_order_parts, work_orders, invoices, vehicle_rentals,
  inventory_parts, vehicle_attachments, vehicles, models, brands, companies, mechanics,
  mechanic_specialties, users;
*/
