import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/es";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

// Set locale to Spanish
dayjs.locale("es");

// Set default timezone to Nicaragua
const NICARAGUA_TZ = "America/Managua";
dayjs.tz.setDefault(NICARAGUA_TZ);

/**
 * Parses a date and returns a dayjs object in Nicaragua timezone.
 * @param date - Date to parse (ISO string, Date object, etc.)
 * @returns dayjs object in America/Managua timezone
 */
export const nicaDate = (date?: dayjs.ConfigType) => {
	return dayjs(date).tz(NICARAGUA_TZ);
};

/**
 * Returns the current date/time in Nicaragua.
 */
export const nowInNica = () => {
	return dayjs().tz(NICARAGUA_TZ);
};

/**
 * Formats a date in Nicaragua timezone.
 * @param date - Date to format
 * @param formatStr - Format string (default: DD/MM/YYYY hh:mm A)
 */
export const formatNicaDate = (
	date: dayjs.ConfigType,
	formatStr: string = "DD/MM/YYYY hh:mm A",
) => {
	if (!date) return "N/A";
	return dayjs(date).tz(NICARAGUA_TZ).format(formatStr);
};

export default dayjs;
