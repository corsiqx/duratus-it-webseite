import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Invoice, InvoiceStatus } from '../../data/models';
import { PortalStore } from '../../data/portal-store';
import { INVOICE_STATUS } from '../../data/status';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';
import { euroCents } from '../../shared/format';
import { StatusBadge } from '../../shared/status-badge';
import { ToastService } from '../../shared/toast.service';

type InvoiceFilter = 'alle' | InvoiceStatus;

@Component({
  selector: 'app-invoices',
  imports: [NgIcon, NgTemplateOutlet, RouterLink, StatusBadge, FilterTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  templateUrl: './invoices.html',
})
export class Invoices {
  protected readonly store = inject(PortalStore);
  private readonly toasts = inject(ToastService);

  /** Query parameter ?status=ueberfaellig */
  readonly status = input<string>();

  protected readonly statusLabel = INVOICE_STATUS;
  protected readonly euroCents = euroCents;

  protected readonly filter = signal<InvoiceFilter>('alle');
  protected readonly query = signal('');
  protected readonly busy = signal<string | null>(null);

  protected readonly totals = computed(() => {
    const sum = (status: InvoiceStatus) =>
      this.store.invoices().filter((invoice) => invoice.status === status).reduce((total, invoice) => total + invoice.amount, 0);
    return { offen: sum('offen'), ueberfaellig: sum('ueberfaellig'), bezahlt: sum('bezahlt') };
  });

  protected readonly filterOptions = computed<FilterOption<InvoiceFilter>[]>(() => {
    const invoices = this.store.invoices();
    const count = (status: InvoiceStatus) => invoices.filter((invoice) => invoice.status === status).length;
    return [
      { value: 'alle', label: 'Alle', count: invoices.length },
      { value: 'offen', label: 'Offen', count: count('offen') },
      { value: 'ueberfaellig', label: 'Überfällig', count: count('ueberfaellig') },
      { value: 'bezahlt', label: 'Bezahlt', count: count('bezahlt') },
    ];
  });

  protected readonly visibleInvoices = computed(() => {
    const filter = this.filter();
    const query = this.query().trim().toLowerCase();
    return this.store
      .invoices()
      .filter((invoice) => (filter === 'alle' || invoice.status === filter) && (!query || `${invoice.id} ${invoice.description}`.toLowerCase().includes(query)));
  });

  constructor() {
    effect(() => {
      const status = this.status();
      if (status && status in INVOICE_STATUS) untracked(() => this.filter.set(status as InvoiceStatus));
    });
  }

  protected async downloadPdf(invoice: Invoice): Promise<void> {
    this.busy.set(invoice.id);
    try {
      const { createInvoicePdf } = await import('./invoice-pdf');
      createInvoicePdf(invoice, this.store.billing());
      this.toasts.show(`${invoice.id} wurde heruntergeladen.`, 'phosphorDownloadSimple');
    } catch {
      this.toasts.show('Die PDF konnte nicht erstellt werden. Bitte erneut versuchen.', 'phosphorWarningCircle');
    } finally {
      this.busy.set(null);
    }
  }
}
