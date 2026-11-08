# Órdenes de trabajo: plan de la UI

Lista de tareas, de lo más simple a lo más complejo. Marca `[x]` al terminar. Reglas de trabajo en
[`../AGENTS.md`](../AGENTS.md); contrato del backend en [`work-orders-api.md`](./work-orders-api.md).

## Principio de diseño: móvil y tableta primero
La app se usa en el taller desde celular y tableta, con una mano y a veces con guantes. Detalle en `AGENTS.md` §7. En resumen:
- Botones grandes (mínimo 44×44 px), **mayormente iconos** con `aria-label`/`title`; texto corto solo en acciones destructivas o poco obvias.
- Una acción principal por pantalla, en una **barra fija inferior** al alcance del pulgar.
- Listas como **tarjetas** en pantalla chica (no tablas con scroll lateral); tabla solo en escritorio.
- Elegir antes que escribir: selectores, botones +/−, interruptores, teclado numérico.
- Cámara directa para fotos. Confirmar solo lo importante.
- Toda pantalla nueva se prueba a ~390 px (teléfono) y ~820 px (tableta), vertical y horizontal.

Componentes compartidos que esto exige (Fase 0): `IconButton` (icono + `aria-label` + tamaño táctil + tooltip), `ActionBar` (barra fija
inferior), `ResponsiveList` (tarjetas en móvil / tabla en escritorio), `QuantityStepper` (+/−), `BottomSheet` (panel que sube desde abajo
para formularios y selectores, en lugar de modales centrados pequeños).

## Qué ya existe y cómo lo usamos
- **Tabla:** `ServerDataTable` (paginación por cursor, acepta `query`, `queryKeyName`, `columns` y `filter`). Se reutiliza para las listas.
- **Modales y formularios:** `SimpleModal`, `components/form/*` (`Label`, `InputField`, `Select`, `DatePicker`), `sonner`.
- **Rutas:** `App.tsx` (`ProtectedRoute`, roles) y menú en `layout/AppSidebar.tsx`.
- **Textos:** `react-intl` con `src/lang/es.json`.
- **No usar como ejemplo a seguir:** `QuerysDefinitions.tsx` y `ColumnsDefinitions.tsx` (monolitos de ~1000 líneas). Código nuevo va en `src/features/`.
- **Tests:** el repo no tiene corredor de pruebas. Decisión pendiente en la Fase 9.
- `codegen` existe como script pero no hay archivo de configuración: por ahora los tipos se escriben a mano en cada `types.ts`.

## Estructura objetivo
```
src/
  shared/                       # reutilizable entre features
    components/  StatusBadge, ConfirmDialog, EntityPicker, DateText, MoneyText, FormField, FileDropzone, EmptyState
    hooks/       useApiMutation (toast + errores), useDisclosure
    utils/       apiError.ts (código → mensaje), dates.ts (única función de fechas)
  features/
    work-orders/   api/ hooks/ components/ pages/ types.ts constants.ts index.ts
    inventory/     (movimientos, stock check; ajustes a repuestos)
    inspections/   (formulario del checklist)
    photos/        (galería y subida)
```

---

## Fase 0 — Arreglar lo que el backend nuevo ya rompió y preparar la base
- [ ] **Quitar `stockQuantity` de los repuestos.** Hoy se envía en `CREATE_INVENTORY_PART_MUTATION` y `UPDATE_INVENTORY_PART_MUTATION`
  (`QuerysDefinitions.tsx` líneas ~714-780), en `AddNewInventoryPart.tsx` y en `EditInventoryPart.tsx`. El backend ya no lo acepta:
  - Crear repuesto: el campo pasa a "Stock inicial" con el nuevo argumento del backend (**confirmar su nombre en el schema**).
  - Editar repuesto: sin campo de stock; mostrarlo solo como lectura.
  - La lectura de `stockQuantity` en la tabla (`ColumnsDefinitions.tsx` ~935) no cambia.
- [ ] Verificar que ya no se pida `passwordHash` de `User` en ninguna query.
- [ ] Crear `src/shared/` con: `apiError.ts` (extrae `message` y `extensions.code`; mapa de códigos → ids de `es.json`),
  `useApiMutation` (envuelve `useMutation` + toast de éxito/error), `dates.ts` (única función para parsear y formatear fechas del backend).
