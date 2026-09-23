import { Injectable, computed, effect, signal } from '@angular/core';
import { dateDe, dateTimeDe, parseDateDe, startOfDay } from '../shared/format';
import { readJson, removeKey, writeJson } from './browser-storage';
import {
  DEMO_ACCOUNT,
  DEMO_BILLING,
  DEMO_CONTRACTS,
  DEMO_CUSTOMER,
  DEMO_DEVICES,
  DEMO_INVOICES,
  DEMO_NOTIFICATIONS,
  DEMO_PREFS,
  DEMO_READ_NOTIFICATIONS,
  DEMO_TICKETS,
  DEMO_WORK_LOGS,
  demoOffers,
} from './mock-data';
import {
  Account,
  BillingInfo,
  NewTicket,
  NotificationPrefs,
  Offer,
  ServiceHealth,
  Ticket,
  TicketMessage,
  TicketStatus,
} from './models';
import { TICKET_PRIORITY } from './status';

export const STORAGE_KEY = 'duratus-kundenportal-demo-v1';

interface PersistedState {
  offers: Offer[];
  tickets: Ticket[];
  billing: BillingInfo;
  account: Account;
  prefs: NotificationPrefs;
  readNotifications: string[];
}

const ticketNumber = (id: string) => Number(id.replace(/\D/g, ''));

function initialState(): PersistedState {
  return {
    offers: demoOffers(),
    tickets: [...DEMO_TICKETS],
    billing: { ...DEMO_BILLING },
    account: { ...DEMO_ACCOUNT },
    prefs: { ...DEMO_PREFS },
    readNotifications: [...DEMO_READ_NOTIFICATIONS],
  };
}

/**
 * Client-side state of the customer portal. Demo data lives in signals and is mirrored to localStorage,
 * so actions survive a reload. This is the single place to connect a backend later.
 */
@Injectable({ providedIn: 'root' })
export class PortalStore {
  readonly customer = signal(DEMO_CUSTOMER).asReadonly();
  readonly invoices = signal(DEMO_INVOICES).asReadonly();
  readonly contracts = signal(DEMO_CONTRACTS).asReadonly();
  readonly workLogs = signal(DEMO_WORK_LOGS).asReadonly();
  readonly devices = signal(DEMO_DEVICES).asReadonly();

  private readonly state = signal<PersistedState>({ ...initialState(), ...readJson<PersistedState>('local', STORAGE_KEY) });

  readonly billing = computed(() => this.state().billing);
  readonly account = computed(() => this.state().account);
  readonly prefs = computed(() => this.state().prefs);

  /** Offers with expiry applied: a waiting offer past its validity date counts as expired. */
  readonly offers = computed(() => {
    const today = startOfDay(new Date());
    return this.state().offers.map((offer): Offer =>
      offer.status === 'wartet' && parseDateDe(offer.validUntil) < today ? { ...offer, status: 'abgelaufen' } : offer,
    );
  });

  /** Newest ticket first. */
  readonly tickets = computed(() => [...this.state().tickets].sort((a, b) => ticketNumber(b.id) - ticketNumber(a.id)));

  readonly activeContracts = computed(() => this.contracts().filter((contract) => contract.active));
  readonly monthlyVolume = computed(() => this.activeContracts().reduce((sum, contract) => sum + contract.amount, 0));
  readonly openTickets = computed(() => this.tickets().filter((ticket) => ticket.status !== 'geloest'));
  readonly ticketsAwaitingReply = computed(() => this.tickets().filter((ticket) => ticket.status === 'rueckfrage'));
  readonly unpaidInvoices = computed(() => this.invoices().filter((invoice) => invoice.status !== 'bezahlt'));
  readonly overdueInvoices = computed(() => this.invoices().filter((invoice) => invoice.status === 'ueberfaellig'));
  readonly pendingOffers = computed(() => this.offers().filter((offer) => offer.status === 'wartet'));

  readonly notifications = computed(() => {
    const read = new Set(this.state().readNotifications);
    return DEMO_NOTIFICATIONS.map((notification) => ({ ...notification, read: read.has(notification.id) }));
  });
  readonly unreadCount = computed(() => this.notifications().filter((notification) => !notification.read).length);

  readonly patchSummary = computed(() => {
    const devices = this.devices();
    const current = devices.filter((device) => device.patch === 'aktuell').length;
    return { total: devices.length, current, percent: Math.round((current / devices.length) * 100) };
  });

  readonly serviceHealth = computed<ServiceHealth[]>(() => {
    const patches = this.patchSummary();
    const offline = this.devices().filter((device) => !device.online).length;
    const behind = patches.total - patches.current;
    return [
      {
        id: 'firewall',
        label: 'Firewall',
        icon: 'phosphorShieldCheck',
        state: 'ok',
        summary: 'Online, Firmware aktuell',
        detail: 'Regelwerk zuletzt geprüft am 01.09.2026',
      },
      {
        id: 'backup',
        label: 'Backup',
        icon: 'phosphorCloudCheck',
        state: 'ok',
        summary: 'Letzte Sicherung erfolgreich',
        detail: 'Restore-Test am 01.09.2026 bestanden',
      },
      {
        id: 'patches',
        label: 'Updates',
        icon: 'phosphorArrowsClockwise',
        state: behind > 0 ? 'hinweis' : 'ok',
        summary: `${patches.current} von ${patches.total} Geräten aktuell`,
        detail: behind > 0 ? `${behind} Geräte warten auf Neustart oder Update` : 'Alle Geräte auf dem neuesten Stand',
      },
      {
        id: 'monitoring',
        label: 'Monitoring',
        icon: 'phosphorPulse',
        state: 'ok',
        summary: `${patches.total} Geräte überwacht`,
        detail: offline > 0 ? `${offline} Geräte derzeit ausgeschaltet oder offline` : 'Alle Geräte online',
      },
    ];
  });

