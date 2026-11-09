# Rediseño de hojas y formularios de órdenes de trabajo

Fecha: 2026-11-08 · Estado: pendiente de aprobación · Reglas del repo: `AGENTS.md` · Continúa [`2026-11-08-work-orders-redesign-design.md`](./2026-11-08-work-orders-redesign-design.md)

## Intención
Agregar servicios y repuestos a una orden se siente raro: cada cosa funciona distinto (una hoja con Guardar apagado, otra que autoguarda con "Guardando…"),
hay que abrir la hoja varias veces, las pestañas se cortan y la pantalla de la orden es una pila larga de tarjetas. Se busca el estilo "Apple/Google":
simple, una sola forma de hacer cada cosa, con la acción principal siempre visible. Alcance: **solo órdenes de trabajo**. Los modales viejos de catálogos
(`SimpleModal` en vehículos, inventario, empleados…) no se tocan en este cambio.

## Metas
- Una sola forma de agregar: un botón "＋ Agregar" abre **una hoja** con selector Servicio | Repuesto.
- Servicios y repuestos en **una sola lista de "Trabajo"**, con total.
- Toda hoja (agregar, nota, confirmar, firmar) comparte la misma anatomía: título + cerrar, contenido, **botón principal fijo abajo** que dice qué falta si está apagado.
- Elegir antes que escribir (chips, +/−, teclado numérico); móvil primero; dark y light.

## No metas
- No cambia el backend ni los flujos de recepción y entrega.
- No se rediseñan formularios de catálogos (vehículos, inventario, empleados, empresas).
- No se agregan roles ni permisos.

## Anti-metas
- Dos hojas apiladas una sobre otra (como hoy mecánico sobre servicio).
- Guardado silencioso con retraso sin confirmación visible.
- Botón principal que queda fuera de pantalla al hacer scroll.

## Decisiones del usuario
1. Servicios y repuestos juntos en una lista y una hoja "Agregar" (confirmado con la maqueta).
2. El **costo interno se pide** (lo que cuesta ese servicio); lo piden por lo general los servicios extras de enderezado y pintura.

## Diseño

### Pantalla de la orden (`WorkOrderDetailPage`)
- Encabezado: placa, modelo, estado con tiempo transcurrido, `StatusProgress`.
- Sección **Trabajo**: lista única de servicios y repuestos (icono distinto). Servicio: nombre, mecánico, precio. Repuesto: nombre, `QuantityStepper`, precio. Quitar con icono papelera y confirmación breve solo si ya hay stock descontado. Total del backend abajo de la lista.
- Sección **Registro** (de solo lectura, plegada en filas): Recepción (firma, inspección de entrada), Fotos, Entrega (cuando existe). Cada fila abre una hoja; fotos conserva la cámara.
- `ActionBar` fija: "＋ Agregar" y el siguiente estado (y cancelar, como hoy). Se elimina `HandoverSection` de esta pantalla (la firma se captura en recibir/entregar) y las pestañas "Ver todo".

### Hoja "Agregar" (`AddWorkSheet`)
Selector segmentado Servicio | Repuesto arriba.
- **Servicio:** chips del catálogo (`SERVICE_CATALOG`); **precio** con teclado numérico; **mecánico** como chips (activos del servidor, hasta 12); si el servicio es externo (enderezado, pintura) aparece **costo interno** obligatorio. Botón fijo "Agregar servicio", apagado muestra qué falta ("Elige el servicio", "Falta el precio").
- **Repuesto:** buscador; tocar una fila la selecciona y muestra su +/−; el botón fijo dice "Agregar N repuestos" y los manda todos juntos. Si uno falla (`INSUFFICIENT_STOCK`) se avisa y queda seleccionado el que falló.

### Otras hojas
Nota de ítem, confirmaciones (cancelar, quitar) y fotos usan la misma anatomía (`BottomSheet` con pie fijo). `ConfirmDialog` pasa a ser una hoja con dos botones grandes. El error `OPEN_ORDER_EXISTS` ofrece "Ver orden" que lleva a la orden abierta.

## Decisiones mías (a revisar)
- El **costo interno** solo se pide en servicios marcados como externos en el catálogo (dos entradas nuevas en el catálogo: enderezado `bodywork` y pintura `paint`); en el resto queda en 0. Si quieres pedirlo en todos, es cambiar una marca.
- Mecánicos como chips con tope de 12; si el taller tiene más, hará falta buscador.
- Fotos y firmas pasan a "Registro" (solo ver/agregar fotos) en vez de ocupar la pantalla.
- Se conserva `usePartsDraft` para ajustar cantidades en la lista, pero **al agregar desde la hoja se guarda al momento** (sin esperar 1.5 s) y se avisa con un toast.

## Reutilización
Reusar: `BottomSheet` (añadir prop `footer` fijo), `ChoiceChips`, `QuantityStepper`, `EntityPicker`/`SEARCH_PARTS`, `SEARCH_MECHANICS`, `useApiMutation`, `ActionBar`, `IconButton`, `Tabs` para el selector segmentado, mutations de `itemMutations.ts`.
Crear: `AddWorkSheet`, `WorkList` (lista única), `RecordRows` (fila → hoja de solo lectura), y un `SegmentedControl` compartido si `Tabs` no sirve.
Eliminar al final: `ServiceSheet` y `ServicesSection`/`PartsSection` antiguos cuando nada los use.

## Riesgos
- `agregarRepuestoOrden` descuenta stock por llamada: agregar varios se hace en serie y se informa el parcial.
- Los mecánicos y repuestos salen del servidor; con red lenta mostrar estados de carga, error y vacío.
- Probar con una orden abierta de prueba a 390 px y 820 px, claro y oscuro.
