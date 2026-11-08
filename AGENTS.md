# AGENTS.md — reglas para trabajar en este frontend

Aplican a cualquier persona o agente que modifique este repo. Si una regla estorba, no la rompas en silencio:
dilo y proponlo.

## Stack (no agregar alternativas sin preguntar)
React 19 + TypeScript + Vite · Tailwind (TailAdmin) · Apollo Client 4 (`@apollo/client/react`) · react-router 7 ·
react-intl (`src/lang/es.json`) · TanStack Table · sonner (toasts) · Headless UI · Heroicons · dayjs · react-dropzone.

## 1. Estructura: por funcionalidad, no por tipo de archivo
Todo lo nuevo vive en `src/features/<nombre>/`. Una funcionalidad nueva no se mezcla en carpetas globales.

```
src/features/<nombre>/
  api/          documentos GraphQL (queries, mutations, fragments), un archivo por tema
  hooks/        hooks que envuelven Apollo (useWorkOrders, useAddPart…)
  components/   piezas de UI de esta funcionalidad, pequeñas
  pages/        componentes de ruta; solo componen, casi sin lógica
  types.ts      tipos de esta funcionalidad
  constants.ts  estados, tipos, transiciones
  index.ts      API pública: lo único que otras features pueden importar
src/shared/     piezas reutilizables entre features (ver §3)
```

- Una feature **no importa archivos internos de otra**: solo desde su `index.ts`.
- `shared/` no importa de `features/`. Las dependencias van en una sola dirección: `pages → features → shared`.
- El código viejo (`src/components/ui/...`) se puede **usar**, pero no se amplía con funcionalidad nueva.

## 2. Prohibido crecer los monolitos
`src/components/ui/table/QuerysDefinitions.tsx` (~1000 líneas) y `ColumnsDefinitions.tsx` (~1100 líneas) ya son
demasiado grandes. **No agregues nada a esos archivos.** Las queries nuevas van en `features/*/api/`, las columnas en
`features/*/components/` o `hooks/`. Si tocas código viejo, es solo para corregirlo; no lo reorganices en el mismo cambio.

## 3. Reutilizable por defecto
- Antes de crear un componente, busca si ya existe uno en `src/shared/`, `src/components/form/`, `src/components/ui/`.
- Si algo se usará en 2 o más lugares, va a `shared/` desde el principio (insignia de estado, selector de entidad, diálogo de
  confirmación, texto de moneda/fecha, campo de formulario, zona de carga de archivos…).
- Componentes **presentacionales** (reciben props, sin Apollo adentro) y **contenedores** o hooks que traen los datos. Un
  componente no hace fetch y a la vez dibuja una pantalla entera.
- Si un archivo pasa de ~200 líneas o hace más de una cosa, divídelo.
- Formularios: un componente de formulario que sirva para crear y para editar (`initialValues` opcional), no dos copias
  (`AddNewX` / `EditX`) como en el código viejo.
- Cosas que dependen de un valor (tipo de input del checklist, estado, tipo de movimiento) se resuelven con un **mapa/registro**
  (`{ checkbox: CheckboxField, select: SelectField, … }`), no con cadenas de `if`/`switch` repetidas.

## 4. GraphQL
- Una operación = un archivo o un grupo corto por tema, con nombre explícito (`GET_WORK_ORDER`, `ADD_WORK_ORDER_PART`).
- Pide solo los campos que la pantalla usa. Usa **fragments** para los campos compartidos (vehículo, orden resumida…).
- Variables y respuestas **tipadas** (`types.ts`); nada de `any` nuevo en props ni en datos de API.
- El contrato del backend está en `docs/work-orders-api.md` y `docs/work-orders-database.md`. Esos documentos y el código deben
  coincidir: si la API cambia, actualiza los docs en el mismo cambio.
- Tras una mutation, actualiza lo necesario con `refetchQueries` acotado o actualizando la caché; no recargues la página ni
  traigas todo otra vez.
- Operaciones marcadas ⚠️ en los docs no están probadas: confirma los argumentos reales contra el schema antes de usarlas.

## 5. Errores y mensajes
- Toda mutation pasa por un único helper compartido que extrae `message` y `extensions.code` y lo muestra con `sonner`.
  Los códigos conocidos (`INSUFFICIENT_STOCK`, `ORDER_CLOSED`, `OPEN_ORDER_EXISTS`, `INSPECTION_EXISTS`, `RESULT_EXISTS`) se
  traducen a mensajes de `es.json`; el resto muestra el mensaje del servidor.
- Nunca muestres `stackTrace` ni `extensions.message` al usuario.
- Cada pantalla de datos maneja los tres estados: cargando, error, vacío.
- Botones de acciones que escriben se deshabilitan mientras la mutation está en curso.

