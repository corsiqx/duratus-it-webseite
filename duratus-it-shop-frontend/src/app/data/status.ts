import { Order, OrderStatus } from './models';
import { parseDateDe, startOfDay } from '../shared/format';

export type Tone = 'good' | 'info' | 'warning' | 'critical' | 'neutral';

export interface StatusLabel {
  label: string;
  tone: Tone;
}

export const ORDER_STATUS: Record<OrderStatus, StatusLabel> = {
  bestaetigt: { label: 'Bestätigt', tone: 'info' },
  'in-lieferung': { label: 'In Lieferung', tone: 'info' },
  geliefert: { label: 'Geliefert', tone: 'good' },
  offen: { label: 'Angebot offen', tone: 'warning' },
  abgelaufen: { label: 'Angebot abgelaufen', tone: 'neutral' },
};

/** A quote past its validity date counts as expired, no matter what is stored. */
export function effectiveStatus(order: Order, today = new Date()): OrderStatus {
  if (order.kind === 'angebot' && order.status === 'offen' && order.validUntil) {
    return parseDateDe(order.validUntil) < startOfDay(today) ? 'abgelaufen' : 'offen';
  }
  return order.status;
}

export const statusLabel = (order: Order, today = new Date()): StatusLabel => ORDER_STATUS[effectiveStatus(order, today)];
