-- Migracion 002: libro de movimientos de inventario.
-- Para una BD con datos y la migracion 001 aplicada. Una sola transaccion: si falla, no se aplica nada.
-- Saldo inicial: por cada repuesto con stock > 0 crea un movimiento 'Inicial' igual al stock actual.
-- El historial de usos anteriores NO se reconstruye (antes solo se restaba el saldo, sin registro).
-- Se puede ejecutar mas de una vez: el saldo inicial solo se crea la primera vez.
USE [VehicleRentalDB]
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.TR_WOServices_Closed', N'TR') IS NULL
  THROW 50000, N'Falta la migracion 001 (TR_WOServices_Closed). Aplicala primero.', 1;

IF OBJECT_ID(N'dbo.inventory_movements', N'U') IS NULL
BEGIN
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
  CREATE INDEX IX_Movements_Part ON dbo.inventory_movements(part_id, created_at);
  CREATE INDEX IX_Movements_WO ON dbo.inventory_movements(work_order_id);

  -- Aun no existe TR_Movements_Apply, asi que el saldo no se duplica.
  INSERT INTO dbo.inventory_movements (part_id, quantity, movement_type, notes)
  SELECT inventory_part_id, stock_quantity, N'Inicial', N'Saldo al migrar a movimientos'
  FROM dbo.inventory_parts WHERE stock_quantity > 0;
END

-- CREATE OR ALTER debe ir solo en su lote: va dentro de EXEC (sigue en la transaccion).
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
CREATE OR ALTER VIEW dbo.inventory_stock_check AS
SELECT p.inventory_part_id, p.name, p.stock_quantity, ISNULL(SUM(m.quantity), 0) AS ledger_quantity
FROM dbo.inventory_parts p
LEFT JOIN dbo.inventory_movements m ON m.part_id = p.inventory_part_id
GROUP BY p.inventory_part_id, p.name, p.stock_quantity
HAVING p.stock_quantity <> ISNULL(SUM(m.quantity), 0)');

COMMIT TRANSACTION;
GO
