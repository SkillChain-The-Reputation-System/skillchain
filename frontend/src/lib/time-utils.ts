/**
 * Converts a Unix epoch time (in milliseconds) to a locale date string.
 * @param epochMs - Unix epoch time in milliseconds
 * @param locale - Optional locale string for formatting (default: 'en-US')
 */
export function epochToDateString(
  epochMs: number,
  locale: string = "en-US"
): string {
  const date = new Date(Number(epochMs));
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleString(locale, options);
}

export function epochToDateTimeString(
  epochMs: number,
  locale: string = "en-US"
): string {
  const date = new Date(Number(epochMs));
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleString(locale, options);
}