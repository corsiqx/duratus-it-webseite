import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { WEBSITE } from '../../content/company';
import { DELIVERY_OPTIONS, PAYMENT_METHODS } from '../../content/shop';
import { Order } from '../../data/models';
import { ShopStore } from '../../data/shop-store';
import { statusLabel } from '../../data/status';
import { EmptyState } from '../../shared/empty-state';
import { dateTimeDe, euroCents } from '../../shared/format';
import { Crumb, PageHero } from '../../shared/page-hero';
import { StatusBadge } from '../../shared/status-badge';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, NgIcon, PageHero, EmptyState, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  /** Route parameter. */
  readonly orderId = input.required<string>();
  /** ?neu=1 right after submitting, shows the confirmation banner. */
  readonly neu = input<string>();

  private readonly store = inject(ShopStore);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly website = WEBSITE;
  protected readonly euroCents = euroCents;
  protected readonly pdfBusy = signal(false);

  protected readonly order = computed(() => this.store.orderById(this.orderId()));
  protected readonly isNew = computed(() => this.neu() === '1');
  protected readonly status = computed(() => {
    const order = this.order();
    return order ? statusLabel(order) : { label: '', tone: 'neutral' as const };
  });

  protected readonly crumbs = computed<readonly Crumb[]>(() => [
    { label: 'Bestellungen', path: '/bestellungen' },
    { label: this.orderId() },
  ]);

  protected readonly lead = computed(() => {
    const order = this.order();
    if (!order) return '';
    return order.kind === 'angebot'
      ? `Erstellt am ${dateTimeDe(new Date(order.createdAt))}, gültig bis ${order.validUntil}.`
      : `Bestellt am ${dateTimeDe(new Date(order.createdAt))}, komplette Lieferung voraussichtlich am ${order.expectedDelivery}.`;
  });

  protected readonly metaRows = computed(() => {
    const order = this.order();
    if (!order) return [];
    const rows = [
      { label: 'Nummer', value: order.id },
      { label: 'Erstellt', value: dateTimeDe(new Date(order.createdAt)) },
      { label: 'Versandart', value: DELIVERY_OPTIONS.find((option) => option.id === order.delivery)?.label ?? '' },
      { label: 'Zahlungsart', value: PAYMENT_METHODS.find((method) => method.id === order.payment)?.label ?? '' },
      { label: 'Positionen', value: String(order.lines.length) },
    ];
    if (order.reference) rows.push({ label: 'Ihre Referenz', value: order.reference });
    if (order.validUntil) rows.push({ label: 'Gültig bis', value: order.validUntil });
    return rows;
  });

  /** jsPDF is loaded on demand so it stays out of the initial bundle. */
  protected async downloadPdf(order: Order): Promise<void> {
    if (this.pdfBusy()) return;
    this.pdfBusy.set(true);
    try {
      const { createOrderPdf } = await import('./order-pdf');
      createOrderPdf(order);
      this.toasts.show('PDF erstellt.', 'phosphorFilePdf');
    } finally {
      this.pdfBusy.set(false);
    }
  }

  protected reorder(order: Order): void {
    const count = this.store.reorder(order.id);
    this.toasts.show(`${count} Positionen im Warenkorb.`, 'phosphorShoppingCartSimple');
    void this.router.navigate(['/warenkorb']);
  }
}
