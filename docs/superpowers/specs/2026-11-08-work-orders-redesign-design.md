# Rediseño de órdenes de trabajo: recepción, tablero y entrega

Fecha: 2026-11-08 · Estado: pendiente de aprobación · Reglas del repo: `AGENTS.md`

## Intención
Hoy el taller recibe un carro y empieza a trabajar sin ningún registro. Se introduce un protocolo: **inspección de entrada con firma al recibir, y
inspección de salida con firma al entregar**. Se esperan **10 o más vehículos por día**, así que el flujo debe ser rápido y casi sin escribir.
El código actual de `features/work-orders` ya cubre buena parte (tablero, tarjetas, hojas inferiores, firma); el trabajo es **reorganizar el flujo**
alrededor de la inspección, no empezar de cero.

## Metas
- Recibir un carro en pocos toques, en teléfono o tableta, sin formulario largo hacia abajo.
- Inspección de entrada y de salida **obligatorias**: sin completarlas y firmar no se recibe ni se entrega.
- Casi nada de texto libre: se elige con chips, interruptores y teclado numérico. Solo se escribe lo que no se puede elegir (p. ej. nombre de quien trae o recoge el carro).
- Tablero que responde de un vistazo: qué carros hay, en qué estado, qué servicios se les hacen, cuánto llevan, quién los atiende. Cualquier usuario mueve un carro de estado.
- Componentes pequeños, reutilizables y legibles a primera vista; modo claro y oscuro en todo lo nuevo.

## No metas
- No se crean pantallas de administración de checklist, motivos ni servicios.
- No hay roles ni permisos por mecánico (cualquier usuario puede mover estados).
- No se cambia el backend; si algo falta se anota como pendiente (ver Riesgos).
- No se reorganiza código viejo (`QuerysDefinitions.tsx`, `ColumnsDefinitions.tsx`).

## Anti-metas (fracasa aunque "funcione")
- Un formulario largo que obliga a hacer scroll infinito.
- Poder firmar o entregar sin haber tocado cada ítem obligatorio de la inspección.
- Ítems de inspección marcados "bien" de antemano.
- Botones pequeños, o solo color para indicar estado.

## Decisiones del usuario
1. Recepción obligatoria incluye: motivo, quien lo trae, inspección de entrada, firma, hora de atención y quién atendió. La hora y quién atendió salen solos (hora del servidor y usuario con sesión).
2. **El motivo sale de una lista fija**, sin texto libre. Las listas de motivos y de servicios están **fijas en el frontend** por ahora (`constants.ts`).
3. **La inspección es dinámica**: el backend define categorías, ítems, opciones y obligatorios; la UI los pinta, sin ítems fijos en el código.
4. **Ningún ítem viene marcado**; cada uno se toca. No hay botón "todo bien".
5. Tablero con columnas Recibido, En proceso, Listo, Entregado; la tarjeta se abre al tocarla y avanza con un botón.
6. Cualquier usuario puede mover los carros de estado.
7. La **inspección de salida y la firma de quien recoge son obligatorias** para entregar.
8. Quien recibe el carro asigna el mecánico y registra servicios y repuestos, desde la orden.

## Flujos

### Recepción (reemplaza `NewOrderSheet`)
Pantalla por pasos (barra de progreso arriba, `ActionBar` abajo con "Siguiente"):
1. **Vehículo:** buscar por placa (`EntityPicker`), **motivo** (chips de lista fija) y tipo de orden (chips: Preventivo, Correctivo, Choque), **quien lo trae** (único texto).
2. **Inspección de entrada:** una categoría por paso, con progreso. Cada ítem usa el campo que corresponde a su `inputType`. Ítems obligatorios deben estar completos para avanzar.
3. **Firma** del cliente, con resumen (kilometraje si existe, ítems marcados, fotos). Botón "Recibir vehículo".
Hora y recepcionista no se piden.

### Tablero
- Móvil: una columna a la vez con pestañas y conteos; tableta/escritorio: 4 columnas (ya existe en `StatusBoard`).
- La tarjeta muestra: placa, modelo, **servicios** (máximo 2 y "+N"), **tiempo transcurrido** (rojo y con texto si está atrasado), mecánicos, estado y botón "Pasar a …". Un carro con **recepción incompleta** (ver Riesgos) lo indica y se abre para continuarla.
- Se conserva el arrastre existente; el botón es la vía principal.

