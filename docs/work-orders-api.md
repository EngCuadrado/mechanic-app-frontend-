# API de órdenes de trabajo (GraphQL)

Referencia para el frontend. Las operaciones nuevas del backend (`mechanic-app-backend`) para órdenes de trabajo,
inventario con movimientos, inspecciones y fotos.

> **Estado de verificación.** Las operaciones marcadas ✅ se ejecutaron contra la base real el 2026-11-07 y
> respondieron como se documenta. Las marcadas ⚠️ existen en el schema pero **no se han probado**; sus argumentos
> vienen del reporte del backend y pueden diferir: confirma en el editor de GraphQL (`Ctrl+Espacio` muestra los
> argumentos reales) antes de usarlas en la UI.

## Convenciones
- Paginación por cursor: `first`, `after` → `nodes { … } pageInfo { hasNextPage endCursor }`.
- Los errores llegan en `errors[0].message`; los errores de SQL traducidos llevan además `extensions.code`.
- **Fechas (2026-11-22):** todo se guarda y se devuelve en **UTC** (con `Z`): órdenes, inspecciones, fotos, movimientos,
  alquileres y facturas, igual que `GETDATE()` de la base. La zona del taller (`America/Managua`) solo decide qué es "hoy"
  (`WorkOrderRules.TodayStartUtc`) y cómo se muestran las horas (`shared/utils/dates.ts`). Filas anteriores a este cambio
  en producción pueden estar en hora de Managua: ver `mechanic-app-backend/docs/sql-utc-dates.sql`.
- `createdBy` queda `null` si la petición no trae token JWT.

## Estados y tipos
| Campo | Valores |
|---|---|
| `type` (orden) | `Preventivo`, `Correctivo`, `Choque`, `Entrega`, `Devolucion` |
| `currentStatus` | `Recibido` → `En proceso` → `Listo` → `Entregado`; `Cancelado` desde `Recibido`, `En proceso` o `Listo` |
| `inspectionType` | `Entrada`, `Salida` (máximo una de cada una por orden) |
| `stage` (foto) | `Antes`, `Despues`, `Otro` |
| `movementType` | `Inicial`, `Compra`, `Ajuste` (manuales); `Uso`, `Devolucion` (los genera la base al manejar repuestos de una orden) |
| `inputType` (checklist) | `text`, `textarea`, `number`, `checkbox`, `date`, `select`, `radio` |

Reglas: no se puede saltar un estado (`Recibido → Listo` falla), ni salir de `Entregado` o `Cancelado`.
Un vehículo solo puede tener **una orden abierta** (`Recibido`, `En proceso` o `Listo`).

---

## Órdenes de trabajo

### `crearOrden` ✅
```graphql
mutation {
  crearOrden(vehicleId: 69, type: "Correctivo", reportedIssue: "Ruido en el motor") {
    workOrderId currentStatus companyId createdBy
  }
}
```
Argumentos opcionales: `notes`, `dropoffDriverName`, `pickupDriverName`, `rentalId`.
```json
{ "data": { "crearOrden": { "workOrderId": 1, "currentStatus": "Recibido", "companyId": null, "createdBy": null } } }
```
`companyId` sale de la empresa que tiene el vehículo (`null` si está libre). Errores: `"El vehículo ya tiene una orden abierta."`
(`OPEN_ORDER_EXISTS`). Pone el vehículo en `MANTENIMIENTO` en la misma operación (2026-11-22).

### `cambiarEstadoOrden` ✅
```graphql
mutation { cambiarEstadoOrden(workOrderId: 2, newStatus: "Entregado") { currentStatus exitTimestamp } }
```
```json
{ "data": { "cambiarEstadoOrden": { "currentStatus": "Entregado", "exitTimestamp": "2026-11-07T19:14:59.573Z" } } }
```
Al pasar a `Entregado` se llena `exitTimestamp`. Errores: `"Transición no permitida: Recibido → Listo."`,
`"Transición no permitida: Entregado → En proceso."`.

Requisitos para avanzar (2026-11-22, `WorkOrderRules.TransitionBlocker`):
| Destino | Exige | `code` si falta |
|---|---|---|
| `En proceso` | inspección de `Entrada` y `dropoffSignatureUrl` | `RECEPTION_INCOMPLETE` |
| `Listo` | al menos un servicio o repuesto | `NO_WORK` |
| `Entregado` | inspección de `Salida` y `pickupSignatureUrl` | `DELIVERY_INCOMPLETE` |

Al pasar a `Entregado`, y también con `cancelarOrden`, el vehículo vuelve a `ALQUILADO` si tiene empresa o a `DISPONIBLE` si no.

