import { addDays, parseDateDe, startOfDay } from '../shared/format';
import { Secret } from './models';
import { StatusLabel } from './status';

/** How many days are left until the entry has to be rotated (negative = overdue). */
export function daysUntilRotation(secret: Secret, today = new Date()): number {
  const due = addDays(parseDateDe(secret.rotatedAt), secret.rotateEveryDays);
  return Math.round((due.getTime() - startOfDay(today).getTime()) / 86_400_000);
}

export function rotationDue(secret: Secret, today = new Date()): string {
  return addDays(parseDateDe(secret.rotatedAt), secret.rotateEveryDays).toLocaleDateString('de-DE');
}

export interface Strength {
  score: 0 | 1 | 2 | 3;
  label: string;
  tone: StatusLabel['tone'];
  /** Concrete reason, shown so the reader knows what to change. */
  reason: string;
}

/**
 * Rough strength estimate for the demo: length first, then the mix of character classes.
 * A real vault would use a proper estimator (zxcvbn or similar) plus a check against leaked-password lists.
 */
export function strengthOf(password: string): Strength {
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;
  const length = password.length;

  if (length < 12 || classes <= 2) {
    return {
      score: 1,
      label: 'Schwach',
      tone: 'critical',
      reason: length < 12 ? 'Kürzer als 12 Zeichen.' : 'Zu wenig verschiedene Zeichenarten.',
    };
  }
  if (length < 16 || classes === 3) {
    return { score: 2, label: 'Ausreichend', tone: 'warning', reason: 'Länger als 16 Zeichen wäre besser.' };
  }
  return { score: 3, label: 'Stark', tone: 'good', reason: 'Lang und gemischt.' };
}

/** Replaces every character with a dot, capped so the length is not given away. */
export function maskOf(password: string): string {
  return '•'.repeat(Math.min(password.length, 16));
}

const WORDS = [
  'Anker',
  'Birke',
  'Deich',
  'Feder',
  'Giebel',
  'Halde',
  'Kiefer',
  'Lanze',
  'Mole',
  'Nebel',
  'Quelle',
  'Ranke',
  'Speicher',
  'Traube',
  'Werft',
  'Zeder',
];
const SIGNS = '!#$%&*+-?';

/**
 * Suggestion for a new password: three words, a number and a sign. Long enough to be strong and
 * still readable over the phone, which matters when a technician dictates it on site.
 */
export function suggestPassword(): string {
  const random = (max: number) => Math.floor(Math.random() * max);
  const words = new Set<string>();
  while (words.size < 3) words.add(WORDS[random(WORDS.length)]);
  return `${[...words].join('-')}-${10 + random(90)}${SIGNS[random(SIGNS.length)]}`;
}
