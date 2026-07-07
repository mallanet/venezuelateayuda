const VE_LOCALE = "es-VE";
const VE_TIMEZONE = "America/Caracas";

export function formatVeDate(value: string | Date, style: "medium" | "long" = "medium") {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(VE_LOCALE, { dateStyle: style, timeZone: VE_TIMEZONE });
}

export function formatVeTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString(VE_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: VE_TIMEZONE,
  });
}