## 6. Textos e i18n
- Ningún texto fijo en JSX: `FormattedMessage` o `intl.formatMessage` con `id` + `defaultMessage`.
- Las claves van en `src/lang/es.json`, con prefijo por feature (`workOrder.…`, `inventory.movement.…`), en orden alfabético.

## 7. Móvil y tableta primero (uso en el taller, con una mano y a veces con guantes)
La app se usa sobre todo en celular y tableta. Se diseña primero para pantalla táctil y después se adapta al escritorio.
- **Controles táctiles:** área mínima de toque de 44×44 px, con separación suficiente entre botones. Nada de acciones pegadas.
- **Iconos primero, texto cuando hace falta:** las acciones frecuentes y reconocibles (agregar, editar, quitar, foto, siguiente
  estado) son botones con icono (Heroicons). Todo botón con solo icono lleva `aria-label` y `title`. Las acciones destructivas
  (cancelar, quitar) o poco obvias llevan icono **y** texto corto. Un solo estilo de icono para la misma acción en toda la app.
- **Simple e intuitivo:** una acción principal por pantalla, visible y abajo al alcance del pulgar (barra de acciones fija en la
  parte inferior en móvil). Pasos cortos; sin menús anidados ni flujos de más de 2-3 toques para lo frecuente.
- **Entradas cómodas:** usa el teclado correcto (`inputMode="numeric"`, `type="tel"`, `type="date"`), selectores y botones
  de más/menos para cantidades, interruptores grandes para sí/no, y evita escribir texto libre cuando se puede elegir.
- **Listas:** en pantalla chica una lista de órdenes o repuestos se muestra como **tarjetas**, no como tabla con scroll lateral.
  Nunca debe aparecer scroll horizontal en toda la página.
- **Cámara y archivos:** las fotos se capturan con la cámara del dispositivo (`<input type="file" accept="image/*" capture>`).
  Muestra miniaturas, no la imagen completa, en las listas.
- **Confirmar solo lo importante** (cancelar, entregar, quitar): confirmación breve, botones grandes y claros. El resto se
  deshace o corrige sin diálogos.
- **Estado siempre visible:** estado de la orden, errores y confirmaciones se ven sin hacer scroll (toast + marca en el elemento).
- **Rendimiento en red móvil:** paginar, no traer todo; carga progresiva; miniaturas ligeras.
- Se prueba cada pantalla nueva en viewport de teléfono (~390 px) y de tableta (~820 px), vertical y horizontal, además de escritorio.

## 8. Estilo y accesibilidad
- Tailwind con las clases y colores `brand-*` del proyecto; soporta modo oscuro (`dark:`) en todo lo nuevo.
- Botones y controles con etiqueta accesible; formularios con `Label` asociado; foco visible; no solo color para indicar estado.
- Mismo patrón visual que el resto de la app (tablas con `ServerDataTable`, modales con `SimpleModal`, toasts con `sonner`).
  No introduzcas otra librería de UI.

## 9. Reglas de negocio
- **El backend es la autoridad.** La UI puede ocultar o deshabilitar opciones inválidas (por ejemplo transiciones de estado),
  pero nunca asume que la validación local basta: siempre maneja el error del servidor.
- **No escribas el stock a mano.** El stock cambia solo con movimientos (`registrarMovimiento`) o al usar repuestos en una
  orden. Ninguna pantalla envía `stockQuantity`.
- Las órdenes `Entregado` y `Cancelado` son de solo lectura en la UI.
- Las fotos de una orden `Entregado` son evidencia: sin editar ni borrar.
- Los totales de una orden los calcula el backend; la UI los muestra, no los recalcula.

## 10. Fechas
Toda la lógica de fechas pasa por `shared/utils/` (una sola función para parsear y formatear). Hoy el backend mezcla fechas
UTC y hora local del servidor (ver "Pendientes" en `docs/work-orders-api.md`). Ese conocimiento se queda en esa función;
ningún componente hace `new Date(texto)` por su cuenta.

## 11. Cómo trabajar un cambio
1. Lee el docs de API y esta guía; busca algo parecido ya hecho.
2. Cambios pequeños y enfocados: una funcionalidad por cambio, sin refactors ajenos.
3. Antes de dar algo por terminado: `npm run build` y `npm run lint` pasan, y probaste la pantalla en el navegador
   (flujo normal, estado de error y estado vacío; modo claro y oscuro; viewport de teléfono y de tableta).
4. No hagas commit de secretos ni de `.env`. No ejecutes SQL contra la base desde este repo.
5. Si algo es ambiguo, pregunta antes de inventar una API o un campo.
