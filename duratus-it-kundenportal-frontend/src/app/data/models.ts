export interface Customer {
  name: string;
  initials: string;
}

export interface Account {
  name: string;
  email: string;
  phone: string;
  position: string;
}

export interface NotificationPrefs {
  invoices: boolean;
  tickets: boolean;
  offers: boolean;
  maintenance: boolean;
}

export type InvoiceStatus = 'bezahlt' | 'offen' | 'ueberfaellig';

export interface Invoice {
  id: string;
  date: string;
  description: string;
  /** Gross amount in EUR. */
  amount: number;
  status: InvoiceStatus;
}

export type OfferStatus = 'wartet' | 'angenommen' | 'abgelehnt' | 'abgelaufen';

export interface OfferPosition {
  name: string;
  detail: string;
  /** Monthly net amount in EUR. */
  amount: number;
}

export interface Offer {
  id: string;
  title: string;
  summary: string;
  /** Monthly net total in EUR, equals the sum of the positions. */
  amount: number;
  period: string;
  /** One-time setup fee in EUR (net), 0 if none. */
  oneTime: number;
  termNote: string;
  created: string;
  validUntil: string;
  status: OfferStatus;
  positions: readonly OfferPosition[];
  signedAt: string | null;
  signedBy: string | null;
  /** PNG data URL of the drawn signature. */
  signature: string | null;
  declinedAt: string | null;
  declineReason: string | null;
}

export interface Contract {
  id: string;
  name: string;
  /** Service area for the cost split. */
  area: string;
  start: string;
  /** Minimum term in months, null for open-ended contracts. */
  termMonths: number | null;
  /** Automatic renewal period in months. */
  renewMonths: number | null;
  noticeMonths: number;
  amount: number;
  active: boolean;
  included: readonly string[];
}

export type TicketPriority = 'hoch' | 'normal' | 'niedrig';
export type TicketStatus = 'offen' | 'in_bearbeitung' | 'rueckfrage' | 'geloest';
export type TicketCategory = 'email' | 'netzwerk' | 'arbeitsplatz' | 'drucker' | 'zugang' | 'sonstiges';

export interface TicketMessage {
  author: 'kunde' | 'technik' | 'system';
  name: string;
  /** "18.08.2026, 09:05" */
  at: string;
  text: string;
}

export interface Ticket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created: string;
  updated: string;
  messages: readonly TicketMessage[];
}

export interface NewTicket {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}

export interface WorkLog {
  date: string;
  technician: string;
  description: string;
  /** Null for automated work. */
  hours: number | null;
  ticketId: string | null;
}

export type PaymentMethod = 'sepa' | 'ueberweisung';

export interface BillingInfo {
  company: string;
  street: string;
  zipCity: string;
  email: string;
  paymentMethod: PaymentMethod;
  iban: string;
}

export type DeviceType = 'Notebook' | 'Desktop';
export type PatchState = 'aktuell' | 'neustart' | 'ausstehend';

export interface Device {
  name: string;
  type: DeviceType;
  department: string;
  os: string;
  patch: PatchState;
  online: boolean;
  lastSeen: string;
}

export type HealthState = 'ok' | 'hinweis' | 'stoerung';

export interface ServiceHealth {
  id: string;
  label: string;
  icon: string;
  state: HealthState;
  summary: string;
  detail: string;
}

export interface PortalNotification {
  id: string;
  title: string;
  text: string;
  date: string;
  icon: string;
  link: string;
  queryParams?: Record<string, string>;
}
