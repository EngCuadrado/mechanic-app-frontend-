# Taller exprés: carros, repuestos y fotos en tablet horizontal

Fecha: 2026-11-22 · Estado: aprobado · Reglas: `AGENTS.md` (§7 tablet horizontal) · Continúa
[`2026-11-08-work-sheets-design.md`](./2026-11-08-work-sheets-design.md) · Plan de liberación: `../../../../docs/plan-liberacion.md`

## Intención
La app es para una **flotilla propia que se alquila**, no para un taller con clientes. Lo que pidieron controlar: **los carros, los
repuestos y las fotos**. Entran y salen **más de 10 carros al día** (más de 20 recepciones y entregas). La usa **una sola persona
(administrador o gestor) en una tablet Android horizontal de 1280×800**. Los mecánicos no usan la app: el gestor asigna y registra por ellos.

Hoy una recepción pasa por unas 10 pantallas (vehículo, 8 categorías del checklist una por una con los sí/no empezando en "No", y firma),
la orden se ve en una columna angosta y lo más visible son los precios. Se busca que **recibir o entregar un carro tome alrededor de 1 minuto**,
y que el gestor vea de un vistazo dónde está cada carro.

## Metas
1. **Recepción y entrega exprés:** placa → motivo y km → fotos guiadas → excepciones del checklist → firma, en **3 pantallas**.
2. **Fotos como evidencia:** 5 tomas fijas por recepción y por entrega, y comparar entrada contra salida del mismo ángulo.
3. **Carros:** el estado del vehículo cambia solo con la orden; vista de flotilla y ficha del carro con su historial.
4. **Repuestos:** agregar con stock visible y guardar al momento; avisos de stock bajo.
5. **Tablet horizontal:** tablero de 3 columnas y detalle en dos paneles desde `lg:` (≥1024 px), sin scroll para lo principal.
6. **Reglas en el backend:** no avanzar sin recepción completa, no pasar a `Listo` sin trabajo, no entregar sin salida completa.

## No metas
- Facturación, cobro a empresas, roles nuevos, modo sin conexión.
- Leer el kilometraje de la foto (OCR). El km se escribe con teclado numérico y la foto del tablero lo respalda.
- Cambios de esquema de base. Todo cabe en columnas que ya existen (ver "Datos").

## Anti-metas
- Más de 3 pantallas para recibir o entregar.
- Tocar 20 interruptores para decir que todo está bien.
- Precios y totales como lo más visible de la orden.
- Una acción destructiva (cancelar) con el mismo peso que la acción principal.

## Decisiones del usuario
1. Usuario único: administrador o gestor; los mecánicos no usan la app.
2. Enfoque: carros, repuestos y fotos; más de 10 carros entran y salen por día.
3. Dispositivo: tablet Android 10-11" horizontal (1280×800); breakpoint de diseño `lg:`.
4. Fotos: las 4 exteriores obligatorias; Tablero opcional; se pueden agregar más (2026-11-22).
5. Sin fecha prometida (2026-11-22).
6. Checklist: lo decide Claude → **empieza en "Sí, bien"** y se marcan solo las excepciones (reemplaza la decisión del 2026-11-08).

## Diseño

### Tablero (`/ordenes`)
- **3 columnas siempre visibles** desde `lg:`: Recibido · En proceso · Listo. Las entregadas hoy pasan a un **contador** en el encabezado
  (toca y abre el historial filtrado), no a una cuarta columna.
- **Tarjeta compacta** (~88 px): placa grande, marca y modelo, motivo, mecánicos, **tiempo en taller**, y una marca de "Recepción incompleta"
  cuando aplique. Sin el botón "Pasar a…": se avanza arrastrando o desde el detalle. Se quita la alerta "Atrasada" de 4 h.
- Encabezado: buscador por placa (siempre visible), contador "Entregadas hoy" y botón principal **Recibir carro** (abajo a la derecha en tablet).