- [ ] Crear `src/features/work-orders/` con `constants.ts`: estados, tipos, transiciones permitidas (`Recibido → En proceso → Listo → Entregado`; `Cancelado` desde los tres primeros) — espejo de las reglas del backend para ocultar acciones, no para validar.
- [ ] Componentes compartidos mínimos: `StatusBadge` (estado de orden con color y texto, no solo color), `EmptyState`, `ConfirmDialog`.
- [ ] Componentes táctiles compartidos: `IconButton`, `ActionBar` (fija abajo en móvil), `ResponsiveList` (tarjetas / tabla), `QuantityStepper`, `BottomSheet`.
- [ ] Revisar que `SimpleModal` sirva en móvil (ancho completo, scroll interno, cierre fácil); si no, usar `BottomSheet` para formularios nuevos.
- [ ] Convención de iconos: una tabla única acción → icono (agregar, editar, quitar, foto, siguiente estado, cancelar, ver) para usar el mismo en toda la app.
- [ ] Confirmar la URL del backend/GraphQL y cómo se envía el token (`AuthContext`), para que `createdBy` se llene.

## Fase 1 — Lista de órdenes (solo lectura)
- [ ] `api/workOrders.queries.ts`: `GET_WORK_ORDERS` (campos de la lista: id, tipo, estado, entrada, total facturado, vehículo con marca y modelo, empresa).
- [ ] Revisar si `ServerDataTable` permite pasar `where` y orden; si no, añadir una prop opcional compatible hacia atrás (cambio mínimo).
- [ ] `hooks/useWorkOrderColumns.ts` (escritorio) y `components/WorkOrderCard.tsx` (móvil/tableta: placa, marca y modelo, estado con `StatusBadge`, tipo, fecha, total), unidos con `ResponsiveList`. Toda la tarjeta es tocable para abrir la orden.
- [ ] Filtros: chips de estado (un toque), tipo y fechas en un `BottomSheet`; estado en la URL con `useSearchParams`. Botón flotante "+" para nueva orden.
- [ ] Página `pages/WorkOrdersPage.tsx`, ruta `/ordenes`, entrada en `AppSidebar`, claves en `es.json`.
- Hecho cuando: la lista carga (vacía y con datos), pagina y filtra; estados de carga, error y vacío resueltos.

## Fase 2 — Detalle de una orden (solo lectura)
- [ ] `GET_WORK_ORDER` con **fragments** por sección (cabecera, repuestos, servicios, fotos, inspecciones).
- [ ] Ruta `/ordenes/:id` y `pages/WorkOrderDetailPage.tsx` que solo compone secciones.
- [ ] Secciones como componentes independientes que reciben datos por props: `WorkOrderHeader` (estado, vehículo, empresa, fechas, choferes), `WorkOrderTotals`, `PartsSection`, `ServicesSection`, `PhotosSection`, `InspectionsSection` (las últimas, vacías por ahora).
- [ ] Navegación entre secciones con pestañas con icono (repuestos, servicios, fotos, inspección) pegadas arriba; en móvil, una sección a la vez y totales siempre visibles en la `ActionBar`.
- [ ] Orden `Entregado`/`Cancelado`: indicar claramente que es de solo lectura.

## Fase 3 — Crear orden
- [ ] `EntityPicker` genérico (buscador sobre una query con paginación) en `shared`; usarlo como selector de **vehículo**.
- [ ] `components/WorkOrderForm.tsx` (sirve para crear y para editar datos generales): tipo, motivo (`reportedIssue`), notas, choferes. Tipo de orden como **botones grandes con icono** (no un desplegable); formulario en `BottomSheet`; el selector de vehículo busca por placa con teclado cómodo.
- [ ] `hooks/useCreateWorkOrder.ts` → `crearOrden`; al éxito, ir al detalle de la orden nueva.
- [ ] Error `OPEN_ORDER_EXISTS`: mensaje claro y enlace a la orden abierta del vehículo.
- [ ] Editar datos generales con `actualizarOrden` (⚠️ confirmar argumentos).

