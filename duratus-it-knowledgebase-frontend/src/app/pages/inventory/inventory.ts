import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore, daysUntil } from '../../data/kb-store';
import { AssetType } from '../../data/models';
import { ASSET_STATUS, ASSET_TYPE, dueLabel } from '../../data/status';
import { CustomerFilter } from '../../shared/customer-filter';
import { EmptyState } from '../../shared/empty-state';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';
import { StatusBadge } from '../../shared/status-badge';

type Filter = 'alle' | AssetType | 'garantie';

@Component({
  selector: 'app-inventory',
  imports: [RouterLink, NgIcon, StatusBadge, FilterTabs, CustomerFilter, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Alle Geräte, die Duratus IT betreut: Modell, Seriennummer, Adresse, Standort im Haus, Garantie.
    </p>

    <div class="mt-5 flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
      <app-filter-tabs label="Geräte filtern" [options]="filterOptions()" [(value)]="filter" />
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <app-customer-filter [(value)]="customerId" />
        <label class="relative block sm:w-60">
          <span class="sr-only">Geräte durchsuchen</span>
          <ng-icon name="phosphorMagnifyingGlass" size="18" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Name, Seriennummer oder IP"
            class="min-h-11 w-full rounded-full border border-slate-300 bg-canvas py-2 pr-4 pl-10 text-base text-ink transition outline-none placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:text-sm"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
        </label>
      </div>
    </div>

    @if (visible().length === 0) {
      <div class="mt-5">
        <app-empty-state icon="phosphorHardDrives" title="Kein Gerät gefunden" hint="Filter zurücksetzen oder anders suchen." />
      </div>
    } @else {
      <!-- Tabelle ab md, darunter Karten. -->
      <div class="mt-5 hidden overflow-hidden rounded-2xl bg-canvas ring-1 ring-line md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-line bg-canvas-alt text-xs text-muted uppercase">
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold">Gerät</th>
              <th scope="col" class="px-4 py-3 font-semibold">Kunde</th>
              <th scope="col" class="px-4 py-3 font-semibold">Adresse</th>
              <th scope="col" class="px-4 py-3 font-semibold">Standort</th>
              <th scope="col" class="px-4 py-3 font-semibold">Garantie</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            @for (asset of visible(); track asset.id) {
              <tr class="align-top transition-colors hover:bg-canvas-alt/60">
                <th scope="row" class="px-4 py-3 font-semibold text-ink">
                  <span class="flex items-center gap-2">
                    <ng-icon [name]="type[asset.type].icon" size="16" class="shrink-0 text-slate-400" />
                    {{ asset.name }}
                  </span>
                  <span class="mt-0.5 block text-xs font-normal text-muted">{{ asset.vendor }} {{ asset.model }}</span>
                  <span class="mt-0.5 block font-mono text-xs font-normal text-slate-400">SN {{ asset.serial }}</span>
                </th>
                <td class="px-4 py-3">
                  <a [routerLink]="['/kunden', asset.customerId, 'inventar']" class="text-primary hover:underline">{{ customerName(asset.customerId) }}</a>
                  <span class="mt-0.5 block text-xs text-muted">{{ siteName(asset.siteId) }}</span>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-muted">
                  {{ asset.ip ?? '–' }}
                  @if (asset.os) {
                    <span class="mt-0.5 block font-sans">{{ asset.os }}</span>
                  }
                </td>
                <td class="px-4 py-3 text-muted">{{ asset.location }}</td>
                <td class="px-4 py-3">
                  <span class="block tabular-nums">{{ asset.warrantyUntil }}</span>
                  <app-status-badge [status]="warranty(asset.warrantyUntil)" />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <ul class="mt-5 flex flex-col gap-3 md:hidden" aria-live="polite">
        @for (asset of visible(); track asset.id) {
          <li class="rounded-2xl bg-canvas p-4 ring-1 ring-line">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-canvas-alt text-slate-500">
                <ng-icon [name]="type[asset.type].icon" size="18" />
              </span>
              <div class="min-w-0 flex-1">
                <h2 class="font-semibold text-ink">{{ asset.name }}</h2>
                <p class="text-xs text-muted">{{ asset.vendor }} {{ asset.model }}</p>
              </div>
              <app-status-badge [status]="status[asset.status]" />
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><dt class="text-xs text-muted">Kunde</dt><dd class="truncate text-ink">{{ customerName(asset.customerId) }}</dd></div>
              <div><dt class="text-xs text-muted">Adresse</dt><dd class="font-mono text-xs text-ink">{{ asset.ip ?? '–' }}</dd></div>
              <div class="col-span-2"><dt class="text-xs text-muted">Standort</dt><dd class="text-ink">{{ asset.location }}</dd></div>
              <div class="col-span-2 flex flex-wrap items-center gap-2">
                <dt class="text-xs text-muted">Garantie bis {{ asset.warrantyUntil }}</dt>
                <dd><app-status-badge [status]="warranty(asset.warrantyUntil)" /></dd>
              </div>
            </dl>
          </li>
        }
      </ul>
    }
  `,
})
export class Inventory {
  private readonly store = inject(KbStore);
  protected readonly type = ASSET_TYPE;
  protected readonly status = ASSET_STATUS;

  protected readonly filter = signal<Filter>('alle');
  protected readonly customerId = signal('alle');
  protected readonly query = signal('');

  private readonly byCustomer = computed(() =>
    this.customerId() === 'alle' ? this.store.assets() : this.store.assetsOf(this.customerId()),
  );

  protected readonly filterOptions = computed<readonly FilterOption<Filter>[]>(() => {
    const assets = this.byCustomer();
    const count = (type: AssetType) => assets.filter((asset) => asset.type === type).length;
    return [
      { value: 'alle', label: 'Alle', count: assets.length },
      { value: 'firewall', label: 'Firewalls', count: count('firewall') },
      { value: 'switch', label: 'Switches', count: count('switch') },
      { value: 'server', label: 'Server', count: count('server') },
      { value: 'nas', label: 'Speicher', count: count('nas') },
      { value: 'garantie', label: 'Garantie läuft aus', count: assets.filter((asset) => daysUntil(asset.warrantyUntil) <= 180).length },
    ];
  });

  protected readonly visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    return this.byCustomer()
      .filter((asset) => {
        if (this.filter() === 'alle') return true;
        if (this.filter() === 'garantie') return daysUntil(asset.warrantyUntil) <= 180;
        return asset.type === this.filter();
      })
      .filter(
        (asset) =>
          !needle ||
          [asset.name, asset.vendor, asset.model, asset.serial, asset.ip ?? '', asset.location]
            .join(' ')
            .toLowerCase()
            .includes(needle),
      )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  });

  protected warranty(until: string) {
    return dueLabel(daysUntil(until), 180);
  }

  protected customerName(customerId: string): string {
    return this.store.customer(customerId)?.name ?? '';
  }

  protected siteName(siteId: string): string {
    return this.store.site(siteId)?.name ?? '';
  }
}
