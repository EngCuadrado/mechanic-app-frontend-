/* Datos de prueba para DESARROLLO LOCAL (VehicleRentalDB).
   - Se niega a correr en otra base o si ya hay datos (no duplica).
   - Todo o nada (transacción + XACT_ABORT).
   - El stock entra como movimientos 'Inicial'/'Compra' y los repuestos de las órdenes se insertan con la orden abierta,
     así los triggers generan 'Uso'/'Devolucion' igual que la app. Nunca se escribe stock_quantity.
   - Las horas de las órdenes van en hora de Managua (UTC-6), como WorkOrderRules.Now() del backend.
   Nombres, empresas, placas y teléfonos son ficticios. */
SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON; -- lo exige el índice filtrado UX_WO_OneOpenPerVehicle (sqlcmd arranca en OFF)
SET ANSI_NULLS ON;

IF DB_NAME() <> N'VehicleRentalDB'
BEGIN RAISERROR(N'Este seed solo corre en VehicleRentalDB (local).', 16, 1); RETURN; END;
IF EXISTS (SELECT 1 FROM brands) OR EXISTS (SELECT 1 FROM vehicles) OR EXISTS (SELECT 1 FROM inventory_parts) OR EXISTS (SELECT 1 FROM work_orders)
BEGIN RAISERROR(N'La base ya tiene datos: el seed solo corre sobre una base vacía.', 16, 1); RETURN; END;
IF NOT EXISTS (SELECT 1 FROM inspection_checklist_items)
BEGIN RAISERROR(N'Falta el checklist (inspection_checklist_items).', 16, 1); RETURN; END;

DECLARE @user int = (SELECT MIN(user_id) FROM users);
DECLARE @now datetime = DATEADD(HOUR, -6, SYSUTCDATETIME()); -- Managua
DECLARE @sig nvarchar(255) = N'data:image/svg+xml;utf8,<svg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 300 100''><path d=''M20 70 C60 20 80 90 120 50 S190 30 220 60 S270 40 285 55'' fill=''none'' stroke=''%23222'' stroke-width=''4''/></svg>';

BEGIN TRAN;

/* ---------- Catálogos ---------- */
INSERT brands (brand_name) VALUES (N'Toyota'), (N'Nissan'), (N'Hyundai'), (N'Kia'), (N'Mitsubishi'), (N'Suzuki');

INSERT models (brand_id, model_name)
SELECT b.brand_id, v.m FROM (VALUES
  (N'Toyota', N'Hilux'), (N'Toyota', N'Corolla'), (N'Toyota', N'Yaris'), (N'Toyota', N'RAV4'),
  (N'Nissan', N'Frontier'), (N'Nissan', N'Sentra'), (N'Nissan', N'Versa'),
  (N'Hyundai', N'Accent'), (N'Hyundai', N'Tucson'), (N'Hyundai', N'Creta'),
  (N'Kia', N'Rio'), (N'Kia', N'Sportage'), (N'Mitsubishi', N'L200'), (N'Suzuki', N'Swift')
) v(b, m) JOIN brands b ON b.brand_name = v.b;

INSERT companies (name, tax_id, billing_address, contact_email, contact_phone, default_currency) VALUES
  (N'Agroexport del Norte S.A.',   N'J0310000123401', N'Km 12 Carretera Norte, Managua',   N'flota@agronorte.example.com',  N'+505 2233 1101', N'USD'),
  (N'Logística Pacífico S.A.',     N'J0310000234502', N'Rotonda El Güegüense 2c al sur',   N'operaciones@logpac.example.com', N'+505 2255 2202', N'USD'),
  (N'Constructora San Jacinto',    N'J0310000345603', N'Carretera a Masaya Km 8',          N'equipos@sanjacinto.example.com', N'+505 2270 3303', N'NIO'),
  (N'Seguridad Centinela S.A.',    N'J0310000456704', N'Bello Horizonte, Managua',         N'admin@centinela.example.com',  N'+505 2249 4404', N'USD');

INSERT mechanic_specialties (name) VALUES
  (N'Mecánica general'), (N'Frenos y suspensión'), (N'Electricidad automotriz'), (N'Aire acondicionado'), (N'Enderezado y pintura');