  constructor() {
    effect(() => writeJson('local', STORAGE_KEY, this.state()));
  }

  // ------------------------------------------------------------------ offers

  signOffer(offerId: string, signature: string): void {
    if (this.offers().find((offer) => offer.id === offerId)?.status !== 'wartet') return;
    const signedAt = dateDe(new Date());
    const signedBy = this.account().name;
    this.updateOffer(offerId, { status: 'angenommen', signedAt, signedBy, signature });
  }

  declineOffer(offerId: string, reason: string): void {
    if (this.offers().find((offer) => offer.id === offerId)?.status !== 'wartet') return;
    this.updateOffer(offerId, { status: 'abgelehnt', declinedAt: dateDe(new Date()), declineReason: reason.trim() || null });
  }

  // ----------------------------------------------------------------- tickets

  /** Creates an open ticket with the next free number and returns it. */
  createTicket(input: NewTicket): Ticket {
    const next = Math.max(...this.state().tickets.map((ticket) => ticketNumber(ticket.id))) + 1;
    const now = new Date();
    const ticket: Ticket = {
      id: `TCK-${next}`,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: 'offen',
      created: dateDe(now),
      updated: dateDe(now),
      messages: [
        this.message('kunde', input.description, now),
        this.message('system', `Ticket erstellt, Priorität ${TICKET_PRIORITY[input.priority].label}.`, now),
      ],
    };
    this.state.update((state) => ({ ...state, tickets: [ticket, ...state.tickets] }));
    return ticket;
  }

  /** Adds a customer reply. A ticket waiting for the customer goes back to the service team. */
  replyToTicket(ticketId: string, text: string): void {
    const ticket = this.state().tickets.find((item) => item.id === ticketId);
    if (!ticket || ticket.status === 'geloest' || !text.trim()) return;
    const now = new Date();
    const messages = [...ticket.messages, this.message('kunde', text.trim(), now)];
    let status: TicketStatus = ticket.status;
    if (status === 'rueckfrage') {
      status = 'in_bearbeitung';
      messages.push(this.message('system', 'Status geändert: In Bearbeitung.', now));
    }
    this.updateTicket(ticketId, { messages, status, updated: dateDe(now) });
  }

  closeTicket(ticketId: string): void {
    this.changeTicketStatus(ticketId, 'geloest', 'Ticket von Ihnen als gelöst markiert.');
  }

  reopenTicket(ticketId: string): void {
    this.changeTicketStatus(ticketId, 'offen', 'Ticket von Ihnen erneut geöffnet.');
  }

  // ---------------------------------------------------------------- settings

  updateBilling(billing: BillingInfo): void {
    this.state.update((state) => ({ ...state, billing: { ...billing } }));
  }

  updateAccount(account: Account): void {
    this.state.update((state) => ({ ...state, account: { ...account } }));
  }

  updatePrefs(prefs: NotificationPrefs): void {
    this.state.update((state) => ({ ...state, prefs: { ...prefs } }));
  }

  markNotificationRead(id: string): void {
    if (this.state().readNotifications.includes(id)) return;
    this.state.update((state) => ({ ...state, readNotifications: [...state.readNotifications, id] }));
  }

  markAllNotificationsRead(): void {
    this.state.update((state) => ({ ...state, readNotifications: DEMO_NOTIFICATIONS.map((item) => item.id) }));
  }

  /** Restores the original demo data and forgets everything stored in the browser. */
  reset(): void {
    removeKey('local', STORAGE_KEY);
    this.state.set(initialState());
  }

  // ----------------------------------------------------------------- helpers

  private message(author: TicketMessage['author'], text: string, at: Date): TicketMessage {
    return { author, name: author === 'kunde' ? this.account().name : 'System', at: dateTimeDe(at), text };
  }

  private changeTicketStatus(ticketId: string, status: TicketStatus, note: string): void {
    const ticket = this.state().tickets.find((item) => item.id === ticketId);
    if (!ticket || ticket.status === status) return;
    const now = new Date();
    this.updateTicket(ticketId, { status, updated: dateDe(now), messages: [...ticket.messages, this.message('system', note, now)] });
  }

  private updateTicket(ticketId: string, changes: Partial<Ticket>): void {
    this.state.update((state) => ({
      ...state,
      tickets: state.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...changes } : ticket)),
    }));
  }

  private updateOffer(offerId: string, changes: Partial<Offer>): void {
    this.state.update((state) => ({
      ...state,
      offers: state.offers.map((offer) => (offer.id === offerId ? { ...offer, ...changes } : offer)),
    }));
  }
}