### Trabajo en el taller
Desde el detalle: servicios (elegidos de la lista fija, con mecánico opcional) y repuestos. Reutiliza `ServiceSheet`, `ServicesSection`, `PartsSection`, `QuantityStepper`. Los totales vienen del backend.

### Entrega
Al pasar de "Listo" a "Entregado": inspección de salida (mismo componente que la de entrada) → quien recoge (nombre) y su firma → confirmar. Sin completar todo, el botón de entregar queda deshabilitado y explica qué falta.

## Reutilización (qué se reusa, qué se crea)
Reusar tal cual: `BottomSheet`, `IconButton`, `ActionBar`, `EntityPicker`, `SignaturePad`, `Tabs`, `ConfirmDialog`, `StatusBadge`, `StatusBoard`/`BoardColumn`, `ServiceSheet`, `PartsSection`, `useApiMutation`, `FIELD_REGISTRY`.

Crear o mover (siempre presentacional, props arriba, hook/contenedor aparte):
- `shared/components/ChoiceChips`: los chips que hoy están dentro de `ChoiceField` y de `NewOrderSheet` (duplicados); una sola pieza.
- `shared/components/StepFlow`: contenedor de pasos (progreso, cuerpo, barra inferior). Lo usan recepción y entrega.
- `features/inspections/components/ChecklistWizard`: recibe los `groups` del backend, pinta una categoría por paso, devuelve valores y avisa cuando todo lo obligatorio está completo. Reemplaza el uso largo de `InspectionFormView` en estos flujos.
- Ampliar `FIELD_REGISTRY` con: foto opcional por ítem, nota opcional (icono), `textarea` (hoy ausente).
- `features/work-orders/components/ReceptionFlow` y `DeliveryFlow` (componen `StepFlow` + `ChecklistWizard` + `SignatureStep`).
- `SignatureStep` (firma + vista previa + guardar), a partir de `SignatureCard`.
- `constants.ts`: `ORDER_REASONS` y `SERVICE_CATALOG` (listas fijas).
- `inspections/index.ts` exporta lo público; work-orders solo importa de ahí.

Cada archivo nuevo se mantiene bajo ~200 líneas; textos en `es.json` con prefijos `workOrder.` / `inspection.`; todo con clases `dark:`.

## Restricciones
- Cumplir `AGENTS.md` (§1 estructura, §5 errores con `useApiMutation`, §6 i18n, §7 móvil primero, §9 negocio, §10 fechas solo vía `shared/utils/dates.ts`).
- El backend es la autoridad: manejar `OPEN_ORDER_EXISTS`, `INSPECTION_EXISTS`, `RESULT_EXISTS`, `ORDER_CLOSED`.
- Guardar resultados de inspección en lote por categoría (para no perder datos) y cerrar con `validarCompletitud: true`.
- Al terminar: `npm run build`, `npm run lint`, probar a ~390 px y ~820 px, claro y oscuro, con estados de carga, error y vacío.

## Riesgos y pendientes (anotar, no resolver aquí)
- **Orden creada antes de la inspección.** La inspección necesita `workOrderId`, así que la orden se crea al confirmar el paso 1. Si se abandona, queda en "Recibido" sin inspección o firma completas; se marca como "recepción incompleta" en el tablero y se puede continuar o cancelar. (Decisión del diseño.)
- **El backend no exige** inspección ni firma para cambiar de estado; esa regla la aplica la UI. Conviene pedirla también al backend.
- **Fotos por ítem:** el backend liga fotos a la inspección, no al ítem; se usará `category` (nombre del ítem) para identificarlas. Probar contra el backend real (`registrarFotoOrden` ⚠️ sin probar).
- `crearInspeccion`, `guardarResultadosInspeccion`, `editarInspeccion` están ⚠️ sin probar: confirmar argumentos en el schema y actualizar `docs/work-orders-api.md`.
- **Horas:** el backend mezcla zonas; "tiempo transcurrido" y hora de atención dependen de `shared/utils/dates.ts`.
- **Sin `[Authorize]`:** `createdBy` puede quedar `null`; confirmar que el token se envía para registrar quién atendió.
- Los servicios solo tienen descripción/precio/costo en el backend: el catálogo fijo rellena la descripción; el precio sigue capturándose con teclado numérico.

## Lo que queda al implementador
Contenido final de las listas de motivos y servicios, orden y umbral de "atrasado" por estado, forma exacta de la foto por ítem, y la pantalla de detalle (se mantiene la actual salvo ajustes de este documento).
