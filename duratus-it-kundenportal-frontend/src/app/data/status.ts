import {
  HealthState,
  InvoiceStatus,
  OfferStatus,
  PatchState,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from './models';

/** Semantic badge tones. Status colors are reserved for state and always come with a text label. */
export type Tone = 'good' | 'info' | 'warning' | 'critical' | 'neutral';

export interface StatusLabel {
  label: string;
  tone: Tone;
}

export const INVOICE_STATUS: Record<InvoiceStatus, StatusLabel> = {
  bezahlt: { label: 'Bezahlt', tone: 'good' },
  offen: { label: 'Offen', tone: 'info' },
  ueberfaellig: { label: 'Überfällig', tone: 'critical' },
};

export const OFFER_STATUS: Record<OfferStatus, StatusLabel> = {
  wartet: { label: 'Wartet auf Unterschrift', tone: 'warning' },
  angenommen: { label: 'Angenommen', tone: 'good' },
  abgelehnt: { label: 'Abgelehnt', tone: 'neutral' },
  abgelaufen: { label: 'Abgelaufen', tone: 'neutral' },
};

export const TICKET_STATUS: Record<TicketStatus, StatusLabel> = {
  offen: { label: 'Offen', tone: 'neutral' },
  in_bearbeitung: { label: 'In Bearbeitung', tone: 'info' },
  rueckfrage: { label: 'Wartet auf Ihre Antwort', tone: 'warning' },
  geloest: { label: 'Gelöst', tone: 'good' },
};

export const TICKET_PRIORITY: Record<TicketPriority, StatusLabel> = {
  hoch: { label: 'Hoch', tone: 'critical' },
  normal: { label: 'Normal', tone: 'warning' },
  niedrig: { label: 'Niedrig', tone: 'neutral' },
};

export const TICKET_CATEGORY: Record<TicketCategory, { label: string; icon: string }> = {
  email: { label: 'E-Mail und Kommunikation', icon: 'phosphorEnvelopeSimple' },
  netzwerk: { label: 'Netzwerk und VPN', icon: 'phosphorWifiHigh' },
  arbeitsplatz: { label: 'Arbeitsplatz und Geräte', icon: 'phosphorLaptop' },
  drucker: { label: 'Drucker', icon: 'phosphorPrinter' },
  zugang: { label: 'Zugänge und Konten', icon: 'phosphorKey' },
  sonstiges: { label: 'Sonstiges', icon: 'phosphorQuestion' },
};

export const PATCH_STATE: Record<PatchState, StatusLabel> = {
  aktuell: { label: 'Aktuell', tone: 'good' },
  neustart: { label: 'Neustart nötig', tone: 'info' },
  ausstehend: { label: 'Update ausstehend', tone: 'warning' },
};

export const HEALTH_STATE: Record<HealthState, StatusLabel> = {
  ok: { label: 'In Ordnung', tone: 'good' },
  hinweis: { label: 'Hinweis', tone: 'warning' },
  stoerung: { label: 'Störung', tone: 'critical' },
};
