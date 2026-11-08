/** Tipos que el usuario puede registrar a mano. Uso/Devolucion los genera el backend al usar repuestos en órdenes. */
export const MANUAL_MOVEMENT_TYPES = ["Compra", "Ajuste", "Inicial"] as const;
export type ManualMovementType = (typeof MANUAL_MOVEMENT_TYPES)[number];
