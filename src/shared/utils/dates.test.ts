import dayjs from "dayjs";
import { expect, it } from "vitest";
import { elapsedMinutes, formatElapsed } from "./dates";

it("formatElapsed", () => {
	expect(formatElapsed(45)).toBe("45 min");
	expect(formatElapsed(130)).toBe("2 h 10 min");
	expect(formatElapsed(1500)).toBe("1 d 1 h");
});

it("elapsedMinutes nunca es negativo", () => {
	const now = dayjs.utc("2026-11-08T10:00:00");
	expect(elapsedMinutes("2026-11-08T11:00:00Z", now)).toBe(0);
	expect(elapsedMinutes(null, now)).toBe(0);
	expect(elapsedMinutes("2026-11-08T08:30:00Z", now)).toBe(90);
});
