/**
 * Converts a Unix epoch time (in milliseconds) to a locale date string.
 * @param epochMs - Unix epoch time in milliseconds
 * @param locale - Optional locale string for formatting (default: 'en-US')
 */
export function epochToDateString(epochMs: number, locale: string = 'en-US'): string {
  const date = new Date(Number(epochMs));
  return date.toLocaleString(locale);
}