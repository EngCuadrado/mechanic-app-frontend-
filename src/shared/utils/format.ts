const money = new Intl.NumberFormat("es-NI", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function formatMoney(value?: number | null, currency?: string): string {
	if (value === null || value === undefined) return "—";
	return currency ? `${currency} ${money.format(value)}` : money.format(value);
}

/** Convierte el texto de un input numérico a número; vacío o inválido → null. */
export function toNumber(text: string): number | null {
	if (text.trim() === "") return null;
	const n = Number(text);
	return Number.isFinite(n) ? n : null;
}
