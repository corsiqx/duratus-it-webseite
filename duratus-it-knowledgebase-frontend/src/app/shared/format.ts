const wholeEuro = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const centEuro = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const decimal = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

/** 1219 -> "1.219 €" */
export const euro = (value: number): string => `${wholeEuro.format(Math.round(value))} €`;

/** 1219 -> "1.219,00 €" */
export const euroCents = (value: number): string => `${centEuro.format(value)} €`;

/** 1.25 -> "1,25" */
export const decimalDe = (value: number): string => decimal.format(value);

const pad = (value: number) => String(value).padStart(2, '0');

/** Date as "17.09.2026". */
export const dateDe = (value: Date): string =>
  `${pad(value.getDate())}.${pad(value.getMonth() + 1)}.${value.getFullYear()}`;

/** Date and time as "17.09.2026, 14:05". */
export const dateTimeDe = (value: Date): string => `${dateDe(value)}, ${pad(value.getHours())}:${pad(value.getMinutes())}`;

/** Parses "17.09.2026" (optionally followed by a time) into a local date at midnight. */
export function parseDateDe(value: string): Date {
  const [day, month, year] = value.slice(0, 10).split('.').map(Number);
  return new Date(year, month - 1, day);
}

/** Adds calendar days. */
export function addDays(value: Date, days: number): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
}

/** Adds calendar months and clamps the day to the target month (31.01. + 1 -> 28./29.02.). */
export function addMonths(value: Date, months: number): Date {
  const target = new Date(value.getFullYear(), value.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(value.getDate(), lastDay));
  return target;
}

export const startOfDay = (value: Date): Date => new Date(value.getFullYear(), value.getMonth(), value.getDate());

/** "Julia Beispiel" -> "JB" */
export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter((part) => /^[A-Za-zÄÖÜäöü]/.test(part))
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
