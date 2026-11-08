# Base de datos: órdenes de trabajo

SQL Server (`db_aceb6b_mechanic`). Referencia del esquema nuevo y de las reglas que la propia base aplica.
Para las operaciones de la API, ver [work-orders-api.md](./work-orders-api.md).

## Archivos del repo
| Archivo | Para qué sirve |
|---|---|
| `querys.sql` | Esquema completo, para una instalación **nueva** (solo `CREATE`). No lo ejecutes sobre una base con tablas. |
| `setup_work_orders.sql` | Lo que se ejecutó en este servidor, paso a paso, para agregar work orders a una base que ya tenía datos. |
| `migration_001_*.sql`, `migration_002_*.sql` | **Obsoletas** para este servidor: su contenido ya está en `setup_work_orders.sql`. Traen `USE [VehicleRentalDB]`, que no es esta base. |

## Tablas nuevas
```
work_orders ──< work_order_parts      >── inventory_parts ──< inventory_movements
     │     └─< work_order_services >── mechanics
     │     └─< work_order_photos
     └─< vehicle_inspections ──< vehicle_inspection_results >── inspection_checklist_items >── inspection_categories
work_orders >── vehicles, companies, vehicle_rentals(id), invoices(id), users (created_by)
```
- `work_orders`: tipo (`Preventivo`, `Correctivo`, `Choque`, `Entrega`, `Devolucion`), estado, motivo (`reported_issue`), choferes
  y firmas, fechas de entrada y salida, totales, creador.
- `work_order_parts`: repuesto, cantidad, y `total_unit_cost` / `unit_price` como foto del momento.
- `work_order_services`: servicio, mecánico opcional, costo interno y precio.
- `vehicle_inspections`: una `Entrada` y una `Salida` por orden (único por orden y tipo).
- `vehicle_inspection_results`: una respuesta por ítem y por inspección.
- `work_order_photos`: `stage` (`Antes`/`Despues`/`Otro`), URL, y una inspección opcional que debe ser de la misma orden.
- `inspection_checklist_items.options`: arreglo JSON de textos, obligatorio para `select`/`radio` y `NULL` para el resto.
- `inventory_movements`: libro de stock, cantidad con signo, inmutable.

Las claves de `vehicle_rentals` e `invoices` se llaman `id` (las demás tablas usan `<tabla>_id`).

## Reglas que aplica la base (no hay que duplicarlas en el backend)
| Regla | Mecanismo |
|---|---|
| Estados y tipos válidos | `CHECK` en `work_orders` |
| `Entregado` exige `exit_timestamp` | `CHECK CK_WO_Delivered_Exit` |
| Una orden abierta por vehículo | Índice único filtrado `UX_WO_OneOpenPerVehicle` |
| Stock nunca negativo | `CHECK CK_inventory_parts_stock` |
| Montos de repuestos obligatorios y ≥ 0 | `NOT NULL` + `CHECK` |
| Una Entrada y una Salida por orden | `UNIQUE (work_order_id, inspection_type)` |
| Foto ligada a inspección de la misma orden | FK compuesta |
| Un resultado por ítem y por inspección | `UNIQUE (vehicle_inspection_id, item_id)` |
| `options` válido según `input_type` | `CHECK CK_Items_Options` |

## Triggers
| Trigger | Qué hace |
|---|---|
| `TR_Movements_Apply` | Suma cada movimiento nuevo a `inventory_parts.stock_quantity`. Si queda negativo, se revierte todo. |
| `TR_Movements_Immutable` | Impide `UPDATE` y `DELETE` en `inventory_movements` (error 50003). |
| `TR_WOParts_Stock` | Al insertar, editar o borrar repuestos de una orden, registra el movimiento `Uso` o `Devolucion`. Bloquea cambios si la orden está `Entregado` (todo) o `Cancelado` (solo se permite quitar repuestos). Error 50001. |
| `TR_WOServices_Closed` | Mismas reglas de orden cerrada para los servicios (error 50002). |

Requiere que la opción `nested triggers` del servidor esté activa (lo está: valor 1).

## Qué NO hace la base (lo hace el backend)
- Calcular los totales de la orden.
- Validar el orden de los estados (`Recibido → En proceso → Listo → Entregado`).
- Llenar `created_by` y `exit_timestamp`.
- Registrar compras y correcciones de stock como movimientos.

## Inventario: cómo se mueve el stock
`inventory_parts.stock_quantity` es el saldo, y `inventory_movements` el historial. **No se debe escribir `stock_quantity` a mano**:
se desincroniza del libro. La vista `inventory_stock_check` muestra los repuestos cuyo saldo no coincide con la suma de sus
movimientos; debe estar **vacía**.

```sql
SELECT * FROM dbo.inventory_stock_check;   -- vacía = todo cuadra
```

Al habilitar movimientos se creó un movimiento `Inicial` por cada repuesto con stock, igual a su stock de ese momento. Los usos
anteriores a ese día no tienen historial.

## Datos de prueba en la base real
- Repuesto `ZZ-PRUEBA` (`inventory_part_id = 17`) y vehículo `ZZ-0000` (`vehicle_id = 69`).
- Órdenes 1 (cancelada) y 2 (entregada). Sus movimientos de inventario no se pueden borrar; quedan como historial.

## Pendientes en la base
- Fechas: varias columnas usan `CURRENT_TIMESTAMP` (hora local del servidor, 8 h atrás de UTC) mientras el backend escribe en UTC.
  Aplazado. Si se unifica, cambiar los valores por defecto a `SYSUTCDATETIME()`.
- Índices en las llaves foráneas (SQL Server no los crea solo). Hoy solo existen los de las órdenes abiertas y las fotos.
- `vehicles.company_id` no tiene FK a `companies`; `users.email`, `password_hash` y `role` aceptan `NULL`.
- `inventory_parts`: sin SKU ni proveedor, y el nombre no es único.
