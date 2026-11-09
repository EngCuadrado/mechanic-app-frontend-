# Hojas y formularios de órdenes de trabajo: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Una lista de Trabajo (servicios y repuestos) y una sola hoja "Agregar" con botón fijo; confirmaciones y notas con la misma anatomía.

**Architecture:** `BottomSheet` gana un pie fijo; `AddWorkSheet` compone un formulario de servicio y un selector de repuestos; `WorkOrderDetailPage` se reduce a encabezado + `WorkList` + `RecordRows` + `ActionBar`. Las reglas de validación del servicio son una función pura con pruebas.

**Tech Stack:** React 19, TypeScript, Tailwind (`brand-*`, `dark:`), Apollo Client 4, react-intl, Vitest (funciones puras).

**Spec:** `docs/superpowers/specs/2026-11-08-work-sheets-design.md`

## Global Constraints
- `AGENTS.md`: código en `src/features/work-orders/` o `src/shared/`; una feature solo importa de otra por su `index.ts`; textos con `intl` y claves en `src/lang/es.json` ordenadas; mutations con `useApiMutation`; botones táctiles ≥ 44 px; `dark:` en todo; sin scroll horizontal; archivos nuevos bajo ~200 líneas.
- Alcance: solo órdenes de trabajo. No tocar `SimpleModal` ni los formularios de catálogos, `QuerysDefinitions.tsx`, `ColumnsDefinitions.tsx`.
- Los totales los calcula el backend; la UI no los recalcula. El stock solo cambia por las mutations de repuestos de la orden.
- No hacer commits. Nunca conectarse a una base de datos.
- `npx tsc -p tsconfig.app.json --noEmit` sin errores en `src/features`, `src/shared`; `npm test` y `npx vite build` pasan.

## Review Focus
1. Agregar varios repuestos donde uno falla por `INSUFFICIENT_STOCK`: los demás se agregan, el fallido queda seleccionado. → Task 4.
2. Repuesto que ya está en la orden: se suma la cantidad (editar), no se duplica. → Task 4.
3. Servicio externo (enderezado/pintura) sin costo: botón apagado indicando "Falta el costo". → Task 2 (prueba).
4. Doble toque en "Agregar": no duplica servicios ni repuestos (botón deshabilitado y guarda con `useRef`). → Task 4.
5. Orden cerrada (Entregado/Cancelado): sin botón "＋ Agregar", lista de solo lectura. → Task 5.

---

### Task 1: Hoja con pie fijo y confirmaciones en hoja

**Files:** Modify `src/shared/components/BottomSheet.tsx`, `src/shared/components/ConfirmDialog.tsx`; Create `src/shared/components/SegmentedControl.tsx`.

**Interfaces:**
- Produces: `BottomSheet` acepta `footer?: ReactNode` (barra fija debajo del contenido que no hace scroll, con `safe-area`); `ConfirmDialog` mantiene sus props y pasa a usar `BottomSheet` con los dos botones en el pie; `SegmentedControl({ options: {value:string;label:string}[]; value: string; onChange: (v:string)=>void; ariaLabel: string })` (dos o tres opciones en una fila, ≥ 44 px, `role="tablist"`).

- [ ] **Step 1:** Implementar los tres cambios (el cuerpo de `BottomSheet` sigue con `overflow-y-auto`; el pie va fuera del área con scroll).
- [ ] **Step 2:** `tsc` sin errores. Verificar visualmente en la tarea 6.

---

### Task 2: Reglas del servicio y catálogo

**Files:** Modify `src/features/work-orders/constants.ts`, `src/lang/es.json`; Create `src/features/work-orders/addWork.ts`, `src/features/work-orders/addWork.test.ts`.

**Interfaces:**
- Produces: `SERVICE_CATALOG` añade `bodywork` y `paint` (textos "Enderezado", "Pintura"); `EXTERNAL_SERVICES = ["bodywork", "paint"]` y `isExternalService(key: string | null): boolean`; `serviceMissing(v: { key: string | null; price: number | null; cost: number | null }): "pickService" | "price" | "cost" | null` (null si está completo; `cost` solo se exige si es externo).