INSERT mechanics (first_name, last_name, specialty_id, is_active)
SELECT v.f, v.l, s.specialty_id, v.a FROM (VALUES
  (N'Carlos', N'López', N'Mecánica general', 1), (N'José', N'Martínez', N'Mecánica general', 1),
  (N'Luis', N'Hernández', N'Frenos y suspensión', 1), (N'Marvin', N'Gutiérrez', N'Electricidad automotriz', 1),
  (N'Juan', N'Pérez', N'Aire acondicionado', 1), (N'Óscar', N'Ramírez', N'Enderezado y pintura', 1),
  (N'Kevin', N'Rocha', N'Mecánica general', 0)
) v(f, l, s, a) JOIN mechanic_specialties s ON s.name = v.s;

/* ---------- Vehículos ---------- */
CREATE TABLE #v (k int PRIMARY KEY, plate nvarchar(20), model nvarchar(50), company nvarchar(100) NULL, yr int, km int, status nvarchar(30), id int NULL);
INSERT #v (k, plate, model, company, yr, km, status) VALUES
  (1,  N'M 245-871', N'Hilux',    N'Agroexport del Norte S.A.', 2022,  68450, N'MANTENIMIENTO'),
  (2,  N'M 318-402', N'Frontier', N'Agroexport del Norte S.A.', 2021,  91230, N'MANTENIMIENTO'),
  (3,  N'M 127-556', N'Corolla',  N'Logística Pacífico S.A.',   2023,  35210, N'MANTENIMIENTO'),
  (4,  N'M 409-913', N'Accent',   N'Logística Pacífico S.A.',   2020, 112400, N'MANTENIMIENTO'),
  (5,  N'M 512-064', N'RAV4',     N'Constructora San Jacinto',  2022,  54100, N'MANTENIMIENTO'),
  (6,  N'M 633-287', N'L200',     N'Constructora San Jacinto',  2019, 143900, N'MANTENIMIENTO'),
  (7,  N'M 702-145', N'Tucson',   N'Seguridad Centinela S.A.',  2023,  28760, N'MANTENIMIENTO'),
  (8,  N'M 815-330', N'Yaris',    NULL,                          2021,  77320, N'MANTENIMIENTO'),
  (9,  N'M 920-478', N'Sentra',   N'Seguridad Centinela S.A.',  2020,  98650, N'MANTENIMIENTO'),
  (10, N'M 134-690', N'Versa',    N'Agroexport del Norte S.A.', 2022,  61200, N'ALQUILADO'),
  (11, N'M 256-713', N'Rio',      N'Logística Pacífico S.A.',   2021,  83400, N'ALQUILADO'),
  (12, N'M 367-824', N'Sportage', N'Constructora San Jacinto',  2023,  31800, N'ALQUILADO'),
  (13, N'M 478-935', N'Creta',    N'Seguridad Centinela S.A.',  2022,  47900, N'ALQUILADO'),
  (14, N'M 589-046', N'Hilux',    N'Constructora San Jacinto',  2020, 128300, N'ALQUILADO'),
  (15, N'M 690-157', N'Swift',    NULL,                          2022,  39400, N'DISPONIBLE'),
  (16, N'M 701-268', N'Accent',   NULL,                          2021,  71050, N'DISPONIBLE'),
  (17, N'M 812-379', N'Frontier', NULL,                          2019, 156700, N'FUERA_DE_SERVICIO'),
  (18, N'M 923-480', N'Corolla',  N'Agroexport del Norte S.A.', 2021,  88900, N'ALQUILADO'),
  (19, N'M 034-591', N'Tucson',   NULL,                          2023,  22300, N'DISPONIBLE'),
  (20, N'M 145-602', N'Rio',      N'Logística Pacífico S.A.',   2022,  52600, N'ALQUILADO');

INSERT vehicles (company_id, model_id, plate, vin, chassis_number, year, current_mileage, next_maintenance_date, next_maintenance_mileage,
                 insurance_expiration_date, mechanical_inspection_expiration, emissions_inspection_expiration, status)
SELECT c.company_id, m.model_id, v.plate,
       CONCAT(N'VIN', v.yr, RIGHT(CONCAT(N'00000', v.k * 7919), 6), N'NI'),
       CONCAT(N'CH-', v.yr, N'-', RIGHT(CONCAT(N'0000', v.k * 313), 5)),
       v.yr, v.km,
       DATEADD(DAY, 15 + v.k * 4, CAST(@now AS date)), (v.km / 5000 + 1) * 5000,
       DATEADD(DAY, CASE WHEN v.k IN (4, 12) THEN 10 ELSE 90 + v.k * 9 END, CAST(@now AS date)), -- 2 seguros por vencer
       DATEADD(DAY, 60 + v.k * 11, CAST(@now AS date)),
       DATEADD(DAY, 120 + v.k * 5, CAST(@now AS date)),
       v.status