## Fase 4 — Cambios de estado y cancelación
- [ ] `components/WorkOrderStatusStepper.tsx` (línea de progreso con iconos) y `WorkOrderActions.tsx`: **un solo botón grande** en la `ActionBar` con el siguiente estado válido (icono + texto corto); "Cancelar" separado y menos prominente.
- [ ] `hooks/useChangeStatus.ts` → `cambiarEstadoOrden`. Al pasar a `Entregado`, mostrar `exitTimestamp`.
- [ ] Cancelar con `ConfirmDialog` que explique que **se quitarán los repuestos y se devolverá el stock** (`cancelarOrden`).
- [ ] Manejar el error de transición inválida del servidor aunque la UI ya oculte las opciones.

## Fase 5 — Repuestos y servicios de la orden
- [ ] Selector de repuesto (`EntityPicker` en `BottomSheet`) mostrando nombre, precio y **stock disponible**; búsqueda por nombre.
- [ ] `PartsSection`: cada repuesto como tarjeta con `QuantityStepper` (+/−) para la cantidad y `IconButton` para quitar; agregar con un botón "+" . Hooks: `useAddPart`, `useEditPart`, `useRemovePart`.
- [ ] `ServicesSection`: agregar, editar, quitar; mecánico opcional (selector reutilizable de mecánicos).
- [ ] Mostrar los totales que devuelve el backend tras cada cambio; no recalcular en cliente.
- [ ] Errores `INSUFFICIENT_STOCK` y `ORDER_CLOSED` con mensajes claros; botones deshabilitados mientras guarda.
- [ ] Confirmar argumentos de las mutations ⚠️ (`quitarRepuestoOrden`, `editarServicioOrden`, `quitarServicioOrden`).

## Fase 6 — Inventario con movimientos
- [ ] `features/inventory`: lista de movimientos de un repuesto (`inventoryMovements`), con tipo, cantidad con signo, orden asociada y fecha.
- [ ] Acción "Registrar movimiento" (`registrarMovimiento`): solo `Compra` y `Ajuste` en el selector (más `Inicial` si aplica); `unitCost` solo para compras; validar el signo en el formulario.
- [ ] Vista de consistencia (`inventoryStockCheck`) para administradores: aviso si hay diferencias.
- [ ] Enlazar desde la tabla de repuestos existente (acción "Ver movimientos") sin ampliar `ColumnsDefinitions.tsx`.

## Fase 7 — Inspecciones (checklist)
- [ ] Registro de campos por tipo: `{ text, textarea, number, checkbox, date, select, radio }` → componente. `options` ya llega como lista. Versión táctil: `checkbox` como interruptor grande o par ✓/✗ de un toque, `select`/`radio` como botones tipo "chip", `number` con teclado numérico.
- [ ] Formulario largo (25 ítems): una categoría a la vez con avance (paso 2 de 8) o secciones plegables; progreso visible y guardado en lote al terminar cada categoría para no perder datos.
- [ ] `features/inspections/components/InspectionForm.tsx` genérico: recibe los grupos de `inspectionForm`, pinta por categoría y devuelve los valores.
- [ ] `crearInspeccion` (Entrada/Salida; error `INSPECTION_EXISTS`), `editarInspeccion`, `guardarResultadosInspeccion` en lote.
- [ ] Opción "exigir completitud" (`validarCompletitud`) al cerrar; marcar ítems obligatorios.
- [ ] Mostrar la inspección guardada en solo lectura en órdenes cerradas.
- [ ] (Después) pantalla de administración de categorías e ítems del checklist.

## Fase 8 — Fotos
- [ ] `shared/FileDropzone` (react-dropzone) y `features/photos/components/PhotoGallery.tsx` agrupada por etapa (`Antes`, `Despues`, `Otro`) con vista ampliada.
- [ ] Subida: decidir entre `photoUrl` y `photoFile` (el backend sube a Azure Blob) — `apollo-upload-client` ya está instalado. Probar contra el backend real primero.
- [ ] Ligar una foto a la inspección de la misma orden (selector opcional).
- [ ] Fotos de una orden `Entregado`: solo visualización.
- [ ] Captura con la cámara directa (`input type="file" accept="image/*" capture`) desde un botón con icono de cámara fijo en la `ActionBar`; la etapa (`Antes`/`Despues`) se elige con dos botones antes de tomar la foto. Reducir el tamaño de la imagen antes de subirla (red móvil) y mostrar miniaturas.