- [ ] **Step 1: Prueba que falla** en `addWork.test.ts`: sin `key` → `"pickService"`; `key:"oilChange", price:null` → `"price"`; `key:"bodywork", price:500, cost:null` → `"cost"`; `key:"bodywork", price:500, cost:300` → `null`; `key:"oilChange", price:450, cost:null` → `null`.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implementar. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Claves en `es.json`: `workOrder.service.bodywork`, `workOrder.service.paint`, `workOrder.add`, `workOrder.add.service`, `workOrder.add.part`, `workOrder.add.missing.pickService|price|cost`, `workOrder.add.parts` (plural ICU "Agregar {count, plural, one {# repuesto} other {# repuestos}}"), `workOrder.work`, `workOrder.records`.

---

### Task 3: Servicio: formulario con chips

**Files:** Create `src/features/work-orders/components/ServiceForm.tsx`, `src/features/work-orders/components/MechanicChips.tsx`.

**Interfaces:**
- Consumes: `ChoiceChips`, `SEARCH_MECHANICS`, `SERVICE_CATALOG`, `serviceMessageId`, `isExternalService`, `serviceMissing`.
- Produces:
  - `MechanicChips({ value: number | null; onChange: (id: number | null) => void })`: consulta los primeros 12 mecánicos activos y los muestra como chips; tocar el elegido lo quita.
  - `ServiceForm({ initial?: { key: string | null; price: number | null; cost: number | null; mechanicId: number | null }; onSubmit: (v: { description: string; price: number; internalCost: number; mechanicId: number | null }) => Promise<boolean>; saving: boolean; footerLabel: string })` que dibuja chips de servicio, `Precio` (inputMode decimal), `Costo` solo si es externo, `MechanicChips`; devuelve el contenido y expone el pie por render-prop `children: (footer: { disabled: boolean; hint: string | null; submit: () => void }) => ReactNode` para que la hoja ponga el botón fijo.

- [ ] **Step 1:** Implementar. El `hint` sale de `serviceMissing` (texto "Elige el servicio", "Falta el precio", "Falta el costo"). Para externos `internalCost` = costo; para el resto `0`.
- [ ] **Step 2:** `tsc` sin errores.

---

### Task 4: Repuestos: selector múltiple y `AddWorkSheet`

**Files:** Create `src/features/work-orders/components/PartsPicker.tsx`, `src/features/work-orders/hooks/useAddParts.ts`, `src/features/work-orders/components/AddWorkSheet.tsx`.

**Interfaces:**
- Consumes: `SEARCH_PARTS`, `useLoadMoreList`, `QuantityStepper`, `AGREGAR_REPUESTO`, `EDITAR_REPUESTO`, `AGREGAR_SERVICIO`, `EDITAR_SERVICIO`, `SegmentedControl`, `BottomSheet` (footer), `ServiceForm`.
- Produces:
  - `useAddParts(workOrderId: number, existing: WorkOrderPart[]): { addParts(lines: { partId: number; quantity: number }[]): Promise<{ failed: number[] }>; adding: boolean }`. En serie; si el `partId` ya está en `existing` hace `EDITAR_REPUESTO` con la cantidad sumada; errores por `useApiMutation` (toast); guarda con `useRef` contra doble toque; al terminar refresca `GetWorkOrder` y `GetWorkOrders`.
  - `PartsPicker({ selected: Record<number, number>; onChange: (s: Record<number, number>) => void })`: buscador + lista (nombre, stock); tocar una fila la selecciona con cantidad 1 y muestra `QuantityStepper` (mín. 1, máx. stock); tocarla de nuevo la quita.
  - `AddWorkSheet({ isOpen: boolean; onClose: () => void; workOrderId: number; parts: WorkOrderPart[]; editService?: WorkOrderService | null })`: segmentado Servicio | Repuesto (con `editService` solo servicio y edita); pie fijo "Agregar servicio" / "Agregar N repuestos" apagado con `hint`; cierra al terminar bien; con fallos deja seleccionados solo los fallidos.

- [ ] **Step 1:** Implementar los tres. **Step 2:** `tsc` sin errores.

---