FROM #v v JOIN models m ON m.model_name = v.model LEFT JOIN companies c ON c.name = v.company;
UPDATE t SET id = x.vehicle_id FROM #v t JOIN vehicles x ON x.plate = t.plate;

/* ---------- Alquileres ---------- */
INSERT vehicle_rentals (vehicle_id, company_id, start_date, expected_end_date, billing_period, rate_amount, status, created_at)
SELECT v.id, x.company_id, DATEADD(DAY, -(30 + v.k * 12), CAST(@now AS date)), DATEADD(DAY, 365 - v.k * 12, CAST(@now AS date)),
       N'Mensual', 650 + (v.k % 5) * 125, N'Activo', DATEADD(DAY, -(30 + v.k * 12), @now)
FROM #v v JOIN vehicles x ON x.vehicle_id = v.id WHERE x.company_id IS NOT NULL;
INSERT vehicle_rentals (vehicle_id, company_id, start_date, expected_end_date, actual_end_date, billing_period, rate_amount, status, created_at)
SELECT v.id, c.company_id, DATEADD(DAY, -300, CAST(@now AS date)), DATEADD(DAY, -60, CAST(@now AS date)), DATEADD(DAY, -45, CAST(@now AS date)),
       N'Mensual', 700, N'Finalizado', DATEADD(DAY, -300, @now)
FROM #v v JOIN companies c ON c.name = N'Seguridad Centinela S.A.' WHERE v.k IN (15, 16);

/* ---------- Repuestos (stock solo por movimientos) ---------- */
CREATE TABLE #pt (code nvarchar(10) PRIMARY KEY, name nvarchar(100), cost decimal(10,2), price decimal(10,2), minq int, ini int, buy int, active bit);
INSERT #pt VALUES
  (N'AC530',  N'Aceite 5W-30 sintético (litro)',        6.50,  11.00, 12, 40, 24, 1),
  (N'AC1540', N'Aceite 15W-40 diésel (litro)',          4.80,   8.50, 12, 30, 20, 1),
  (N'FATOY',  N'Filtro de aceite Toyota',               5.20,   9.50,  5, 12,  6, 1),
  (N'FANIS',  N'Filtro de aceite Nissan',               4.90,   9.00,  5, 10,  0, 1),
  (N'FAIHIL', N'Filtro de aire Hilux',                  9.00,  16.00,  3,  6,  0, 1),
  (N'FAICOR', N'Filtro de aire Corolla',                7.50,  13.00,  3,  5,  0, 1),
  (N'FCAB',   N'Filtro de cabina (A/C)',                6.00,  11.00,  4,  8,  0, 1),
  (N'FCOMB',  N'Filtro de combustible diésel',         12.00,  21.00,  3,  4,  0, 1),
  (N'PFHIL',  N'Pastillas de freno delanteras Hilux',  28.00,  48.00,  2,  6,  0, 1),
  (N'PFCOR',  N'Pastillas de freno delanteras Corolla',22.00,  38.00,  2,  5,  0, 1),
  (N'ZAPT',   N'Zapatas de freno traseras',            18.00,  32.00,  2,  4,  0, 1),
  (N'DISCO',  N'Disco de freno delantero',             35.00,  60.00,  4,  3,  0, 1), -- bajo mínimo
  (N'DOT4',   N'Líquido de frenos DOT4 (500 ml)',       4.50,   8.00,  4, 10,  0, 1),
  (N'REFRI',  N'Refrigerante (galón)',                  9.00,  16.00,  3,  8,  0, 1),
  (N'BAT60',  N'Batería 12V 60Ah',                     85.00, 130.00,  2,  2,  0, 1), -- queda bajo mínimo
  (N'BUJIA',  N'Bujía iridium',                         7.50,  13.00,  8, 16,  0, 1),
  (N'BANDA',  N'Banda de accesorios',                  15.00,  26.00,  2,  4,  0, 1),
  (N'AMORT',  N'Amortiguador delantero',               45.00,  78.00,  2,  4,  0, 1),
  (N'TERM',   N'Terminal de dirección',                14.00,  25.00,  2,  4,  0, 1),
  (N'LL265',  N'Llanta 265/65 R17',                   120.00, 175.00,  4,  8,  0, 1),
  (N'LL195',  N'Llanta 195/65 R15',                    68.00, 100.00,  4, 12,  0, 1),
  (N'H4',     N'Bombillo H4',                           3.50,   7.00,  4, 10,  0, 1),
  (N'R134',   N'Gas refrigerante R134a (lata)',         8.00,  15.00,  3,  6,  4, 1),
  (N'PLUM',   N'Plumillas limpiaparabrisas (par)',      9.00,  16.00,  3,  6,  0, 1),
  (N'EMBL2',  N'Kit de embrague L200',                180.00, 260.00,  1,  0,  0, 0); -- inactivo, sin stock

