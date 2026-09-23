import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { SERVICE_LEVEL } from '../../data/status';
import { EmptyState } from '../../shared/empty-state';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-customers',
  imports: [RouterLink, NgIcon, StatusBadge, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Eine Akte je Kunde: Stammdaten, Ansprechpartner, Zugänge, Netz, Dokumentation und Notfallplan.
    </p>

    <label class="relative mt-5 block sm:w-80">
      <span class="sr-only">Kunden durchsuchen</span>
      <ng-icon name="phosphorMagnifyingGlass" size="18" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        placeholder="Name, Branche oder Techniker"
        class="min-h-11 w-full rounded-full border border-slate-300 bg-canvas py-2 pr-4 pl-10 text-base text-ink transition outline-none placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:text-sm"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
      />
    </label>

    @if (visible().length === 0) {
      <div class="mt-5">
        <app-empty-state icon="phosphorBuildings" title="Kein Kunde gefunden" hint="Andere Schreibweise probieren oder die Suche leeren." />
      </div>
    } @else {
      <ul class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        @for (customer of visible(); track customer.id) {
          <li>
            <a
              [routerLink]="['/kunden', customer.id]"
              class="group flex h-full flex-col rounded-2xl bg-canvas p-5 ring-1 ring-line transition hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div class="flex items-start gap-3">
                <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-night text-sm font-bold text-white">
                  {{ customer.shortName.slice(0, 2).toUpperCase() }}
                </span>
                <div class="min-w-0 flex-1">
                  <h2 class="truncate font-bold text-ink group-hover:text-primary-hover">{{ customer.name }}</h2>
                  <p class="mt-0.5 truncate text-xs text-muted">{{ customer.branch }}</p>
                </div>
                <button
                  type="button"
                  class="-mt-1.5 -mr-2 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-canvas-alt focus-visible:outline-2 focus-visible:outline-primary"
                  [class]="pinned(customer.id) ? 'text-primary' : 'text-slate-300 hover:text-slate-500'"
                  (click)="togglePin($event, customer.id)"
                >
                  <ng-icon [name]="pinned(customer.id) ? 'phosphorPushPin' : 'phosphorPushPinSimple'" size="18" />
                  <span class="sr-only">{{ pinned(customer.id) ? 'Anheftung lösen' : 'Kunde anheften' }}</span>
                </button>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-2">
                <app-status-badge [status]="level[customer.serviceLevel]" />
                @if (customer.nis2 === 'betroffen') {
                  <span class="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-600/20 ring-inset">NIS2</span>
                }
              </div>

              <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt class="text-xs text-muted">Arbeitsplätze</dt>
                  <dd class="font-semibold text-ink tabular-nums">{{ customer.workplaces }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">Standorte</dt>
                  <dd class="font-semibold text-ink tabular-nums">{{ store.sitesOf(customer.id).length }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">Geräte</dt>
                  <dd class="font-semibold text-ink tabular-nums">{{ store.assetsOf(customer.id).length }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">Zugänge</dt>
                  <dd class="font-semibold text-ink tabular-nums">{{ store.secretsOf(customer.id).length }}</dd>
                </div>
              </dl>

              <p class="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-xs text-muted">
                <ng-icon name="phosphorUser" size="14" class="shrink-0" />
                {{ customer.responsible }}<span class="text-slate-400">, Vertretung {{ customer.substitute }}</span>
              </p>
            </a>
          </li>
        }
      </ul>
    }
  `,
})
export class Customers {
  protected readonly store = inject(KbStore);
  protected readonly level = SERVICE_LEVEL;
  protected readonly query = signal('');

  protected readonly visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const customers = [...this.store.customers()].sort((a, b) => {
      const pinnedDiff = Number(this.pinned(b.id)) - Number(this.pinned(a.id));
      return pinnedDiff !== 0 ? pinnedDiff : a.name.localeCompare(b.name, 'de');
    });
    if (!needle) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.branch, customer.responsible, customer.substitute, ...customer.tags]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  });

  protected pinned(customerId: string): boolean {
    return this.store.pinned().includes(customerId);
  }

  /** The pin sits inside the card link, so the navigation has to be stopped here. */
  protected togglePin(event: Event, customerId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.store.togglePin(customerId);
  }
}
