import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Ticket, TicketCategory } from '../../data/models';
import { PortalStore } from '../../data/portal-store';
import { TICKET_CATEGORY, TICKET_PRIORITY, TICKET_STATUS } from '../../data/status';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';
import { StatusBadge } from '../../shared/status-badge';
import { ToastService } from '../../shared/toast.service';
import { NewTicketDialog, TicketPrefill } from './new-ticket-dialog';

type TicketFilter = 'alle' | 'offen' | 'rueckfrage' | 'geloest';

@Component({
  selector: 'app-tickets',
  imports: [NgIcon, RouterLink, FilterTabs, NewTicketDialog, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  templateUrl: './tickets.html',
})
export class Tickets {
  protected readonly store = inject(PortalStore);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  /** Query parameters: ?neu=1&betreff=…&kategorie=… opens the dialog prefilled, ?status=rueckfrage sets the filter. */
  readonly neu = input<string>();
  readonly betreff = input<string>();
  readonly kategorie = input<string>();
  readonly status = input<string>();

  protected readonly statusLabel = TICKET_STATUS;
  protected readonly priorityLabel = TICKET_PRIORITY;
  protected readonly categoryLabel = TICKET_CATEGORY;

  protected readonly filter = signal<TicketFilter>('alle');
  protected readonly query = signal('');
  protected readonly dialogOpen = signal(false);
  protected readonly prefill = signal<TicketPrefill | null>(null);

  protected readonly filterOptions = computed<FilterOption<TicketFilter>[]>(() => {
    const tickets = this.store.tickets();
    return [
      { value: 'alle', label: 'Alle', count: tickets.length },
      { value: 'offen', label: 'Offen', count: tickets.filter((ticket) => ticket.status !== 'geloest').length },
      { value: 'rueckfrage', label: 'Wartet auf Sie', count: tickets.filter((ticket) => ticket.status === 'rueckfrage').length },
      { value: 'geloest', label: 'Gelöst', count: tickets.filter((ticket) => ticket.status === 'geloest').length },
    ];
  });

  protected readonly visibleTickets = computed(() => {
    const filter = this.filter();
    const query = this.query().trim().toLowerCase();
    return this.store.tickets().filter((ticket) => {
      const matchesFilter =
        filter === 'alle' ||
        (filter === 'offen' && ticket.status !== 'geloest') ||
        (filter !== 'offen' && ticket.status === filter);
      return matchesFilter && (!query || `${ticket.id} ${ticket.subject}`.toLowerCase().includes(query));
    });
  });

  constructor() {
    effect(() => {
      const status = this.status();
      if (status === 'offen' || status === 'rueckfrage' || status === 'geloest') untracked(() => this.filter.set(status));
    });

    effect(() => {
      if (this.neu() !== '1') return;
      const category = this.kategorie();
      untracked(() => {
        this.openDialog({
          subject: this.betreff() ?? '',
          category: category && category in TICKET_CATEGORY ? (category as TicketCategory) : undefined,
        });
        // Drop the one-off parameters so a reload does not open the dialog again.
        void this.router.navigate([], { queryParams: { neu: null, betreff: null, kategorie: null }, queryParamsHandling: 'merge', replaceUrl: true });
      });
    });
  }

  protected openDialog(prefill: TicketPrefill | null = null): void {
    this.prefill.set(prefill);
    this.dialogOpen.set(true);
  }

  protected onCreated(ticket: Ticket): void {
    this.dialogOpen.set(false);
    this.toasts.show(`Ticket ${ticket.id} wurde erstellt.`);
    void this.router.navigate(['/tickets', ticket.id]);
  }

  protected lastActivity(ticket: Ticket): string {
    const last = [...ticket.messages].reverse().find((message) => message.author !== 'system');
    if (!last) return '';
    return last.author === 'kunde' ? 'Ihre letzte Nachricht' : `Antwort von ${last.name}`;
  }
}