### Recepción exprés (`/ordenes/recibir`, 3 pasos con `StepFlow`)
1. **Carro:** buscar por placa (`EntityPicker`), motivo en chips (como hoy), **kilometraje** con teclado numérico, prellenado con el último
   conocido, y quien lo trae. Si el carro ya tiene orden abierta, "Ver orden" (como hoy).
2. **Fotos y checklist en una pantalla** (en `lg:`, fotos a la izquierda y checklist a la derecha):
   - **Fotos guiadas:** 5 casillas fijas (Frente, Atrás, Lado izquierdo, Lado derecho, Tablero y km). Tocar una casilla abre la cámara; la
     foto queda como miniatura. Se guardan con `stage = Antes`, `category` = el ángulo y ligadas a la inspección de Entrada.
   - **Checklist por excepción:** todas las categorías visibles a la vez (en 2 columnas). Los sí/no **empiezan en "Sí, bien"** y solo se tocan
     los que tienen problema; al marcar uno con problema aparece su nota opcional. Cada categoría tiene **"Todo bien"**. Números (combustible)
     con +/− o chips (¼, ½, ¾, lleno); los `select` como chips.
3. **Firma** de quien entrega (como hoy) → la orden queda `Recibido` y el carro pasa a `MANTENIMIENTO`.

**Obligatorias** para pasar al paso 3: las 4 exteriores (Frente, Atrás, Lado izquierdo, Lado derecho). **Opcionales:** Tablero y km, y
**fotos extra** sin límite (casilla "＋ Otra foto", `category = extra`) para golpes o detalles.

### Entrega exprés (`/ordenes/:id/entregar`, mismos 3 pasos)
1. **Salida:** km (prellenado con el de entrada) y quien lo recoge.
2. **Fotos guiadas de salida** (`stage = Despues`) con la foto de entrada del mismo ángulo al lado en miniatura para comparar, y checklist
   por excepción.
3. **Firma** → `Entregado` y el carro vuelve a `ALQUILADO` si tiene empresa o a `DISPONIBLE` si no.

### Detalle de la orden (`/ordenes/:id`), dos paneles en `lg:`
- **Izquierda (≈60 %): Trabajo.** Servicios y repuestos en una lista (como hoy). Repuestos con +/− que **guardan al momento** (cada toque es
  una mutation; el botón se deshabilita mientras guarda). Botón "＋ Agregar" (la hoja actual).
- **Derecha (≈40 %): Carro y registro.** Placa, modelo, empresa, km de entrada, tiempo en taller; tira de miniaturas de fotos (abre la galería);
  filas de inspecciones y firmas; enlace a la ficha del carro. El total va aquí, pequeño.
- **Acción principal** abajo a la derecha: siguiente estado. **Cancelar** pasa a un menú "⋯" del encabezado con confirmación.
- En vertical o celular se apila: Carro → Trabajo → Registro.

### Flotilla (`/flotilla`) y ficha del carro (`/flotilla/:vehicleId`)
- **Flotilla:** chips de estado con conteo (En taller · Alquilado · Disponible · Fuera de servicio) y buscador por placa. Tarjetas en
  cuadrícula de 3 columnas en `lg:`: placa, modelo, empresa, estado, km, próximo mantenimiento y seguro por vencer marcado.
- **Ficha del carro:** datos, orden abierta (si hay), **historial de órdenes**, **galería por orden** con comparación entrada/salida por ángulo,
  y **repuestos usados** en ese carro.
- Reemplaza en el menú a la tabla vieja de vehículos para el uso diario; la tabla vieja queda para editar datos del vehículo.

### Inventario
- En la hoja "Agregar → Repuesto": stock visible en cada fila y aviso cuando queda bajo el mínimo (`minStockAlert`).
- Lista de repuestos con stock bajo en el tablero (un contador que abre la lista). Sin pantalla nueva de inventario.