### `cancelarOrden` ✅
```graphql
mutation { cancelarOrden(workOrderId: 1) { workOrderId currentStatus totalInternalCost totalBilledPrice } }
```
```json
{ "data": { "cancelarOrden": { "workOrderId": 1, "currentStatus": "Cancelado", "totalInternalCost": 0, "totalBilledPrice": 0 } } }
```
Borra los repuestos de la orden (el stock vuelve al inventario como movimiento `Devolucion`), conserva los
servicios y recalcula los totales. Una orden cancelada ya no admite cambios
(`"La orden está Cancelado y no admite cambios."`).

### `actualizarOrden` ✅
Datos generales: `reportedIssue`, `notes`, nombres de choferes, URLs de firmas. No cambia el estado. Omitir un argumento lo
conserva; mandarlo en `null` lo **borra**. Ojo: HotChocolate toma como `null` una variable declarada que no se envía, así que
**cada documento declara solo lo que cambia** (`GuardarFirmaEntrega`, `GuardarFirmaRecoge`, `GuardarQuienEntrega`,
`GuardarQuienRecoge`). Un documento con todas las variables borraba las firmas al guardar el nombre (2026-11-22).

### `workOrders` (lista) ✅ solo lectura con la lista vacía
```graphql
query($where: WorkOrderFilterInput, $first: Int, $after: String) {
  workOrders(where: $where, first: $first, after: $after) {
    nodes { workOrderId type currentStatus entryTimestamp reportedIssue totalBilledPrice
            vehicle { plate model { modelName brand { brandName } } } company { name }
            assignedMechanics { mechanicId firstName lastName } }
    pageInfo { hasNextPage endCursor }
  }
}
```
Variables: `{ "first": 20, "where": { "currentStatus": { "eq": "En proceso" } } }`. Filtros: estado, tipo, vehículo, empresa, rango
de fechas. Orden: más recientes primero.

`assignedMechanics`: mecánicos de los servicios de la orden, sin repetidos (DataLoader, sin N+1). Filtro por placa ✅
probado: `where: { vehicle: { plate: { contains: "ZZ" } } }`, combinable con `currentStatus`.

### `workOrderStatusCounts` ✅
`{ workOrderStatusCounts { status count } }` → una fila por estado (Recibido, En proceso, Listo, Entregado, Cancelado), con 0
incluido, calculada con GROUP BY. Argumentos opcionales: `entryFrom`, `entryTo` (con zona, ej. `2020-01-01T00:00:00Z`), `vehicleId`.
La lista de órdenes lo usa para los contadores del filtro (`GetWorkOrderStatusCounts`).

### `workOrderDashboard(stalledHours: Int = 24)` ✅ (aún sin usar en la UI)
`{ createdToday readyToDeliver stalled }`. `stalled` cuenta Recibido/En proceso con más de N horas
desde `statusChangedAt` (o `entryTimestamp` si es null). `stalledHours <= 0` da error. "Hoy" usa `WorkOrderRules.TimeZoneId` del backend.

### `workOrder` (detalle) ⚠️
```graphql
query($id: Int!) {
  workOrder(workOrderId: $id) {
    workOrderId currentStatus totalInternalCost totalBilledPrice creator { name lastName }
    parts { workOrderPartId quantity totalUnitCost unitPrice part { name } }
    services { workOrderServiceId description internalCost price }
    photos { workOrderPhotoId stage photoUrl }
    inspections { vehicleInspectionId inspectionType mileage }
  }
}
```

---

## Repuestos y servicios de la orden
Cada mutation recalcula `totalInternalCost` (suma de costos) y `totalBilledPrice` (suma de precios) en la misma transacción.
En una orden `Entregado` o `Cancelado` ninguna se puede ejecutar.

### `agregarRepuestoOrden` ✅
```graphql
mutation {
  agregarRepuestoOrden(workOrderId: 1, partId: 17, quantity: 2) {
    totalInternalCost totalBilledPrice
    parts { workOrderPartId quantity totalUnitCost unitPrice }
  }
}
```
```json
{ "data": { "agregarRepuestoOrden": { "totalInternalCost": 10, "totalBilledPrice": 16,
  "parts": [ { "workOrderPartId": 1, "quantity": 2, "totalUnitCost": 5, "unitPrice": 8 } ] } } }
```
`totalUnitCost` y `unitPrice` son opcionales: por defecto salen del repuesto en inventario (`total_unit_cost` y `base_price`)
y quedan guardados como foto del momento. Descuenta stock automáticamente (movimiento `Uso`).