### Task 5: Pantalla de la orden y lista de Trabajo

**Files:** Create `src/features/work-orders/components/WorkList.tsx`, `src/features/work-orders/components/RecordRows.tsx`; Modify `src/features/work-orders/pages/WorkOrderDetailPage.tsx`, `src/features/work-orders/components/StatusActions.tsx`.

**Interfaces:**
- Consumes: `usePartsDraft` (cantidades en la lista), `AddWorkSheet`, `QUITAR_SERVICIO`, `ConfirmDialog`, `PhotosSection`, `InspectionsSection`-equivalente (enlaces a `/ordenes/:id/inspecciones/:inspectionId`), `StatusProgress`, `WorkOrderSummary`.
- Produces:
  - `WorkList({ order: WorkOrderDetail; canEdit: boolean; onEditService: (s: WorkOrderService) => void })`: una lista; servicio (icono llave, nombre, mecánico, precio, tocar abre edición, papelera quita), repuesto (icono caja, nombre, `QuantityStepper`, papelera con `ConfirmDialog`); total con `formatMoney(order.totalBilledPrice)`; estado vacío "Aún no hay trabajo".
  - `RecordRows({ order: WorkOrderDetail })`: filas "Inspección de entrada", "Inspección de salida" (enlace), "Fotos" y "Firmas" (hojas de solo lectura; fotos usa `PhotosSection` con cámara si la orden está abierta).
  - `StatusActions` recibe `onAdd?: () => void` y dibuja "＋ Agregar" antes del siguiente estado; se elimina la prop `pending` y el aviso de "Falta".
  - `WorkOrderDetailPage`: encabezado + `StatusProgress` + `WorkList` + `RecordRows` + `StatusActions` + `AddWorkSheet`; orden `Entregado`/`Cancelado`: sin `onAdd`, sin edición.

- [ ] **Step 1:** Implementar y reescribir la página. **Step 2:** `tsc` sin errores.

---

### Task 6: Orden abierta del vehículo, limpieza y verificación

**Files:** Create `src/features/work-orders/hooks/useOpenOrder.ts`; Modify `src/features/work-orders/components/VehicleStep.tsx`; Delete `ServiceSheet.tsx`, `ServicesSection.tsx`, `PartsSection.tsx`, `HandoverSection.tsx`, `SignatureCard.tsx`, `StatusGuide.tsx`, `hooks/useOrderTasks.ts` (solo después de `grep -rn` que nadie los use); Modify `docs/work-orders-ui-todo.md`.

**Interfaces:**
- Produces: `useOpenOrder(vehicleId: number | null): { orderId: number | null; loading: boolean }` (consulta `GET_WORK_ORDERS` con `where` del vehículo en estados abiertos, `first: 1`); `VehicleStep` muestra, si hay orden abierta, un aviso con botón "Ver orden" (`/ordenes/:id`) y la página deshabilita "Siguiente" (`nextDisabled`).

- [ ] **Step 1:** Implementar y borrar lo no usado. **Step 2:** `npm test`, `tsc`, `npx vite build`.
- [ ] **Step 3:** Con Playwright (390 px y 820 px) sobre la orden de prueba abierta: pasar a En proceso, agregar un servicio externo (sin costo = botón apagado con aviso), agregar un servicio normal, agregar 2 repuestos a la vez, quitar un repuesto, abrir Registro; después cancelar la orden de prueba para devolver stock. Revisar capturas en claro y oscuro (clase `dark` del tema).
- [ ] **Step 4:** Actualizar `docs/work-orders-ui-todo.md` con lo hecho.

---

## Autorrevisión
- Cobertura del spec: lista única y total (T5), hoja Agregar con servicio y repuestos (T3, T4), costo en externos (T2, T3), pie fijo y confirmaciones en hoja (T1), "Ver orden" (T6), Registro (T5), eliminar lo viejo (T6).
- Decisiones del plan fuera del spec: `SegmentedControl` nuevo (porque `Tabs` exige icono y desliza); se quitan `StatusGuide`, `useOrderTasks` y el aviso "Falta" al pasar de estado (la pantalla ya no apila tareas); fotos y firmas solo en Registro.
