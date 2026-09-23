import { dateDe } from '../shared/format';
import { nextCancellation, noticeLabel, termLabel } from './contract-terms';
import { DEMO_CONTRACTS } from './mock-data';

const managedIt = DEMO_CONTRACTS[0];
const retainer = DEMO_CONTRACTS[2];

describe('nextCancellation', () => {
  it('rolls a fixed term forward to the next renewal whose deadline is still ahead', () => {
    const result = nextCancellation(managedIt, new Date(2026, 8, 17));
    expect(dateDe(result.deadline)).toBe('31.05.2027');
    expect(dateDe(result.endsAt)).toBe('31.08.2027');
  });

  it('keeps the current term while its deadline has not passed, including the deadline day itself', () => {
    expect(dateDe(nextCancellation(managedIt, new Date(2026, 1, 1)).deadline)).toBe('31.05.2026');
    expect(dateDe(nextCancellation(managedIt, new Date(2026, 4, 31)).endsAt)).toBe('31.08.2026');
  });

  it('ends open-ended contracts at the month end after the notice period', () => {
    const result = nextCancellation(retainer, new Date(2026, 8, 17));
    expect(dateDe(result.deadline)).toBe('30.09.2026');
    expect(dateDe(result.endsAt)).toBe('31.10.2026');
  });

  it('describes term and notice in words', () => {
    expect(termLabel(managedIt)).toBe('12 Monate, verlängert sich um 12 Monate');
    expect(noticeLabel(managedIt)).toBe('3 Monate zum Laufzeitende');
    expect(termLabel(retainer)).toBe('Unbefristet, monatlich kündbar');
    expect(noticeLabel(retainer)).toBe('1 Monat zum Monatsende');
  });
});