INSERT inventory_parts (name, unit_cost, tax_cost, total_unit_cost, base_price, currency, min_stock_alert, is_active)
SELECT name, cost, ROUND(cost * 0.15, 2), cost + ROUND(cost * 0.15, 2), price, N'USD', minq, active FROM #pt;

INSERT inventory_movements (part_id, quantity, movement_type, unit_cost, notes, created_by, created_at)
SELECT p.inventory_part_id, t.ini, N'Inicial', t.cost, N'Inventario inicial', @user, DATEADD(DAY, -40, @now)
FROM #pt t JOIN inventory_parts p ON p.name = t.name WHERE t.ini > 0;
INSERT inventory_movements (part_id, quantity, movement_type, unit_cost, notes, created_by, created_at)
SELECT p.inventory_part_id, t.buy, N'Compra', t.cost, N'Compra a proveedor', @user, DATEADD(DAY, -10, @now)
FROM #pt t JOIN inventory_parts p ON p.name = t.name WHERE t.buy > 0;
INSERT inventory_movements (part_id, quantity, movement_type, notes, created_by, created_at)
SELECT p.inventory_part_id, -1, N'Ajuste', N'Conteo físico: 1 bombillo dañado', @user, DATEADD(DAY, -5, @now)
FROM inventory_parts p WHERE p.name = N'Bombillo H4';

/* ---------- Órdenes de trabajo ----------
   hrs = horas desde la entrada; out = horas desde la salida (Entregado). entry = recepción completa (inspección + firma). */
CREATE TABLE #o (k int PRIMARY KEY, vk int, type nvarchar(20), final nvarchar(20), issue nvarchar(100), hrs int, out int NULL,
                 dropoff nvarchar(100), pickup nvarchar(100) NULL, notes nvarchar(300) NULL, entry bit, rental bit, id int NULL);
INSERT #o (k, vk, type, final, issue, hrs, out, dropoff, pickup, notes, entry, rental) VALUES
  -- historial (cerradas)
  (1,  10, N'Preventivo', N'Entregado',  N'Mantenimiento preventivo', 624, 600, N'Ana Morales',     N'Ana Morales',     NULL, 1, 0),
  (2,  11, N'Correctivo', N'Entregado',  N'Frenos',                   504, 478, N'Pedro Castillo',  N'Pedro Castillo',  N'Chillido al frenar', 1, 0),
  (3,  12, N'Preventivo', N'Entregado',  N'Mantenimiento preventivo', 432, 410, N'Ramón Úbeda',     N'Silvia Úbeda',    NULL, 1, 0),
  (4,   1, N'Correctivo', N'Entregado',  N'Suspensión',               360, 330, N'Mario Téllez',    N'Mario Téllez',    N'Golpeteo en la parte delantera', 1, 0),
  (5,  13, N'Choque',     N'Entregado',  N'Choque',                   288, 170, N'Ernesto Ruiz',    N'Ernesto Ruiz',    N'Golpe en puerta trasera izquierda', 1, 0),
  (6,  14, N'Correctivo', N'Cancelado',  N'Motor',                    216, NULL, N'Félix Obando',   NULL,               N'La empresa decidió llevarlo a la agencia', 1, 0),
  (7,   3, N'Preventivo', N'Entregado',  N'Mantenimiento preventivo', 144, 140, N'Karla Dávila',    N'Karla Dávila',    NULL, 1, 0),
  (8,  18, N'Correctivo', N'Entregado',  N'Aire acondicionado',        72,  52, N'Henry Sequeira',  N'Henry Sequeira',  N'No enfría', 1, 0),
  (9,  20, N'Entrega',    N'Entregado',  N'Revisión general',          50,  46, N'Taller',          N'Lucía Mendoza',   N'Revisión antes de entregar en alquiler', 1, 1),
  -- abiertas
  (10,  1, N'Correctivo', N'En proceso', N'Frenos',                    30, NULL, N'Mario Téllez',   NULL, N'Pedal largo', 1, 0),            -- atrasada
  (11,  2, N'Preventivo', N'En proceso', N'Mantenimiento preventivo',   5, NULL, N'Jorge Lacayo',   NULL, NULL, 1, 0),
  (12,  3, N'Correctivo', N'Listo',      N'Eléctrico',                 28, NULL, N'Karla Dávila',   NULL, N'No arranca en las mañanas', 1, 0),
  (13,  4, N'Correctivo', N'Recibido',   N'Motor',                      2, NULL, N'Roberto Cruz',   NULL, N'Pierde potencia en subida', 1, 0),
  (14,  5, N'Choque',     N'En proceso', N'Choque',                    72, NULL, N'Byron Zeledón',  NULL, N'Golpe en bumper y guardafango delantero derecho', 1, 0),
  (15,  6, N'Correctivo', N'Recibido',   N'Revisión general',           1, NULL, N'Denis Arana',    NULL, NULL, 0, 0),                    -- recepción incompleta
  (16,  7, N'Preventivo', N'Listo',      N'Mantenimiento preventivo',   8, NULL, N'Iris Membreño',  NULL, NULL, 1, 0),
  (17,  8, N'Correctivo', N'En proceso', N'Llantas',                    3, NULL, N'Taller',         NULL, N'Llanta delantera con desgaste irregular', 1, 0),
  (18,  9, N'Correctivo', N'En proceso', N'Aire acondicionado',        50, NULL, N'Wilber Soza',    NULL, N'Sale aire caliente', 1, 0);