## Backend (cambios mínimos)
| Cambio | Dónde |
|---|---|
| `crearOrden` pone el vehículo en `MANTENIMIENTO`; `cambiarEstadoOrden` a `Entregado` y `cancelarOrden` lo regresan a `ALQUILADO` (con empresa) o `DISPONIBLE` (sin empresa). Misma transacción. | `WorkOrderMutations.cs` + regla pura en `BusinessRules.cs` |
| `Recibido → En proceso` exige inspección de Entrada y firma de entrega (`RECEPTION_INCOMPLETE`). | ídem |
| `En proceso → Listo` exige al menos un servicio o repuesto (`NO_WORK`). | ídem |
| `Listo → Entregado` exige inspección de Salida y firma de quien recoge (`DELIVERY_INCOMPLETE`). | ídem |
| `crearInspeccion` actualiza `vehicles.current_mileage` si el km es mayor. | `InspectionMutations.cs` |
| Tests de las reglas nuevas. | `WebApi.Tests` |

Los códigos nuevos se traducen en `shared/utils/apiError.ts` y `es.json`. Contrato actualizado en `docs/work-orders-api.md`.

## Datos (sin cambios de esquema)
- Ángulo de la foto → `work_order_photos.category` (`front`, `back`, `left`, `right`, `dash`, `extra`; textos en `es.json`).
- Etapa → `stage` (`Antes` en recepción, `Despues` en entrega). Liga a la inspección con `vehicle_inspection_id`.
- Km → `vehicle_inspections.mileage` y `vehicles.current_mileage`.
- Tiempo en taller → `status_changed_at` / `entry_timestamp` (pendiente la zona horaria; ver plan de liberación, Fase 3).

## Reutilización
Reusar: `StepFlow`, `EntityPicker`, `ChoiceChips`, `SegmentedControl`, `QuantityStepper`, `SignaturePad`, `BottomSheet`, `ConfirmDialog`,
`ActionBar`, `IconButton`, `PhotoCaptureButton` + `shrinkImage`, `useApiMutation`, `fields.tsx` (registro de campos del checklist),
`useChecklist`, `AddWorkSheet`, `WorkList`, `WorkOrderCard`.
Crear: `GuidedPhotos` (casillas de ángulos, en `features/photos`), `ChecklistBoard` (todas las categorías, por excepción, en
`features/inspections`), `features/fleet` (página de flotilla y ficha del carro), `TwoPane` en `shared/` si se usa en 2+ pantallas.
Eliminar: `usePartsDraft` (guardado con retraso), el botón "Pasar a…" de `BoardCard`, `OVERDUE_MINUTES`, el checklist de una
categoría por paso (`ChecklistStep`/`ChecklistFlow`) cuando nada los use.

## Fases (cada una se puede liberar sola)
1. **Backend:** estado del vehículo automático, bloqueos de avance, km, tests.
2. **Recepción y entrega exprés:** `GuidedPhotos` + `ChecklistBoard` + km.
3. **Tablero y detalle en tablet:** 3 columnas, tarjeta compacta, dos paneles, cancelar en menú, repuestos al momento.
4. **Flotilla y ficha del carro** con historial, fotos comparadas y repuestos usados.

## Riesgos
- **Checklist en "Sí, bien" por defecto** permite pasar por encima sin mirar. Se compensa con las 4 fotos exteriores obligatorias y la firma.
- Subir 5 fotos por carro (más de 100 al día) en red móvil: `shrinkImage` antes de subir, subida en segundo plano por casilla con
  reintento, y la casilla muestra si falló.
- Las reglas nuevas del backend pueden dejar órdenes viejas sin poder avanzar (sin inspección o firma): la UI ofrece "Completar recepción".
- La zona horaria sigue mal (Fase 3 del plan de liberación): el "tiempo en taller" puede salir corrido hasta corregirla.

## Preguntas abiertas
Ninguna. Estado: **aprobado** el 2026-11-22.
