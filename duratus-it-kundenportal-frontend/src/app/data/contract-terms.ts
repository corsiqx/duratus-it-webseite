import { addDays, addMonths, parseDateDe, startOfDay } from '../shared/format';
import { Contract } from './models';

export interface CancellationDate {
  /** Last day the notice has to arrive. */
  deadline: Date;
  /** Day the contract ends if cancelled by the deadline. */
  endsAt: Date;
}

const endOfMonth = (year: number, month: number) => new Date(year, month + 1, 0);

/**
 * Next possible cancellation for a contract, seen from `today`.
 * Fixed terms renew automatically; open-ended contracts end at a month end after the notice period.
 */
export function nextCancellation(contract: Contract, today = new Date()): CancellationDate {
  const now = startOfDay(today);

  if (contract.termMonths === null) {
    return {
      deadline: endOfMonth(now.getFullYear(), now.getMonth()),
      endsAt: endOfMonth(now.getFullYear(), now.getMonth() + contract.noticeMonths),
    };
  }

  const renewal = contract.renewMonths ?? contract.termMonths;
  // First day after the current term.
  let nextStart = addMonths(parseDateDe(contract.start), contract.termMonths);
  let deadline = addDays(addMonths(nextStart, -contract.noticeMonths), -1);
  while (deadline < now && renewal > 0) {
    nextStart = addMonths(nextStart, renewal);
    deadline = addDays(addMonths(nextStart, -contract.noticeMonths), -1);
  }
  return { deadline, endsAt: addDays(nextStart, -1) };
}

const months = (count: number) => (count === 1 ? '1 Monat' : `${count} Monate`);

export function termLabel(contract: Contract): string {
  if (contract.termMonths === null) return 'Unbefristet, monatlich kündbar';
  const renewal = contract.renewMonths ? `, verlängert sich um ${months(contract.renewMonths)}` : '';
  return `${months(contract.termMonths)}${renewal}`;
}

export function noticeLabel(contract: Contract): string {
  return contract.termMonths === null
    ? `${months(contract.noticeMonths)} zum Monatsende`
    : `${months(contract.noticeMonths)} zum Laufzeitende`;
}