### `editarRepuestoOrden` ✅
```graphql
mutation { editarRepuestoOrden(workOrderPartId: 1, quantity: 3) { totalInternalCost totalBilledPrice parts { workOrderPartId quantity } } }
```
Argumentos opcionales: `quantity`, `totalUnitCost`, `unitPrice`. Subir la cantidad genera `Uso`; bajarla genera `Devolucion`.
Si no alcanza el stock: `"Stock insuficiente para completar la operación."` (`INSUFFICIENT_STOCK`) y **no se guarda nada**.

### `quitarRepuestoOrden` ⚠️ · `agregarServicioOrden` ✅ · `editarServicioOrden` ⚠️ · `quitarServicioOrden` ⚠️
```graphql
mutation {
  agregarServicioOrden(workOrderId: 2, description: "Cambio de aceite", internalCost: 20, price: 35) {
    totalInternalCost totalBilledPrice
  }
}
```
```json
{ "data": { "agregarServicioOrden": { "totalInternalCost": 20, "totalBilledPrice": 35 } } }
```
Un servicio puede llevar un mecánico (opcional; confirma el nombre del argumento en el schema).

---

## Inventario

### `inventoryMovements` ✅
```graphql
query { inventoryMovements(partId: 17, first: 20) { nodes { movementType quantity workOrderId createdAt } } }
```
Libro de entradas y salidas de un repuesto, más recientes primero. Cantidad con signo: positivo entra, negativo sale.
Un repuesto con stock inicial tiene un movimiento `Inicial`.

### `registrarMovimiento` ⚠️
```graphql
mutation($p: Int!, $t: String!, $q: Int!, $c: Decimal) {
  registrarMovimiento(partId: $p, movementType: $t, quantity: $q, unitCost: $c) {
    movementId movementType quantity unitCost part { name stockQuantity }
  }
}
```
Variables: `{ "p": 4, "t": "Compra", "q": 10, "c": 8.5 }`. Solo `Compra`, `Ajuste` e `Inicial`. Signo: `Compra` e `Inicial` positivos;
`Ajuste` positivo o negativo pero no cero. Un movimiento nunca se edita ni se borra; los errores se corrigen con un `Ajuste`.

### `inventoryStockCheck` ✅
```graphql
query { inventoryStockCheck { isConsistent rows { cells { name value } } } }
```
`isConsistent: true` y `rows: []` significa que el stock de cada repuesto coincide con la suma de sus movimientos.

### Cambio que afecta a la UI de repuestos
`addInventoryPart` y `updateInventoryPart` **ya no aceptan `stockQuantity`**. `stockQuantity` sigue disponible solo para
lectura. Para crear un repuesto con stock inicial, `addInventoryPart` recibe un argumento de stock inicial que registra un
movimiento `Inicial`; para cambiar el stock después, usar `registrarMovimiento`. (Confirma el nombre del argumento en el
schema: no está probado.)

---

## Inspecciones (checklist)

### `inspectionForm` ✅ (sin id, devuelve el formulario vacío)
`inspectionForm(inspectionType: "Entrada")` sin id da el formulario vacío de ese tipo (la recepción lo usa antes de crear la orden).
Con id incluye también los ítems **inactivos** ya contestados (`item.isActive = false`) para ver inspecciones viejas; al llenar,
el frontend solo muestra los activos. Checklist activo desde el 2026-11-22: 4 ítems básicos (`mechanic-app-backend/docs/sql-basic-checklist.sql`).
```graphql
query($id: Int) {
  inspectionForm(vehicleInspectionId: $id) {
    inspection { vehicleInspectionId inspectionType }
    groups { category { name sortOrder } items { item { itemId name inputType options isRequired } value notes } }
  }
}
```
`groups` trae **un grupo por categoría** con todos sus ítems, en orden de `sortOrder`. `options` es una lista de textos
(`["Limpio","Sucio","Requiere lavado profundo"]`) y solo existe en `select` y `radio`. Con `vehicleInspectionId` devuelve además
los valores ya guardados en `value` y `notes`.

### `crearInspeccion` ✅
Crea la inspección `Entrada` o `Salida` de una orden, con kilometraje, notas y URL del croquis de daños. Si ya existe una de
ese tipo en la orden: `"La orden ya tiene una inspección de Entrada."` (`INSPECTION_EXISTS`).
Si `mileage` es mayor que el del vehículo, actualiza `vehicles.current_mileage` (nunca lo baja) (2026-11-22).

### `editarInspeccion` ✅ · `vehicleInspection` ✅
`editarInspeccion(vehicleInspectionId, mileage)` también sube `vehicles.current_mileage` si el km es mayor (2026-11-22). La recepción y
la entrega exprés guardan el km así, al terminar la revisión.

