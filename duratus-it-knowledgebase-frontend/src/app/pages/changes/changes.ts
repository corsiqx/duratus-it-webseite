import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { ChangeType } from '../../data/models';
import { CHANGE_RISK, CHANGE_STATUS, CHANGE_TYPE } from '../../data/status';
import { CustomerFilter } from '../../shared/customer-filter';
import { EmptyState } from '../../shared/empty-state';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';
import { parseDateDe } from '../../shared/format';
import { StatusBadge } from '../../shared/status-badge';

type Filter = 'alle' | ChangeType;

@Component({
  selector: 'app-changes',
  imports: [RouterLink, NgIcon, StatusBadge, FilterTabs, CustomerFilter, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Jede Arbeit an der Infrastruktur eines Kunden: was gemacht wurde, von wem, warum und wie es rückgängig zu machen wäre.
    </p>

    <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <app-filter-tabs label="Tätigkeiten filtern" [options]="filterOptions()" [(value)]="filter" />
      <div class="sm:w-72"><app-customer-filter [(value)]="customerId" /></div>
    </div>

    @if (visible().length === 0) {
      <div class="mt-5">
        <app-empty-state icon="phosphorClipboardText" title="Keine Tätigkeit gefunden" hint="Anderen Filter oder anderen Kunden wählen." />
      </div>
    } @else {
      <ol class="mt-5 flex flex-col divide-y divide-line overflow-hidden rounded-2xl bg-canvas ring-1 ring-line" aria-live="polite">
        @for (change of visible(); track change.id) {
          <li>
            <a
              [routerLink]="['/taetigkeiten', change.id]"
              class="group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-canvas-alt/70 focus-visible:bg-canvas-alt focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-5"
            >
              <span
                class="mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-xl sm:flex"
                [class]="change.type === 'stoerung' ? 'bg-red-50 text-red-700' : 'bg-canvas-alt text-slate-500'"
              >
                <ng-icon [name]="type[change.type].icon" size="20" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  <span class="font-semibold tabular-nums">{{ change.id }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ type[change.type].label }}</span>
                  <span aria-hidden="true">·</span>
                  <span class="tabular-nums">{{ change.date }}</span>
                </span>
                <span class="mt-1 block font-semibold text-ink group-hover:text-primary-hover">{{ change.title }}</span>
                <span class="mt-1 block text-sm text-muted">
                  {{ customerName(change.customerId) }} · {{ change.technician }} · {{ change.duration }} Stunden
                </span>
                <span class="mt-2.5 flex flex-wrap gap-2 md:hidden">
                  <app-status-badge [status]="status[change.status]" />
                  <app-status-badge [status]="risk[change.risk]" />
                </span>
              </span>
              <span class="hidden shrink-0 flex-col items-end gap-2 md:flex">
                <app-status-badge [status]="status[change.status]" />
                <app-status-badge [status]="risk[change.risk]" />
              </span>
            </a>
          </li>
        }
      </ol>
    }
  `,
})
export class Changes {
  private readonly store = inject(KbStore);
  protected readonly type = CHANGE_TYPE;
  protected readonly risk = CHANGE_RISK;
  protected readonly status = CHANGE_STATUS;

  protected readonly filter = signal<Filter>('alle');
  protected readonly customerId = signal('alle');

  private readonly byCustomer = computed(() =>
    this.customerId() === 'alle' ? this.store.changes() : this.store.changesOf(this.customerId()),
  );

  protected readonly filterOptions = computed<readonly FilterOption<Filter>[]>(() => {
    const changes = this.byCustomer();
    const count = (type: ChangeType) => changes.filter((change) => change.type === type).length;
    return [
      { value: 'alle', label: 'Alle', count: changes.length },
      { value: 'change', label: 'Änderungen', count: count('change') },
      { value: 'wartung', label: 'Wartung', count: count('wartung') },
      { value: 'stoerung', label: 'Störungen', count: count('stoerung') },
      { value: 'projekt', label: 'Projekte', count: count('projekt') },
      { value: 'onboarding', label: 'On- und Offboarding', count: count('onboarding') + count('offboarding') },
    ];
  });

  /** Newest first; planned work in the future therefore appears at the top. */
  protected readonly visible = computed(() =>
    this.byCustomer()
      .filter((change) => {
        if (this.filter() === 'alle') return true;
        if (this.filter() === 'onboarding') return change.type === 'onboarding' || change.type === 'offboarding';
        return change.type === this.filter();
      })
      .slice()
      .sort((a, b) => parseDateDe(b.date).getTime() - parseDateDe(a.date).getTime()),
  );

  protected customerName(customerId: string): string {
    return this.store.customer(customerId)?.name ?? '';
  }
}
