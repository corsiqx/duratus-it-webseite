import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { COMPANY } from '../../content/company';
import { PortalStore } from '../../data/portal-store';
import { TICKET_CATEGORY, TICKET_PRIORITY, TICKET_STATUS } from '../../data/status';
import { decimalDe, initials } from '../../shared/format';
import { StatusBadge } from '../../shared/status-badge';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-ticket-detail',
  imports: [NgIcon, RouterLink, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  templateUrl: './ticket-detail.html',
})
export class TicketDetail {
  protected readonly store = inject(PortalStore);
  private readonly toasts = inject(ToastService);

  /** Route parameter :ticketId */
  readonly ticketId = input.required<string>();

  protected readonly company = COMPANY;
  protected readonly statusLabel = TICKET_STATUS;
  protected readonly priorityLabel = TICKET_PRIORITY;
  protected readonly categoryLabel = TICKET_CATEGORY;
  protected readonly initials = initials;
  protected readonly decimalDe = decimalDe;

  protected readonly ticket = computed(() => this.store.tickets().find((ticket) => ticket.id === this.ticketId()));
  protected readonly workLogs = computed(() => this.store.workLogs().filter((log) => log.ticketId === this.ticketId()));
  protected readonly hours = computed(() => this.workLogs().reduce((sum, log) => sum + (log.hours ?? 0), 0));

  protected readonly reply = signal('');
  protected readonly replyError = signal(false);

  protected send(): void {
    const ticket = this.ticket();
    if (!ticket) return;
    if (!this.reply().trim()) {
      this.replyError.set(true);
      return;
    }
    this.store.replyToTicket(ticket.id, this.reply());
    this.reply.set('');
    this.replyError.set(false);
    this.toasts.show('Ihre Antwort wurde gesendet.', 'phosphorPaperPlaneRight');
  }

  protected close(): void {
    const ticket = this.ticket();
    if (!ticket) return;
    this.store.closeTicket(ticket.id);
    this.toasts.show(`${ticket.id} ist als gelöst markiert.`);
  }

  protected reopen(): void {
    const ticket = this.ticket();
    if (!ticket) return;
    this.store.reopenTicket(ticket.id);
    this.toasts.show(`${ticket.id} wurde erneut geöffnet.`, 'phosphorArrowCounterClockwise');
  }
}
