import { DEMO_SECRETS } from './demo/secrets';
import { Secret } from './models';
import { daysUntilRotation, maskOf, rotationDue, strengthOf, suggestPassword } from './secret-rules';

const secret = (overrides: Partial<Secret>): Secret => ({ ...DEMO_SECRETS[0], ...overrides });

describe('daysUntilRotation', () => {
  it('counts the days left until the interval is over', () => {
    const entry = secret({ rotatedAt: '01.09.2026', rotateEveryDays: 30 });
    expect(daysUntilRotation(entry, new Date(2026, 8, 17))).toBe(14);
  });

  it('returns a negative number once the date has passed', () => {
    const entry = secret({ rotatedAt: '01.01.2026', rotateEveryDays: 90 });
    expect(daysUntilRotation(entry, new Date(2026, 8, 17))).toBeLessThan(0);
  });

  it('names the due date in German format', () => {
    expect(rotationDue(secret({ rotatedAt: '01.09.2026', rotateEveryDays: 30 }))).toBe('1.10.2026');
  });
});

describe('strengthOf', () => {
  it('rates a short password as weak', () => {
    expect(strengthOf('Holzbau2021').tone).toBe('critical');
  });

  it('rates a long password with mixed characters as strong', () => {
    expect(strengthOf('Kiefer7-Halde-Rand!24').label).toBe('Stark');
  });

  it('rates a mixed but short password as merely sufficient', () => {
    expect(strengthOf('Anker-Mole-99!').score).toBe(2);
  });
});

describe('maskOf', () => {
  it('hides every character and does not give the length away', () => {
    expect(maskOf('kurz')).toBe('••••');
    expect(maskOf('ein-sehr-langes-passwort-mit-vielen-zeichen')).toHaveLength(16);
  });
});

describe('suggestPassword', () => {
  it('suggests a password that passes its own strength check', () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      expect(strengthOf(suggestPassword()).score).toBe(3);
    }
  });
});