-- Servicios: internal_cost > 0 solo en trabajos externos (Enderezado, Pintura), como hace la UI.
CREATE TABLE #s (ok int, descr nvarchar(100), mech nvarchar(50) NULL, cost decimal(10,2), price decimal(10,2));
INSERT #s VALUES
  (1, N'Cambio de aceite', N'Carlos', 0, 25), (1, N'Cambio de filtros', N'Carlos', 0, 15),
  (2, N'Frenos', N'Luis', 0, 45),
  (3, N'Cambio de aceite', N'José', 0, 25), (3, N'Cambio de filtros', N'José', 0, 15),
  (4, N'Suspensión', N'Luis', 0, 60), (4, N'Alineación y balanceo', N'Luis', 0, 30),
  (5, N'Enderezado', N'Óscar', 120, 220), (5, N'Pintura', N'Óscar', 150, 280),
  (6, N'Diagnóstico eléctrico', N'Marvin', 0, 20),
  (7, N'Cambio de aceite', N'Carlos', 0, 25), (7, N'Cambio de filtros', N'Carlos', 0, 15),
  (8, N'Aire acondicionado', N'Juan', 0, 55),
  (9, N'Otro servicio', N'José', 0, 20),
  (10, N'Frenos', N'Luis', 0, 45),
  (11, N'Cambio de aceite', N'Carlos', 0, 25), (11, N'Cambio de filtros', NULL, 0, 15),
  (12, N'Diagnóstico eléctrico', N'Marvin', 0, 20),
  (14, N'Enderezado', N'Óscar', 90, 180), (14, N'Pintura', NULL, 110, 210),
  (16, N'Cambio de aceite', N'José', 0, 25), (16, N'Cambio de filtros', N'José', 0, 15), (16, N'Frenos', N'Luis', 0, 45),
  (17, N'Llantas', N'José', 0, 15), (17, N'Alineación y balanceo', N'Luis', 0, 30),
  (18, N'Aire acondicionado', N'Juan', 0, 55);

CREATE TABLE #p (ok int, code nvarchar(10), qty int);
INSERT #p VALUES
  (1, N'AC530', 4), (1, N'FANIS', 1),
  (2, N'ZAPT', 1), (2, N'DOT4', 1),
  (3, N'AC530', 5), (3, N'FAICOR', 1), (3, N'FCAB', 1),
  (4, N'AMORT', 2), (4, N'TERM', 1),
  (6, N'BUJIA', 4), (6, N'BANDA', 1), -- se quitan al cancelar
  (7, N'AC530', 4), (7, N'FATOY', 1), (7, N'FAICOR', 1),
  (8, N'R134', 2), (8, N'FCAB', 1),
  (9, N'PLUM', 1), (9, N'H4', 2),
  (10, N'PFHIL', 1), (10, N'DISCO', 2), (10, N'DOT4', 2),
  (11, N'AC1540', 7), (11, N'FANIS', 1), (11, N'FCOMB', 1),
  (12, N'BAT60', 1),
  (16, N'AC530', 5), (16, N'FATOY', 1), (16, N'PFCOR', 1),
  (17, N'LL195', 2),
  (18, N'R134', 3), (18, N'FCAB', 1);

