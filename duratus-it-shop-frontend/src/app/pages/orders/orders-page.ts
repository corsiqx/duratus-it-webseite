import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Order } from '../../data/models';
import { ShopStore } from '../../data/shop-store';
import { statusLabel } from '../../data/status';
import { EmptyState } from '../../shared/empty-state';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';
import { dateTimeDe, euroCents } from '../../shared/format';
import { Crumb, PageHero } from '../../shared/page-hero';
import { StatusBadge } from '../../shared/status-badge';
import { ToastService } from '../../shared/toast.service';

type Filter = 'alle' | 'bestellung' | 'angebot';

@Component({
  selector: 'app-orders-page',
  imports: [RouterLink, NgIcon, PageHero, EmptyState, StatusBadge, FilterTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-page-hero
      [crumbs]="crumbs"
      title="Bestellungen und Angebote"
      lead="Alle Vorgänge aus diesem Browser. Eine echte Anmeldung würde sie kundenbezogen aus dem ERP holen."
    />

    <div class="bg-canvas-alt py-8 sm:py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        @if (store.orders().length === 0) {
          <app-empty-state
            icon="phosphorPackage"
            title="Noch kein Vorgang"
            hint="Sobald Sie bestellen oder ein Angebot anfordern, erscheint der Vorgang hier mit PDF und Liefertermin."
          >
            <a
              routerLink="/katalog"
              class="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Zum Katalog
              <ng-icon name="phosphorArrowRight" size="16" />
            </a>
          </app-empty-state>
        } @else {
          <app-filter-tabs label="Art des Vorgangs" [options]="filterOptions()" [(value)]="filter" />

          <ul class="mt-6 flex flex-col gap-3">
            @for (order of visible(); track order.id) {
              <li class="rounded-2xl bg-canvas p-4 ring-1 ring-line sm:p-5">
                <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h2 class="font-bold text-ink">
                        <a [routerLink]="['/bestellungen', order.id]" class="transition-colors hover:text-primary">{{ order.id }}</a>
                      </h2>
                      <app-status-badge [status]="statusOf(order)" />
                    </div>
                    <p class="mt-1 text-sm text-muted">
                      {{ dateTimeDe(order.createdAt) }} · {{ order.lines.length }}
                      {{ order.lines.length === 1 ? 'Position' : 'Positionen' }}
                      @if (order.reference) {
                        · Referenz {{ order.reference }}
                      }
                    </p>
                    <p class="mt-1 truncate text-sm text-slate-400">{{ lineSummary(order) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-ink tabular-nums">{{ euroCents(order.gross) }}</p>
                    <p class="text-xs text-muted">brutto</p>
                    @if (order.monthlyNet > 0) {
                      <p class="mt-0.5 text-xs font-semibold text-primary tabular-nums">
                        + {{ euroCents(order.monthlyNet) }} / Monat
                      </p>
                    }
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <a
                    [routerLink]="['/bestellungen', order.id]"
                    class="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-canvas-alt px-4 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
                  >
                    Details
                    <ng-icon name="phosphorArrowRight" size="14" />
                  </a>
                  <button
                    type="button"
                    class="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:bg-canvas-alt hover:text-ink"
                    (click)="downloadPdf(order)"
                  >
                    <ng-icon name="phosphorFilePdf" size="16" />
                    PDF
                  </button>
                  <button
                    type="button"
                    class="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:bg-canvas-alt hover:text-ink"
                    (click)="reorder(order)"
                  >
                    <ng-icon name="phosphorArrowsClockwise" size="16" />
                    Erneut bestellen
                  </button>
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class OrdersPage {
  protected readonly store = inject(ShopStore);
  private readonly toasts = inject(ToastService);

  protected readonly crumbs: readonly Crumb[] = [{ label: 'Bestellungen' }];
  protected readonly euroCents = euroCents;
  protected readonly filter = signal<Filter>('alle');

  protected readonly filterOptions = computed<readonly FilterOption<Filter>[]>(() => [
    { value: 'alle', label: 'Alle', count: this.store.orders().length },
    { value: 'bestellung', label: 'Bestellungen', count: this.store.orders().filter((o) => o.kind === 'bestellung').length },
    { value: 'angebot', label: 'Angebote', count: this.store.orders().filter((o) => o.kind === 'angebot').length },
  ]);

  protected readonly visible = computed(() =>
    this.filter() === 'alle' ? this.store.orders() : this.store.orders().filter((order) => order.kind === this.filter()),
  );

  protected statusOf(order: Order) {
    return statusLabel(order);
  }

  protected dateTimeDe(iso: string): string {
    return dateTimeDe(new Date(iso));
  }

  protected lineSummary(order: Order): string {
    return order.lines.map((line) => `${line.quantity} × ${line.name}`).join(', ');
  }

  protected async downloadPdf(order: Order): Promise<void> {
    const { createOrderPdf } = await import('./order-pdf');
    createOrderPdf(order);
    this.toasts.show('PDF erstellt.', 'phosphorFilePdf');
  }

  protected reorder(order: Order): void {
    const count = this.store.reorder(order.id);
    this.toasts.show(`${count} Positionen im Warenkorb.`, 'phosphorShoppingCartSimple');
  }
}