## Fase 9 — Entrega y devolución de alquileres
- [ ] Listas y formularios de alquileres (`vehicleRentals`, `addVehicleRental`, `updateVehicleRental`) y facturas, solo lo mínimo.
- [ ] Orden de tipo `Entrega`/`Devolucion` ligada a un alquiler (`rentalId`): flujo guiado con inspección de Entrada y Salida, fotos y firmas.
- [ ] Firmas de los choferes: lienzo táctil a pantalla completa con botones grandes "borrar" y "aceptar"; guardar la URL.

## Fase 10 — Cierre y calidad
- [ ] Decidir y agregar corredor de pruebas (Vitest + Testing Library) y cubrir: transiciones, mapa de errores, registro de campos, `dates.ts`.
- [ ] Revisar accesibilidad (teclado, etiquetas, contraste), modo oscuro y móvil en todas las pantallas nuevas: tamaños táctiles, sin scroll horizontal, teléfono (~390 px) y tableta (~820 px) en vertical y horizontal.
- [ ] Probar en dispositivos reales (el mismo teléfono y tableta del taller): cámara, teclado numérico, red lenta.
- [ ] Permisos por rol en rutas y botones (el backend aún no exige sesión: no confiar en la UI como seguridad).
- [ ] Unificar horas cuando el backend lo haga; solo debe cambiar `shared/utils/dates.ts`.
- [ ] Actualizar `docs/` con lo que cambie en la API, y quitar las marcas ⚠️ de lo ya probado.

---

## Decisiones abiertas
| Tema | Pregunta |
|---|---|
| Nombre del argumento de stock inicial | Confirmar en el schema antes de la Fase 0. |
| Roles | ¿Qué roles pueden crear órdenes, mover stock, entregar? Hoy solo hay rol 1 (admin) en rutas protegidas. |
| Subida de fotos | `photoFile` (Azure) frente a URL externa. |
| Tests | ¿Agregar Vitest? |
| Firmas | Cómo se capturan y dónde se guardan. |
| Sin conexión | ¿El taller tiene señal estable? Si no, habría que guardar borradores en el dispositivo (más trabajo; hoy no está en el plan). |
| Dispositivos | ¿Qué modelos de teléfono/tableta y navegador se usan? Define los tamaños de prueba y si la cámara funciona con `capture`. |
| Código viejo de farmacia | `Medicines`, `Suppliers`, `Sales`… son del template original; ¿se eliminan en otra tarea? |

---

## Flujo de recepción y entrega (2026-11-08)
Diseño: [`superpowers/specs/2026-11-08-work-orders-redesign-design.md`](./superpowers/specs/2026-11-08-work-orders-redesign-design.md) ·
Plan: [`superpowers/plans/2026-11-08-work-orders-redesign.md`](./superpowers/plans/2026-11-08-work-orders-redesign.md).
- [x] Recepción por pasos en `/ordenes/recibir` (vehículo y motivo de lista fija → inspección de entrada → firma); retomar en `/ordenes/:id/recibir`.
- [x] Entrega por pasos en `/ordenes/:id/entregar` (inspección de salida → quien recoge y firma → `Entregado`).
- [x] Checklist dinámico: una categoría por paso, obligatorios validados con `validarCompletitud`; sí/no como switch (empieza en "No").
- [x] Tablero con servicios, tiempo transcurrido, atrasadas (`OVERDUE_MINUTES`) y recepción incompleta.
- [x] Servicios elegidos de un catálogo fijo (`SERVICE_CATALOG`); motivos fijos (`ORDER_REASONS`), en `features/work-orders/constants.ts`.
- [ ] Pendiente backend: exigir inspección y firma al cambiar de estado (hoy solo lo aplica la UI).
- [ ] Probar en navegador (390 px y 820 px, claro y oscuro) y con el backend real; `npm run lint` no corre porque el repo no tiene `eslint.config.js`.
