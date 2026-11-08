-- Migracion 001: integridad de ordenes cerradas, montos de repuestos y fecha de entrega.
-- Para una BD que YA tiene datos y el esquema actual de querys.sql (con TR_WOParts_Stock).
-- Todo corre en UNA transaccion: si algo falla, no se aplica nada. No modifica ni inventa datos:
-- si hay filas que violarian las nuevas reglas, se detiene y dice cuantas son.
-- Se puede ejecutar mas de una vez.
USE [VehicleRentalDB]
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.TR_WOParts_Stock', N'TR') IS NULL
  THROW 50000, N'Falta el esquema base (TR_WOParts_Stock). Aplica primero el esquema actual.', 1;

-- ---- Preflight: filas existentes que violarian las nuevas reglas ----
DECLARE @n INT, @msg nvarchar(400);

SELECT @n = COUNT(*) FROM dbo.work_order_parts WHERE total_unit_cost IS NULL OR unit_price IS NULL;
IF @n > 0
BEGIN
  SET @msg = CONCAT(@n, N' filas de work_order_parts tienen total_unit_cost o unit_price NULL. Completalas antes de migrar.');
  THROW 50010, @msg, 1;
END

SELECT @n = COUNT(*) FROM dbo.work_order_parts WHERE total_unit_cost < 0 OR unit_price < 0;
IF @n > 0
BEGIN
  SET @msg = CONCAT(@n, N' filas de work_order_parts tienen montos negativos.');
  THROW 50011, @msg, 1;
END

SELECT @n = COUNT(*) FROM dbo.work_order_services WHERE internal_cost < 0 OR price < 0;
IF @n > 0
BEGIN
  SET @msg = CONCAT(@n, N' filas de work_order_services tienen montos negativos.');
  THROW 50012, @msg, 1;
END

SELECT @n = COUNT(*) FROM dbo.work_orders WHERE current_status = N'Entregado' AND exit_timestamp IS NULL;
IF @n > 0
BEGIN
  SET @msg = CONCAT(@n, N' ordenes estan Entregado sin exit_timestamp. Asignales la fecha de salida antes de migrar.');
  THROW 50013, @msg, 1;
END

-- ---- Montos de repuestos obligatorios y no negativos ----
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.work_order_parts') AND name = N'total_unit_cost' AND is_nullable = 1)
  ALTER TABLE dbo.work_order_parts ALTER COLUMN total_unit_cost decimal(10,2) NOT NULL;
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.work_order_parts') AND name = N'unit_price' AND is_nullable = 1)
  ALTER TABLE dbo.work_order_parts ALTER COLUMN unit_price decimal(10,2) NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_WOParts_Amounts')
  ALTER TABLE dbo.work_order_parts ADD CONSTRAINT CK_WOParts_Amounts CHECK (total_unit_cost >= 0 AND unit_price >= 0);

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_WOServices_Amounts')
  ALTER TABLE dbo.work_order_services ADD CONSTRAINT CK_WOServices_Amounts CHECK (internal_cost >= 0 AND price >= 0);

-- ---- Entregado exige fecha de salida ----
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_WO_Delivered_Exit')
  ALTER TABLE dbo.work_orders ADD CONSTRAINT CK_WO_Delivered_Exit CHECK (current_status <> N'Entregado' OR exit_timestamp IS NOT NULL);

-- ---- Ordenes cerradas: Entregado no admite cambios; Cancelado solo permite quitar repuestos ----
-- CREATE OR ALTER TRIGGER debe ir solo en su lote, por eso va dentro de EXEC (sigue en la transaccion).
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
  UPDATE p SET stock_quantity = p.stock_quantity - d.used
  FROM dbo.inventory_parts p
  JOIN (
    SELECT part_id, SUM(qty) AS used FROM (
      SELECT part_id, quantity AS qty FROM inserted
      UNION ALL
      SELECT part_id, -quantity FROM deleted
    ) x GROUP BY part_id
  ) d ON d.part_id = p.inventory_part_id;
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

COMMIT TRANSACTION;
GO
