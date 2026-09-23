import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { COMPANY } from '../../content/company';
import { DEMO_TICKET_VOLUME } from '../../data/mock-data';
import { PortalStore } from '../../data/portal-store';
import { HEALTH_STATE, TICKET_STATUS } from '../../data/status';
import { euro, euroCents } from '../../shared/format';
import { StatusBadge } from '../../shared/status-badge';

interface Kpi {
  label: string;
  value: string;
  detail: string;
  icon: string;
  path: string;
  attention: boolean;
}

interface ActionItem {
  id: string;
  icon: string;
  tone: 'warning' | 'critical';
  title: string;
  text: string;
  action: string;
  path: string[];
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgIcon, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
})
export class Dashboard {
  protected readonly store = inject(PortalStore);
  protected readonly company = COMPANY;
  protected readonly ticketStatus = TICKET_STATUS;
  protected readonly healthLabel = HEALTH_STATE;

  protected readonly greeting = (() => {
    const hour = new Date().getHours();
    return hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
  })();

  /** Everything the customer has to do, most urgent first. */
  protected readonly actions = computed<ActionItem[]>(() => [
    ...this.store.overdueInvoices().map(
      (invoice): ActionItem => ({
        id: invoice.id,
        icon: 'phosphorWarningCircle',
        tone: 'critical',
        title: `Rechnung ${invoice.id} ist überfällig`,
        text: `${euroCents(invoice.amount)} vom ${invoice.date}`,
        action: 'Ansehen',
        path: ['/rechnungen'],
        queryParams: { status: 'ueberfaellig' },
      }),
    ),
    ...this.store.ticketsAwaitingReply().map(
      (ticket): ActionItem => ({
        id: ticket.id,
        icon: 'phosphorChatCircleText',
        tone: 'warning',
        title: `Rückfrage zu ${ticket.id}`,
        text: ticket.subject,
        action: 'Antworten',
        path: ['/tickets', ticket.id],
      }),
    ),
    ...this.store.pendingOffers().map(
      (offer): ActionItem => ({
        id: offer.id,
        icon: 'phosphorSignature',
        tone: 'warning',
        title: `Angebot ${offer.id} wartet auf Unterschrift`,
        text: `${offer.title}, gültig bis ${offer.validUntil}`,
        action: 'Prüfen',
        path: ['/angebote', offer.id],
      }),
    ),
  ]);

  protected readonly kpis = computed<Kpi[]>(() => {
    const openTickets = this.store.openTickets().length;
    const nextInvoice = this.store.unpaidInvoices()[0];
    const patches = this.store.patchSummary();
    return [
      {
        label: 'Offene Tickets',
        value: String(openTickets),
        detail: this.store.ticketsAwaitingReply().length > 0 ? `${this.store.ticketsAwaitingReply().length} wartet auf Sie` : 'in Bearbeitung',
        icon: 'phosphorLifebuoy',
        path: '/tickets',
        attention: this.store.ticketsAwaitingReply().length > 0,
      },
      {
        label: 'Geräte aktuell',
        value: `${patches.percent} %`,
        detail: `${patches.current} von ${patches.total} Geräten`,
        icon: 'phosphorDesktop',
        path: '/meine-it',
        attention: patches.percent < 90,
      },
      {
        label: 'Offene Rechnungen',
        value: nextInvoice ? euro(this.store.unpaidInvoices().reduce((sum, invoice) => sum + invoice.amount, 0)) : '0 €',
        detail: `${this.store.unpaidInvoices().length} Rechnungen`,
        icon: 'phosphorReceipt',
        path: '/rechnungen',
        attention: this.store.overdueInvoices().length > 0,
      },
      {
        label: 'Aktive Verträge',
        value: String(this.store.activeContracts().length),
        detail: `${euro(this.store.monthlyVolume())} pro Monat`,
        icon: 'phosphorShieldCheck',
        path: '/vertraege',
        attention: false,
      },
    ];
  });

  // Ticket volume: single series, one hue; the y-scale is rounded up to an even step so gridlines stay whole numbers.
  protected readonly volume = DEMO_TICKET_VOLUME;
  protected readonly volumeTotal = DEMO_TICKET_VOLUME.reduce((sum, item) => sum + item.count, 0);
  protected readonly volumeMax = Math.ceil(Math.max(...DEMO_TICKET_VOLUME.map((item) => item.count)) / 2) * 2;
  protected readonly volumeTicks = [this.volumeMax, this.volumeMax / 2, 0];

  protected readonly recentTickets = computed(() => this.store.tickets().slice(0, 4));
}
