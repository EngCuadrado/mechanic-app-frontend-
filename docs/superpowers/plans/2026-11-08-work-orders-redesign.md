# Rediseño de órdenes de trabajo: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recepción y entrega por pasos con inspección dinámica obligatoria y firma, y un tablero que muestre servicios, tiempo y mecánico de cada carro.

**Architecture:** Dos páginas por pasos (`ReceptionPage`, `DeliveryPage`) componen piezas compartidas (`StepFlow`, `ChoiceChips`) y el feature `inspections` (`useChecklist` + `ChecklistWizard`, que pinta una categoría por paso desde el checklist del backend). La lógica de reglas vive en funciones puras con pruebas. El tablero y el detalle existentes se ajustan, no se reescriben.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind (`brand-*`, `dark:`), Apollo Client 4, react-router 7, react-intl, sonner, Heroicons, Vitest (solo funciones puras).

**Spec:** `docs/superpowers/specs/2026-11-08-work-orders-redesign-design.md`

## Global Constraints
- Reglas de `AGENTS.md`: código nuevo en `src/features/<x>/` o `src/shared/`; una feature solo importa de otra por su `index.ts`; `shared/` no importa de `features/`.
- No tocar `QuerysDefinitions.tsx` ni `ColumnsDefinitions.tsx`.
- Ningún texto fijo en JSX: `intl.formatMessage` con `id` + `defaultMessage`; claves en `src/lang/es.json` con prefijo por feature, en orden alfabético.
- Toda mutation pasa por `useApiMutation`; botones que escriben se deshabilitan mientras la mutation corre.
- Área táctil mínima 44×44 px (`IconButton`), `dark:` en todo lo nuevo, sin scroll horizontal; probar a ~390 px y ~820 px.
- Fechas solo vía `src/shared/utils/dates.ts`.
- Ningún ítem de inspección se marca de antemano; no hay botón "todo bien".
- Archivos nuevos bajo ~200 líneas.
- **No hacer commits** salvo que el usuario lo pida: el árbol ya tiene cambios sin confirmar del usuario. Cada tarea termina en un "punto de control" (build + lint).
- `npm run build` y `npm run lint` deben pasar al cerrar cada tarea.

## Review Focus
1. Checklist sin categorías o sin ítems (backend vacío): se muestra aviso y se puede continuar; no bloquea la recepción. → Task 1 (`allRequiredDone([])`).
2. Categoría cuyos ítems son todos opcionales: se puede avanzar sin tocar nada. → Task 1.
3. Doble toque en "Siguiente"/"Recibir"/"Entregar": no crea dos órdenes ni dos inspecciones (botón deshabilitado + guarda con `useRef`). → Tasks 4 y 5 (verificación manual).
4. Abandonar tras el paso 1 y volver: se retoma desde `/ordenes/:id/recibir` reutilizando la inspección existente, sin `INSPECTION_EXISTS`. → Task 5.
5. Fecha del backend sin zona o en el futuro: el tiempo transcurrido nunca es negativo. → Task 1 (`elapsedMinutes`).

---

### Task 1: Funciones puras y corredor de pruebas

