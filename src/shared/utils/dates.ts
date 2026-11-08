import dayjs from "dayjs";
import { nicaDate } from "../../utils/dateUtils";

// ÚNICO lugar que conoce cómo llegan las fechas del backend.
// Hoy: un texto sin zona ("2026-11-05T09:14:00") se trata como UTC. Si el backend unifica sus horas
// (ver docs/work-orders-api.md, "Pendientes conocidos"), solo se cambia esta función.
export function parseServerDate(value?: string | null): dayjs.Dayjs | null {
	if (!value) return null;
	const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
	const d = hasZone ? dayjs(value) : dayjs.utc(value);
	return d.isValid() ? d : null;
}

export function formatDateTime(value?: string | null): string {
	const d = parseServerDate(value);
	return d ? nicaDate(d).format("DD/MM/YYYY hh:mm A") : "—";
}

export function formatDate(value?: string | null): string {
	const d = parseServerDate(value);
	return d ? nicaDate(d).format("DD/MM/YYYY") : "—";
}

/** Inicio / fin de un día "YYYY-MM-DD" en hora de Nicaragua, como ISO en UTC (para filtros `where`). */
export function dayStartUtc(day: string): string {
	return dayjs.tz(day, "America/Managua").startOf("day").utc().toISOString();
}
export function dayEndUtc(day: string): string {
	return dayjs.tz(day, "America/Managua").endOf("day").utc().toISOString();
}