### `guardarResultadosInspeccion` ✅
```graphql
mutation($id: Int!, $r: [InspectionResultInput!]!) {
  guardarResultadosInspeccion(vehicleInspectionId: $id, results: $r, validarCompletitud: false) {
    groups { items { item { name } value } }
  }
}
```
Variables: `{ "id": 4, "r": [ { "itemId": 7, "value": "Limpio", "notes": null }, { "itemId": 8, "value": "true" } ] }`.
Guarda en lote, todo o nada, y actualiza si el ítem ya tenía respuesta. Valida el valor contra el tipo: `checkbox` → `"true"`/`"false"`,
`number` → numérico, `date` → fecha válida, `select`/`radio` → una de las `options`. Con `validarCompletitud: true` exige
todos los ítems activos obligatorios y revierte el lote si falta alguno.

---

## Fotos

### `registrarFotoOrden` ✅ · `eliminarFotoOrden` ✅ · `workOrderPhotos` ✅
```graphql
query { workOrderPhotos(workOrderId: 13) { stage photos { workOrderPhotoId photoUrl category } } }
```
`registrarFotoOrden` acepta `photoUrl` **o** `photoFile` (el archivo se sube a Azure Blob). Una foto se puede ligar a una
inspección de **la misma orden** (`vehicleInspectionId`, opcional). `stage` ∈ `Antes`, `Despues`, `Otro`. Las fotos de una
orden `Entregado` no se modifican (son evidencia).

---

## Alquileres y facturas ⚠️
Queries: `vehicleRentals`, `vehicleRental`, `invoices`, `invoice` (las listas devuelven `nodes` vacíos hoy).
Mutations: `addVehicleRental`, `updateVehicleRental`, `addInvoice`, `updateInvoice`. Su clave primaria se llama `id`.
Sin lógica de facturación: solo guardar y leer.

---

## Errores
| Caso | Mensaje | `code` |
|---|---|---|
| Stock insuficiente | "Stock insuficiente para completar la operación." | `INSUFFICIENT_STOCK` |
| Orden Entregado/Cancelado | "La orden está Entregado y no admite cambios." (o "…Cancelado…") | `ORDER_CLOSED` en errores de BD |
| Vehículo con orden abierta | "El vehículo ya tiene una orden abierta." | `OPEN_ORDER_EXISTS` |
| Transición inválida | "Transición no permitida: A → B." | — |
| Recepción incompleta | "Completa la recepción (inspección de entrada y firma)…" | `RECEPTION_INCOMPLETE` |
| Orden sin trabajo | "Agrega al menos un servicio o repuesto…" | `NO_WORK` |
| Entrega incompleta | "Completa la entrega (inspección de salida y firma de quien recoge)…" | `DELIVERY_INCOMPLETE` |
| Inspección duplicada | "La orden ya tiene una inspección de Entrada." | `INSPECTION_EXISTS` |
| Resultado duplicado | "Ya existe un resultado para ese ítem en la inspección." | `RESULT_EXISTS` |
| Movimiento editado/borrado | "Los movimientos de inventario son inmutables; corrija con un movimiento de Ajuste." | — |
| Foto de orden Entregado | "La orden está Entregado: sus fotos son evidencia y no se modifican." | — |
| Otras FK / CHECK / únicos | Mensaje genérico en español, sin SQL | — |

## Pendientes conocidos
- **Sin `[Authorize]`:** las mutations no exigen sesión. Cualquiera con la URL del backend puede crear órdenes, mover stock o
  registrar compras. Conviene exigir login antes de producción.
- **Horas en producción:** antes del 2026-11-22 el backend guardaba las horas de las órdenes en hora de Managua. Si producción
  tiene órdenes de esa época, corregirlas con `mechanic-app-backend/docs/sql-utc-dates.sql` (lo ejecuta el dueño de la base).
- **Detalles de error en producción:** hoy `extensions` incluye el `stackTrace`. En producción debe desactivarse.
- **Nulabilidad:** los modelos del backend marcaban `chassisNumber` como obligatorio aunque la columna acepta `NULL`
  (`crearOrden` falló con un vehículo sin chasis). Se pidió corregir en todos los modelos; confirmar que se hizo.
- Operaciones ⚠️ sin probar (ver arriba). Inspecciones y fotos (incl. `photoFile` con Azure Blob) las probó el usuario el 2026-11-08.
- Existen registros de prueba en la base real: repuesto `ZZ-PRUEBA` (id 17) y vehículo `ZZ-0000` (id 69), con órdenes 1
  (cancelada) y 2 (entregada). No se pueden borrar sus movimientos de inventario.