**Files:**
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`)
- Create: `src/features/inspections/checklist.ts`, `src/features/inspections/checklist.test.ts`
- Create: `src/features/work-orders/readiness.ts`, `src/features/work-orders/readiness.test.ts`
- Modify: `src/shared/utils/dates.ts` (+ `src/shared/utils/dates.test.ts`)

**Interfaces:**
- Produces:
  - `isAnswered(value: string | null | undefined): boolean` (falso si vacío o solo espacios; `"false"` cuenta como respondido).
  - `missingRequired(group: FormGroup, values: Record<number, string>): number[]` (ids de ítems obligatorios sin respuesta).
  - `allRequiredDone(groups: FormGroup[], values: Record<number, string>): boolean`.
  - `isReceptionIncomplete(o: { currentStatus: string; dropoffSignatureUrl: string | null }): boolean` (verdadero si `Recibido` y sin firma de entrada).
  - `elapsedMinutes(value?: string | null, now?: dayjs.Dayjs): number` (≥ 0; 0 si no se puede interpretar) y `formatElapsed(minutes: number): string` → `"45 min"`, `"2 h 10 min"`, `"1 d 1 h"`.

- [ ] **Step 1: Instalar Vitest** (`npm i -D vitest`) y añadir el script `test`. Es decisión del plan (el repo no tenía corredor); solo se usa para funciones puras.
- [ ] **Step 2: Escribir las pruebas que fallan**
  - `checklist.test.ts`: `isAnswered("")`, `isAnswered("  ")` → false; `isAnswered("false")` → true. `missingRequired` devuelve el `itemId` de un obligatorio sin valor y `[]` si todos los obligatorios tienen valor aunque haya opcionales vacíos. `allRequiredDone([], {})` → true.
  - `readiness.test.ts`: `{Recibido, null}` → true; `{Recibido, "https://x"}` → false; `{"En proceso", null}` → false.
  - `dates.test.ts`: `formatElapsed(45)` = `"45 min"`, `formatElapsed(130)` = `"2 h 10 min"`, `formatElapsed(1500)` = `"1 d 1 h"`; `elapsedMinutes` con fecha futura = 0 y con `null` = 0.
- [ ] **Step 3: Correr** `npm test` → FAIL (funciones no definidas).
- [ ] **Step 4: Implementar** las funciones en los archivos indicados (`elapsedMinutes` usa `parseServerDate` y recorta a 0).
- [ ] **Step 5: Correr** `npm test` → PASS. Punto de control: build + lint.

---

### Task 2: Constantes y textos

**Files:**
- Modify: `src/features/work-orders/constants.ts`, `src/lang/es.json`

**Interfaces:**
- Produces:
  - `ORDER_REASONS: readonly string[]` (claves: `preventive`, `brakes`, `engine`, `suspension`, `electrical`, `ac`, `tires`, `collision`, `general`) y `reasonMessageId(key: string): string` → `workOrder.reason.<key>`.
  - `SERVICE_CATALOG: readonly string[]` (claves: `oilChange`, `filters`, `brakes`, `alignment`, `electrical`, `suspension`, `tires`, `ac`, `other`) y `serviceMessageId(key: string): string` → `workOrder.service.<key>`.
  - `OVERDUE_MINUTES = 240`.
  - Exportar todo desde `features/work-orders/index.ts` (ya reexporta `constants`).

- [ ] **Step 1:** Añadir las constantes. Las listas son decisión de contenido del plan (el spec las deja al implementador); el usuario puede editarlas en este archivo.
- [ ] **Step 2:** Añadir en `es.json`, alfabéticamente, las claves `workOrder.reason.*`, `workOrder.service.*` y las de las tareas siguientes conforme se usen (`workOrder.reception.*`, `workOrder.delivery.*`, `inspection.wizard.*`, `common.next`, `common.finish`).
- [ ] **Step 3:** Punto de control: build + lint.

---

### Task 3: Piezas compartidas `ChoiceChips` y `StepFlow`

**Files:**
- Create: `src/shared/components/ChoiceChips.tsx`, `src/shared/components/StepFlow.tsx`

**Interfaces:**
- Produces:
  - `ChoiceChips({ options: { value: string; label: string }[]; value: string | null; onChange: (v: string) => void; ariaLabel: string; disabled?: boolean })`: `role="radiogroup"`, chips ≥ 44 px, seleccionado con `border-brand-500 bg-brand-500 text-white`, no seleccionado con borde gris y `dark:`; marca seleccionada también con un check (no solo color). Mismo estilo que el `ChoiceField` actual.
  - `StepFlow({ title: string; step: number; total: number; onBack?: () => void; nextLabel: string; onNext: () => void; nextDisabled?: boolean; loading?: boolean; children: ReactNode })`: encabezado con título y botón atrás (`ArrowLeftIcon`), barra de progreso de `total` segmentos, cuerpo, y `ActionBar` con el botón principal (`IconButton variant="primary" showLabel`).
- Consumes: `IconButton`, `ActionBar`.

- [ ] **Step 1:** Implementar ambos como presentacionales (sin Apollo).
- [ ] **Step 2:** Punto de control: build + lint. Revisión visual en la tarea 4.

---

### Task 4: Checklist por pasos (feature `inspections`)

**Files:**
- Create: `src/features/inspections/hooks/useChecklist.ts`, `src/features/inspections/components/ChecklistWizard.tsx`, `src/features/inspections/components/ItemNote.tsx`
- Create: `src/features/photos/components/PhotoCaptureButton.tsx`
- Modify: `src/features/inspections/components/fields.tsx`, `src/features/inspections/types.ts`, `src/features/inspections/index.ts`, `src/features/photos/index.ts`

**Interfaces:**
- Consumes: `isAnswered`, `missingRequired`, `allRequiredDone` (Task 1); `ChoiceChips`, `StepFlow` (Task 3); `GET_INSPECTION_FORM`, `CREAR_INSPECCION`, `GUARDAR_RESULTADOS`, `REGISTRAR_FOTO`, `shrinkImage`.
- Produces:
  - `useChecklist(args: { workOrderId: number; type: "Entrada" | "Salida"; existingId?: number | null }): { inspectionId: number | null; groups: FormGroup[]; values: Record<number, string>; notes: Record<number, string>; loading: boolean; error: boolean; saving: boolean; setValue(itemId: number, v: string): void; setNote(itemId: number, n: string): void; saveGroup(index: number): Promise<boolean>; finish(): Promise<boolean> }`. Sin `existingId` crea la inspección una sola vez (guarda con `useRef`); con `existingId` la reutiliza. Los valores iniciales salen del formulario guardado. `saveGroup` envía en lote solo los ítems de esa categoría con respuesta (`validarCompletitud: false`); `finish` guarda la última categoría con `validarCompletitud: true`.
  - `ChecklistWizard({ checklist: ReturnType<typeof useChecklist>; workOrderId: number; photoStage: "Antes" | "Despues"; onDone: () => void })`: una categoría por paso dentro de `StepFlow`-compatible barra de progreso propia; "Siguiente" se habilita cuando `missingRequired` de la categoría es `[]`; en la última dice "Finalizar" y llama `finish()` y luego `onDone()`. Con 0 categorías muestra aviso (`inspection.wizard.empty`) y deja continuar.
  - `PhotoCaptureButton({ workOrderId: number; stage: string; category?: string; vehicleInspectionId?: number })` (icono de cámara, `capture="environment"`, reduce con `shrinkImage`, usa `REGISTRAR_FOTO` vía `useApiMutation`).
  - `FIELD_REGISTRY` añade `textarea`; `ChoiceField` usa `ChoiceChips`; `CheckboxField` se queda como **switch** (decisión del usuario); empieza en "No" (`"false"`) y cuenta como respondido, el resto de ítems requiere un toque.
  - Cada ítem del wizard lleva un icono de nota (`ItemNote`, hoja inferior con textarea, nota guardada en `notes`) y un `PhotoCaptureButton` con `category = item.name`. `InspectionFormView` (vista larga) sigue existiendo solo para lectura en órdenes cerradas.
  - `inspections/index.ts` exporta `ChecklistWizard` y `useChecklist`; `photos/index.ts` exporta `PhotoCaptureButton`.

- [ ] **Step 1:** Extender `types.ts` si hace falta (`notes` en `FormItem` ya existe).
- [ ] **Step 2:** Implementar `useChecklist`, `fields.tsx`, `ItemNote`, `PhotoCaptureButton`, `ChecklistWizard`.
- [ ] **Step 3:** Punto de control: build + lint. La prueba de pantalla ocurre en la tarea 5.

---

### Task 5: Recepción por pasos

**Files:**
- Create: `src/features/work-orders/pages/ReceptionPage.tsx`, `src/features/work-orders/components/VehicleStep.tsx`, `src/features/work-orders/components/SignatureStep.tsx`, `src/features/work-orders/hooks/useReception.ts`
- Modify: `src/App.tsx` (rutas `/ordenes/recibir` y `/ordenes/:id/recibir`), `src/features/work-orders/pages/WorkOrdersPage.tsx`, `src/features/work-orders/index.ts`
- Delete: `src/features/work-orders/components/NewOrderSheet.tsx` (reemplazado; antes buscar con `grep -rn NewOrderSheet src` que nadie más lo importe)

**Interfaces:**
- Consumes: `StepFlow`, `ChoiceChips`, `EntityPicker`, `SEARCH_VEHICLES`, `ChecklistWizard`, `useChecklist` (por `../../inspections`), `ORDER_REASONS`, `CREATABLE_TYPES`, `CREAR_ORDEN`, `ACTUALIZAR_ORDEN`, `UPLOAD_SIGNATURE`, `useWorkOrder(id)`.
- Produces:
  - `VehicleStep({ vehicle; reason: string | null; type: string; driver: string; onChange: (patch) => void })`: placa con `EntityPicker`, motivo con `ChoiceChips` (de `ORDER_REASONS`, sin texto libre), tipo con `ChoiceChips`, `driver` como único campo de texto.
  - `SignatureStep({ title: string; name: string; onName?: (n: string) => void; onSign: (file: File) => Promise<boolean>; summary?: ReactNode })`: lienzo (`SignaturePad`), vista previa de la firma y estado "firmado"; reutilizable en la entrega.
  - `useReception(existing?: WorkOrderDetail): { workOrderId: number | null; createOrder(v: { vehicleId: number; type: string; reasonLabel: string; driver: string }): Promise<number | null>; signDropoff(file: File): Promise<boolean>; creating: boolean; signing: boolean }`. `createOrder` guarda `reportedIssue` con el texto del motivo y es idempotente (guarda con `useRef`); `OPEN_ORDER_EXISTS` lo muestra `useApiMutation` por el mapa de errores existente.
  - `ReceptionPage`: pasos 1 Vehículo y motivo → 2 `ChecklistWizard` (`type: "Entrada"`, `photoStage: "Antes"`) → 3 firma con resumen y botón "Recibir vehículo"; al terminar navega a `/ordenes`. En `/ordenes/:id/recibir` carga la orden y arranca en el paso 2 con `existingId` = su inspección de Entrada. Hora y recepcionista no se piden (los pone el backend).
  - El botón "Nueva orden" de `WorkOrdersPage` navega a `/ordenes/recibir`.

- [ ] **Step 1:** Implementar `useReception`, `VehicleStep`, `SignatureStep`, `ReceptionPage`; registrar rutas y cambiar el botón.
- [ ] **Step 2:** Punto de control: build + lint.
- [ ] **Step 3:** Probar en el navegador (390 px y 820 px, claro y oscuro): flujo completo; vehículo con orden abierta (error); abandonar en el paso 2 y reabrir desde el tablero; doble toque en "Siguiente" y "Recibir"; checklist vacío.

---

### Task 6: Entrega por pasos

**Files:**
- Create: `src/features/work-orders/pages/DeliveryPage.tsx`
- Modify: `src/App.tsx` (ruta `/ordenes/:id/entregar`), `src/features/work-orders/components/StatusActions.tsx`

**Interfaces:**
- Consumes: `ChecklistWizard`, `useChecklist` (`type: "Salida"`, `photoStage: "Despues"`), `SignatureStep`, `StepFlow`, `useWorkOrder`, `ACTUALIZAR_ORDEN`, `UPLOAD_SIGNATURE`, `CAMBIAR_ESTADO_ORDEN`.
- Produces:
  - `DeliveryPage`: paso 1 inspección de salida (reutiliza la existente si ya hay), paso 2 nombre de quien recoge + firma (`pickupDriverName`, `pickupSignatureUrl`) y botón "Entregar" habilitado solo con nombre y firma; al pulsar cambia el estado a `Entregado` y navega a `/ordenes`. Solo accesible con orden en `Listo`; en otro estado muestra `EmptyState`.
  - `StatusActions`: cuando el siguiente estado es `Entregado`, el botón principal navega a `/ordenes/:id/entregar` en vez de abrir `ConfirmDialog`.

- [ ] **Step 1:** Implementar `DeliveryPage`, la ruta y el cambio en `StatusActions`.
- [ ] **Step 2:** Punto de control: build + lint.
- [ ] **Step 3:** Probar en el navegador: entrega completa, entrega sin firma (botón deshabilitado), orden que no está en `Listo`.

---

### Task 7: Tablero: servicios, tiempo, recepción incompleta

**Files:**
- Modify: `src/features/work-orders/api/queries.ts` (`GET_WORK_ORDERS` añade `dropoffSignatureUrl`, `services { description }`), `src/features/work-orders/types.ts` (`WorkOrderSummary`), `src/features/work-orders/components/WorkOrderCard.tsx`, `src/features/work-orders/components/BoardCard.tsx`, `src/features/work-orders/components/StatusBoard.tsx`

**Interfaces:**
- Consumes: `elapsedMinutes`, `formatElapsed` (Task 1), `isReceptionIncomplete` (Task 1), `OVERDUE_MINUTES`, `serviceMessageId` (Task 2).
- Produces:
  - `WorkOrderSummary` añade `dropoffSignatureUrl: string | null` y `services: { description: string | null }[]`.
  - `WorkOrderCard`: muestra hasta 2 servicios y `+N`; tiempo con `formatElapsed(elapsedMinutes(entryTimestamp))` en rojo y con texto "Atrasada" si supera `OVERDUE_MINUTES` y la orden sigue abierta; si `isReceptionIncomplete`, una insignia "Recepción incompleta" (icono + texto) y la tarjeta enlaza a `/ordenes/:id/recibir`.
  - `StatusBoard`: avanzar a `Entregado` (botón o arrastre) navega a `/ordenes/:id/entregar`; se elimina el `ConfirmDialog` de entrega del tablero.

- [ ] **Step 1:** Ajustar query, tipo, tarjeta y tablero.
- [ ] **Step 2:** Punto de control: build + lint.
- [ ] **Step 3:** Probar tablero a 390 px y 820 px, claro y oscuro: estados vacío, error, carga; tarjeta atrasada; recepción incompleta; arrastrar y botón de `Listo` hacia entrega.

---

### Task 8: Servicios por catálogo y limpieza del detalle

**Files:**
- Modify: `src/features/work-orders/components/ServiceSheet.tsx`, `src/features/work-orders/pages/WorkOrderDetailPage.tsx`, `src/features/work-orders/hooks/useOrderTasks.ts`

**Interfaces:**
- Consumes: `ChoiceChips`, `SERVICE_CATALOG`, `serviceMessageId`.
- Produces:
  - `ServiceSheet`: la descripción se elige con `ChoiceChips` del catálogo (sin campo de texto); si el servicio que se edita tiene una descripción fuera del catálogo, se añade como opción extra para no perderla. Costo y precio siguen con teclado numérico; mecánico opcional como hoy.
  - `WorkOrderDetailPage`: quitar el `<StatusGuide>` duplicado (aparece dos veces seguidas).
  - `useOrderTasks`: las fotos pasan a ser opcionales, se quitan `photosBefore` y `photosAfter` de las tareas requeridas; la entrega ya exige inspección y firma por el flujo.

- [ ] **Step 1:** Implementar los tres cambios.
- [ ] **Step 2:** Punto de control: build + lint; probar agregar y editar un servicio (con y sin mecánico), a 390 px.

---

### Task 9: Documentación y verificación final

**Files:**
- Modify: `docs/work-orders-api.md`, `docs/work-orders-ui-todo.md`

- [ ] **Step 1:** En `docs/work-orders-api.md` quitar las marcas ⚠️ de `crearInspeccion`, `editarInspeccion`, `vehicleInspection`, `guardarResultadosInspeccion`, `registrarFotoOrden`, `eliminarFotoOrden` y `workOrderPhotos` (el usuario confirmó que ya están probadas) y ajustar la nota de estado de verificación.
- [ ] **Step 2:** En `docs/work-orders-ui-todo.md` añadir una sección "Flujo de recepción y entrega" que enlace al spec y al plan y marque lo hecho.
- [ ] **Step 3:** `npm test`, `npm run build`, `npm run lint` → todo pasa.
- [ ] **Step 4:** Recorrido final en navegador (390 px y 820 px, vertical y horizontal, claro y oscuro): recibir → trabajar (servicios y repuestos) → pasar a Listo → entregar; sin scroll horizontal; botones táctiles ≥ 44 px.

---

## Autorrevisión
- Cobertura del spec: recepción (T5), tablero (T7), trabajo en el taller (T8), entrega (T6), reutilización (T3, T4), listas fijas (T2), inspección dinámica y obligatoria (T4), riesgos (T7 recepción incompleta; T9 docs).
- Riesgo que el plan no resuelve: el backend no exige inspección ni firma para cambiar de estado; la regla la aplica solo la UI (anotado en el spec).
- Decisiones del plan fuera del spec: Vitest para funciones puras; switch que empieza en "No"; el tipo de orden se deduce del motivo (sin preguntar); `useReception` se eliminó (la página usa `useApiMutation` directo) y se añadió `useSignOrder`; tope `OVERDUE_MINUTES = 240`; contenido de las listas de motivos y servicios; retomar una recepción abandonada siempre en el paso del checklist.