DECLARE @k int = 1, @maxk int = (SELECT MAX(k) FROM #o), @id int, @final nvarchar(20);
WHILE @k <= @maxk
BEGIN
  SELECT @final = final FROM #o WHERE k = @k;
  INSERT work_orders (vehicle_id, company_id, rental_id, type, current_status, reported_issue, notes, created_by,
                      dropoff_driver_name, dropoff_signature_url, entry_timestamp)
  SELECT v.id, x.company_id,
         CASE WHEN o.rental = 1 THEN (SELECT MAX(r.id) FROM vehicle_rentals r WHERE r.vehicle_id = v.id) END,
         o.type, CASE WHEN @final = N'Recibido' THEN N'Recibido' ELSE N'En proceso' END, o.issue, o.notes, @user,
         o.dropoff, CASE WHEN o.entry = 1 THEN @sig END, DATEADD(HOUR, -o.hrs, @now)
  FROM #o o JOIN #v v ON v.k = o.vk JOIN vehicles x ON x.vehicle_id = v.id WHERE o.k = @k;
  SET @id = SCOPE_IDENTITY();
  UPDATE #o SET id = @id WHERE k = @k;

  INSERT work_order_services (work_order_id, mechanic_id, description, internal_cost, price)
  SELECT @id, m.mechanic_id, s.descr, s.cost, s.price FROM #s s LEFT JOIN mechanics m ON m.first_name = s.mech WHERE s.ok = @k;

  INSERT work_order_parts (work_order_id, part_id, quantity, total_unit_cost, unit_price) -- trigger: movimiento 'Uso'
  SELECT @id, ip.inventory_part_id, p.qty, ip.total_unit_cost, ip.base_price
  FROM #p p JOIN #pt t ON t.code = p.code JOIN inventory_parts ip ON ip.name = t.name WHERE p.ok = @k;

  IF @final = N'Cancelado' DELETE work_order_parts WHERE work_order_id = @id; -- trigger: movimiento 'Devolucion'

  UPDATE w SET
    total_internal_cost = ISNULL((SELECT SUM(quantity * total_unit_cost) FROM work_order_parts WHERE work_order_id = @id), 0)
                        + ISNULL((SELECT SUM(internal_cost) FROM work_order_services WHERE work_order_id = @id), 0),
    total_billed_price  = ISNULL((SELECT SUM(quantity * unit_price) FROM work_order_parts WHERE work_order_id = @id), 0)
                        + ISNULL((SELECT SUM(price) FROM work_order_services WHERE work_order_id = @id), 0)
  FROM work_orders w WHERE w.work_order_id = @id;

  UPDATE w SET current_status = o.final,
    exit_timestamp = CASE WHEN o.final = N'Entregado' THEN DATEADD(HOUR, -o.out, @now) END,
    pickup_driver_name = o.pickup,
    pickup_signature_url = CASE WHEN o.final = N'Entregado' THEN @sig END
  FROM work_orders w JOIN #o o ON o.id = w.work_order_id WHERE o.k = @k;

  SET @k += 1;
END;

/* ---------- Inspecciones ---------- */
INSERT vehicle_inspections (work_order_id, inspection_type, mileage, inspection_notes, created_at)
SELECT o.id, N'Entrada', v.km - (o.hrs / 24) * 40, o.notes, DATEADD(MINUTE, 10, DATEADD(HOUR, -o.hrs, @now))
FROM #o o JOIN #v v ON v.k = o.vk WHERE o.entry = 1;
INSERT vehicle_inspections (work_order_id, inspection_type, mileage, inspection_notes, created_at)
SELECT o.id, N'Salida', v.km - (o.hrs / 24) * 40 + 3, N'Prueba de manejo OK', DATEADD(MINUTE, -15, DATEADD(HOUR, -o.out, @now))
FROM #o o JOIN #v v ON v.k = o.vk WHERE o.final = N'Entregado';

-- Ítems en "No" en la Entrada, según el motivo de cada orden.
CREATE TABLE #fail (ok int, item int, note nvarchar(200));
INSERT #fail VALUES
  (2, 8, N'Chillido al frenar'), (4, 7, NULL), (5, 3, N'Puerta trasera izquierda hundida'), (5, 1, N'Rayones en el golpe'),
  (8, 9, N'No enfría'), (10, 8, N'Pedal largo'), (12, 12, N'Testigo de batería encendido'),
  (14, 3, N'Bumper y guardafango delantero derecho'), (14, 1, N'Pintura levantada'), (14, 18, N'Faro derecho quebrado'),
  (17, 15, N'Desgaste irregular delantero'), (18, 9, N'Sale aire caliente');

INSERT vehicle_inspection_results (vehicle_inspection_id, item_id, value, notes)
SELECT i.vehicle_inspection_id, it.item_id,
  CASE it.input_type
    WHEN N'checkbox' THEN CASE WHEN f.item IS NOT NULL THEN N'false' ELSE N'true' END
    WHEN N'number'   THEN CASE WHEN it.name LIKE N'%PSI%' THEN N'32' ELSE CAST(25 + (i.work_order_id * 17) % 76 AS nvarchar) END
    WHEN N'select'   THEN CASE WHEN i.inspection_type = N'Salida' OR i.work_order_id % 3 <> 0 THEN N'Limpio' ELSE N'Sucio' END
    WHEN N'text'     THEN N'Normal'
    ELSE f.note END,
  f.note
FROM vehicle_inspections i
JOIN #o o ON o.id = i.work_order_id
CROSS JOIN inspection_checklist_items it
LEFT JOIN #fail f ON f.ok = o.k AND f.item = it.item_id AND i.inspection_type = N'Entrada'
WHERE it.input_type <> N'textarea' OR f.item IS NOT NULL;

/* ---------- Fotos (URLs de ejemplo) ----------
   category = ángulo de la toma guiada (features/photos/angles.ts): front, back, left, right, dash; extra = foto libre. */
INSERT work_order_photos (work_order_id, vehicle_inspection_id, stage, photo_url, category, uploaded_at)
SELECT i.work_order_id, i.vehicle_inspection_id, N'Antes',
       CONCAT(N'https://picsum.photos/seed/wo', i.work_order_id, N'-', c.cat, N'/800/600'), c.cat, DATEADD(MINUTE, 12, DATEADD(HOUR, -o.hrs, @now))
FROM vehicle_inspections i JOIN #o o ON o.id = i.work_order_id
CROSS JOIN (VALUES (N'front'), (N'back'), (N'left'), (N'right'), (N'dash')) c(cat)
WHERE i.inspection_type = N'Entrada';
INSERT work_order_photos (work_order_id, vehicle_inspection_id, stage, photo_url, category, uploaded_at)
SELECT o.id, NULL, N'Antes', CONCAT(N'https://picsum.photos/seed/wo', o.id, N'-dano/800/600'), N'extra', DATEADD(MINUTE, 14, DATEADD(HOUR, -o.hrs, @now))
FROM #o o WHERE o.type = N'Choque';
INSERT work_order_photos (work_order_id, vehicle_inspection_id, stage, photo_url, category, uploaded_at)
SELECT i.work_order_id, i.vehicle_inspection_id, N'Despues',
       CONCAT(N'https://picsum.photos/seed/wo', i.work_order_id, N'-fin-', c.cat, N'/800/600'), c.cat, i.created_at
FROM vehicle_inspections i
CROSS JOIN (VALUES (N'front'), (N'back'), (N'left'), (N'right')) c(cat)
WHERE i.inspection_type = N'Salida';

COMMIT;

/* ---------- Resumen ---------- */
SELECT (SELECT COUNT(*) FROM vehicles) AS vehiculos, (SELECT COUNT(*) FROM inventory_parts) AS repuestos,
       (SELECT COUNT(*) FROM work_orders) AS ordenes, (SELECT COUNT(*) FROM inventory_movements) AS movimientos,
       (SELECT COUNT(*) FROM vehicle_inspections) AS inspecciones, (SELECT COUNT(*) FROM work_order_photos) AS fotos;
SELECT current_status, COUNT(*) AS n FROM work_orders GROUP BY current_status;
SELECT COUNT(*) AS descuadres_stock FROM inventory_stock_check; -- debe ser 0
