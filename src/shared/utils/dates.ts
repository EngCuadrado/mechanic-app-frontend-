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

/** Minutos desde `value` hasta ahora; nunca negativo (fechas del backend sin zona o adelantadas). */
export function elapsedMinutes(value?: string | null, now: dayjs.Dayjs = dayjs.utc()): number {
	const d = parseServerDate(value);
	return d ? Math.max(0, now.diff(d, "minute")) : 0;
}

/** 45 → "45 min", 130 → "2 h 10 min", 1500 → "1 d 1 h". */
export function formatElapsed(minutes: number): string {
	if (minutes < 60) return `${minutes} min`;
	if (minutes < 1440) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
	return `${Math.floor(minutes / 1440)} d ${Math.floor((minutes % 1440) / 60)} h`;
}

/** "hace 3 horas". Depende de que parseServerDate interprete bien la zona del backend. */
export function timeAgo(value?: string | null): string {
	const d = parseServerDate(value);
	return d ? d.fromNow() : "—";
}
