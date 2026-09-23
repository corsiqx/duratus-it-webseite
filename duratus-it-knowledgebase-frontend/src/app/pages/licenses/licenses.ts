import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore, daysUntil } from '../../data/kb-store';
import { LICENSE_KIND, dueLabel } from '../../data/status';
import { CustomerFilter } from '../../shared/customer-filter';
import { EmptyState } from '../../shared/empty-state';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';
import { euro } from '../../shared/format';
import { StatusBadge } from '../../shared/status-badge';

type Filter = 'faellig' | 'alle' | 'ohne-verlaengerung';

@Component({
  selector: 'app-licenses',
  imports: [RouterLink, NgIcon, StatusBadge, FilterTabs, CustomerFilter, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Lizenzen, Wartungsverträge, Zertifikate und Domains mit ihrem Ablaufdatum. Was hier rot ist, kostet sonst Betrieb.
    </p>

    <dl class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div class="rounded-2xl bg-canvas p-4 ring-1 ring-line">
        <dt class="text-sm text-muted">Überfällig</dt>
        <dd class="mt-1 text-2xl font-bold text-red-700 tabular-nums">{{ overdue().length }}</dd>
      </div>
      <div class="rounded-2xl bg-canvas p-4 ring-1 ring-line">
        <dt class="text-sm text-muted">In 60 Tagen fällig</dt>
        <dd class="mt-1 text-2xl font-bold text-amber-700 tabular-nums">{{ soon().length }}</dd>
      </div>
      <div class="rounded-2xl bg-canvas p-4 ring-1 ring-line">
        <dt class="text-sm text-muted">Ohne automatische Verlängerung</dt>
        <dd class="mt-1 text-2xl font-bold text-ink tabular-nums">{{ manual().length }}</dd>
      </div>
      <div class="rounded-2xl bg-canvas p-4 ring-1 ring-line">
        <dt class="text-sm text-muted">Jahreskosten gesamt</dt>
        <dd class="mt-1 text-2xl font-bold text-ink tabular-nums">{{ euro(total()) }}</dd>
      </div>
    </dl>

    <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <app-filter-tabs label="Fristen filtern" [options]="filterOptions()" [(value)]="filter" />
      <div class="sm:w-72"><app-customer-filter [(value)]="customerId" /></div>
    </div>

    @if (visible().length === 0) {
      <div class="mt-5">
        <app-empty-state icon="phosphorCertificate" title="Nichts gefunden" hint="Anderen Filter oder anderen Kunden wählen." />
      </div>
    } @else {
      <ul class="mt-5 flex flex-col gap-3" aria-live="polite">
        @for (license of visible(); track license.id) {
          <li class="rounded-2xl bg-canvas p-4 ring-1 ring-line sm:p-5">
            <div class="flex flex-wrap items-start gap-4">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-alt text-slate-500">
                <ng-icon [name]="kind[license.kind].icon" size="20" />
              </span>
              <div class="min-w-[14rem] flex-1">
                <h2 class="font-semibold text-ink">{{ license.name }}</h2>
                <p class="mt-0.5 text-sm text-muted">
                  {{ license.vendor }} · {{ kind[license.kind].label }} ·
                  <a [routerLink]="['/kunden', license.customerId]" class="text-primary hover:underline">{{ customerName(license.customerId) }}</a>
                </p>
                @if (license.note) {
                  <p class="mt-2 text-sm text-muted">{{ license.note }}</p>
                }
              </div>
              <dl class="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt class="text-xs text-muted">Umfang</dt>
                  <dd class="font-medium text-ink tabular-nums">{{ license.quantity }} {{ license.unit }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">Kosten pro Jahr</dt>
                  <dd class="font-medium text-ink tabular-nums">{{ euro(license.costPerYear) }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">Verwaltet von</dt>
                  <dd class="font-medium text-ink">{{ license.owner }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">Fällig am</dt>
                  <dd class="flex flex-wrap items-center gap-2">
                    <span class="font-medium text-ink tabular-nums">{{ license.renewsOn }}</span>
                    <app-status-badge [status]="due(license.renewsOn)" />
                  </dd>
                </div>
              </dl>
            </div>
            @if (!license.autoRenew) {
              <p class="mt-3 flex items-center gap-2 border-t border-line pt-3 text-xs font-semibold text-amber-800">
                <ng-icon name="phosphorWarningCircle" size="15" />
                Verlängert sich nicht automatisch. Rechtzeitig anbieten und beauftragen lassen.
              </p>
            }
          </li>
        }
      </ul>
    }
  `,
})
export class Licenses {
  private readonly store = inject(KbStore);
  protected readonly kind = LICENSE_KIND;
  protected readonly euro = euro;

  protected readonly filter = signal<Filter>('faellig');
  protected readonly customerId = signal('alle');

  private readonly byCustomer = computed(() =>
    this.customerId() === 'alle' ? this.store.licenses() : this.store.licensesOf(this.customerId()),
  );

  protected readonly overdue = computed(() => this.byCustomer().filter((license) => daysUntil(license.renewsOn) < 0));
  protected readonly soon = computed(() =>
    this.byCustomer().filter((license) => {
      const days = daysUntil(license.renewsOn);
      return days >= 0 && days <= 60;
    }),
  );
  protected readonly manual = computed(() => this.byCustomer().filter((license) => !license.autoRenew));
  protected readonly total = computed(() => this.byCustomer().reduce((sum, license) => sum + license.costPerYear, 0));

  protected readonly filterOptions = computed<readonly FilterOption<Filter>[]>(() => [
    { value: 'faellig', label: 'Bald fällig', count: this.overdue().length + this.soon().length },
    { value: 'ohne-verlaengerung', label: 'Ohne Verlängerung', count: this.manual().length },
    { value: 'alle', label: 'Alle', count: this.byCustomer().length },
  ]);

  protected readonly visible = computed(() =>
    this.byCustomer()
      .filter((license) => {
        if (this.filter() === 'alle') return true;
        if (this.filter() === 'ohne-verlaengerung') return !license.autoRenew;
        return daysUntil(license.renewsOn) <= 60;
      })
      .slice()
      .sort((a, b) => daysUntil(a.renewsOn) - daysUntil(b.renewsOn)),
  );

  protected due(renewsOn: string) {
    return dueLabel(daysUntil(renewsOn), 60);
  }

  protected customerName(customerId: string): string {
    return this.store.customer(customerId)?.name ?? '';
  }
}
