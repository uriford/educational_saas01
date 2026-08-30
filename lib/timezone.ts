/**
 * Authoritative timezone for organization schedules.
 *
 * Administrators enter class/session times as Bangladesh local time.
 * Database timestamps are stored as UTC instants.
 */

export const ORGANIZATION_TIMEZONE = "Asia/Dhaka";

/**
 * Format a UTC/database instant in the organization's timezone.
 */
export function formatOrganizationDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ORGANIZATION_TIMEZONE,
    ...options,
  }).format(new Date(value));
}

/**
 * Convert an organization-local datetime-local value such as:
 *
 * 2026-08-30T13:00
 *
 * into a UTC ISO instant.
 *
 * Bangladesh is UTC+06:00 and does not observe DST.
 */
export function organizationLocalDateTimeToISOString(
  value: string,
) {
  if (!value) {
    return "";
  }

  return new Date(`${value}:00+06:00`).toISOString();
}

/**
 * Get the current calendar date in the organization's timezone.
 *
 * This is intentionally a date-only calendar container.
 * It must NOT be treated as a database timestamp.
 */
export function getOrganizationToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ORGANIZATION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    12,
    0,
    0,
    0,
  );
}

/**
 * Get a YYYY-MM-DD calendar key in the organization's timezone.
 */
export function getOrganizationDateKey(
  value: Date | string,
) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ORGANIZATION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Get the weekday of a UTC/database instant according to
 * the organization's timezone.
 *
 * Sunday = 0 ... Saturday = 6
 */
export function getOrganizationWeekday(
  value: Date | string,
) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: ORGANIZATION_TIMEZONE,
    weekday: "short",
  }).format(new Date(value));

  return [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ].indexOf(weekday);
}
