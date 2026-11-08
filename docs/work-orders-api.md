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
- **Fechas:** hoy las fechas de las órdenes salen en UTC, pero otras (movimientos, inspecciones, fotos) usan la hora
  local del servidor (8 h atrás de UTC), y algunas salen sin `Z`. Es un problema conocido y aplazado; no
  mezcles horas de tablas distintas sin tenerlo en cuenta (ver "Pendientes conocidos").
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
(`OPEN_ORDER_EXISTS`).

### `cambiarEstadoOrden` ✅
```graphql
mutation { cambiarEstadoOrden(workOrderId: 2, newStatus: "Entregado") { currentStatus exitTimestamp } }
```
```json
{ "data": { "cambiarEstadoOrden": { "currentStatus": "Entregado", "exitTimestamp": "2026-11-07T19:14:59.573Z" } } }
```
Al pasar a `Entregado` se llena `exitTimestamp`. Errores: `"Transición no permitida: Recibido → Listo."`,
`"Transición no permitida: Entregado → En proceso."`.

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

### `actualizarOrden` ⚠️
Datos generales: `reportedIssue`, `notes`, nombres de choferes, URLs de firmas. No cambia el estado.

### `workOrders` (lista) ✅ solo lectura con la lista vacía
```graphql
query($where: WorkOrderFilterInput, $first: Int, $after: String) {
  workOrders(where: $where, first: $first, after: $after) {
    nodes { workOrderId type currentStatus entryTimestamp totalBilledPrice
            vehicle { plate model { modelName brand { brandName } } } company { name } }
    pageInfo { hasNextPage endCursor }
  }
}
```
Variables: `{ "first": 20, "where": { "currentStatus": { "eq": "En proceso" } } }`. Filtros: estado, tipo, vehículo, empresa, rango
de fechas. Orden: más recientes primero.

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

### `crearInspeccion` ⚠️
Crea la inspección `Entrada` o `Salida` de una orden, con kilometraje, notas y URL del croquis de daños. Si ya existe una de
ese tipo en la orden: `"La orden ya tiene una inspección de Entrada."` (`INSPECTION_EXISTS`).

### `editarInspeccion` ⚠️ · `vehicleInspection` ⚠️

### `guardarResultadosInspeccion` ⚠️
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

### `registrarFotoOrden` ⚠️ · `eliminarFotoOrden` ⚠️ · `workOrderPhotos` ⚠️
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
| Inspección duplicada | "La orden ya tiene una inspección de Entrada." | `INSPECTION_EXISTS` |
| Resultado duplicado | "Ya existe un resultado para ese ítem en la inspección." | `RESULT_EXISTS` |
| Movimiento editado/borrado | "Los movimientos de inventario son inmutables; corrija con un movimiento de Ajuste." | — |
| Foto de orden Entregado | "La orden está Entregado: sus fotos son evidencia y no se modifican." | — |
| Otras FK / CHECK / únicos | Mensaje genérico en español, sin SQL | — |

## Pendientes conocidos
- **Sin `[Authorize]`:** las mutations no exigen sesión. Cualquiera con la URL del backend puede crear órdenes, mover stock o
  registrar compras. Conviene exigir login antes de producción.
- **Horas:** las fechas de la orden salen en UTC y otras en hora local del servidor. Aplazado a propósito.
- **Detalles de error en producción:** hoy `extensions` incluye el `stackTrace`. En producción debe desactivarse.
- **Nulabilidad:** los modelos del backend marcaban `chassisNumber` como obligatorio aunque la columna acepta `NULL`
  (`crearOrden` falló con un vehículo sin chasis). Se pidió corregir en todos los modelos; confirmar que se hizo.
- Operaciones ⚠️ sin probar (ver arriba) y el flujo de `photoFile` con Azure Blob.
- Existen registros de prueba en la base real: repuesto `ZZ-PRUEBA` (id 17) y vehículo `ZZ-0000` (id 69), con órdenes 1
  (cancelada) y 2 (entregada). No se pueden borrar sus movimientos de inventario.
