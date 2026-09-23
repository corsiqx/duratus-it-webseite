import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { CHANGE_TYPE, SERVICE_LEVEL, dueLabel } from '../../data/status';
import { StatusBadge } from '../../shared/status-badge';

const EXPIRY_ICON: Record<string, string> = {
  lizenz: 'phosphorCertificate',
  zertifikat: 'phosphorSeal',
  domain: 'phosphorGlobe',
  garantie: 'phosphorHardDrives',
  rotation: 'phosphorKey',
  pruefung: 'phosphorBookOpen',
};

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgIcon, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Guten Tag, {{ store.staff().name }}. Das steht heute an.
    </p>

    <!-- Kennzahlen -->
    <dl class="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      @for (kpi of kpis(); track kpi.label) {
        <div class="rounded-2xl bg-canvas p-4 ring-1 ring-line sm:p-5">
          <dt class="flex items-center gap-2 text-sm text-muted">
            <ng-icon [name]="kpi.icon" size="17" class="shrink-0 text-slate-400" />
            {{ kpi.label }}
          </dt>
          <dd class="mt-2 text-2xl font-bold tracking-tight text-ink tabular-nums sm:text-3xl">{{ kpi.value }}</dd>
          <dd class="mt-0.5 text-xs text-muted">{{ kpi.hint }}</dd>
        </div>
      }
    </dl>

    <div class="mt-6 grid gap-5 lg:grid-cols-3">
      <!-- Handlungsbedarf -->
      <section class="min-w-0 lg:col-span-2" aria-labelledby="todo-heading">
        <div class="flex items-center justify-between gap-3">
          <h2 id="todo-heading" class="text-lg font-bold tracking-tight text-ink">Handlungsbedarf</h2>
          <span class="text-sm text-muted tabular-nums">{{ store.openExpiries().length }} offen</span>
        </div>

        @if (todo().length === 0) {
          <p class="mt-3 rounded-2xl bg-canvas p-5 text-sm text-muted ring-1 ring-line">
            Nichts überfällig. Alle Fristen liegen mehr als 60 Tage in der Zukunft.
          </p>
        } @else {
          <ul class="mt-3 flex flex-col divide-y divide-line overflow-hidden rounded-2xl bg-canvas ring-1 ring-line">
            @for (item of todo(); track item.id) {
              <li>
                <a
                  [routerLink]="item.link"
                  class="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-canvas-alt/70 focus-visible:bg-canvas-alt focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-5"
                >
                  <span
                    class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
                    [class]="item.daysLeft < 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'"
                  >
                    <ng-icon [name]="icon(item.kind)" size="18" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-semibold text-ink group-hover:text-primary-hover">{{ item.title }}</span>
                    <span class="mt-0.5 block truncate text-xs text-muted">{{ customerName(item.customerId) }} · {{ item.detail }}</span>
                  </span>
                  <span class="hidden shrink-0 sm:block"><app-status-badge [status]="status(item.daysLeft)" /></span>
                </a>
              </li>
            }
          </ul>
          <a routerLink="/lizenzen" class="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Alle Fristen ansehen
            <ng-icon name="phosphorArrowRight" size="16" />
          </a>
        }

        <!-- Geplante Arbeiten -->
        @if (store.plannedChanges().length > 0) {
          <h2 class="mt-8 text-lg font-bold tracking-tight text-ink">Geplante Arbeiten</h2>
          <ul class="mt-3 flex flex-col gap-3">
            @for (change of store.plannedChanges(); track change.id) {
              <li>
                <a
                  [routerLink]="['/taetigkeiten', change.id]"
                  class="group flex items-start gap-3 rounded-2xl bg-canvas p-4 ring-1 ring-line transition hover:ring-slate-300"
                >
                  <span class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <ng-icon [name]="changeType[change.type].icon" size="18" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block font-semibold text-ink group-hover:text-primary-hover">{{ change.title }}</span>
                    <span class="mt-0.5 block text-sm text-muted">
                      {{ customerName(change.customerId) }} · geplant für {{ change.date }} · {{ change.technician }}
                    </span>
                  </span>
                </a>
              </li>
            }
          </ul>
        }
      </section>

      <!-- Seitenspalte -->
      <div class="flex min-w-0 flex-col gap-5">
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" class="text-lg font-bold tracking-tight text-ink">Kundenakten</h2>
          <ul class="mt-3 flex flex-col gap-2">
            @for (customer of shortcuts(); track customer.id) {
              <li>
                <a
                  [routerLink]="['/kunden', customer.id]"
                  class="group flex items-center gap-3 rounded-2xl bg-canvas p-3.5 ring-1 ring-line transition hover:ring-slate-300"
                >
                  <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-night text-sm font-bold text-white">
                    {{ customer.shortName.slice(0, 2).toUpperCase() }}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate font-semibold text-ink group-hover:text-primary-hover">{{ customer.name }}</span>
                    <span class="block truncate text-xs text-muted">{{ level[customer.serviceLevel].label }} · {{ customer.responsible }}</span>
                  </span>
                  @if (store.pinned().includes(customer.id)) {
                    <ng-icon name="phosphorPushPin" size="16" class="shrink-0 text-primary" />
                  }
                </a>
              </li>
            }
          </ul>
          <a routerLink="/kunden" class="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Alle Kunden
            <ng-icon name="phosphorArrowRight" size="16" />
          </a>
        </section>

        <section aria-labelledby="quick-heading">
          <h2 id="quick-heading" class="text-lg font-bold tracking-tight text-ink">Schnellzugriff</h2>
          <ul class="mt-3 grid grid-cols-2 gap-2">
            @for (link of quickLinks; track link.path) {
              <li>
                <a
                  [routerLink]="link.path"
                  class="flex h-full flex-col gap-2 rounded-2xl bg-canvas p-3.5 ring-1 ring-line transition hover:ring-slate-300"
                >
                  <ng-icon [name]="link.icon" size="20" class="text-primary" />
                  <span class="text-sm font-semibold text-ink">{{ link.label }}</span>
                </a>
              </li>
            }
          </ul>
        </section>

        <section class="rounded-2xl bg-night p-5 text-slate-300" aria-labelledby="demo-heading">
          <h2 id="demo-heading" class="flex items-center gap-2 text-sm font-semibold text-white">
            <ng-icon name="phosphorInfo" size="18" class="text-teal-300" />
            Prototyp mit Demodaten
          </h2>
          <p class="mt-2 text-sm leading-relaxed">
            Alle Kunden, Geräte und Zugänge hier sind erfunden. Es gibt kein Backend: Änderungen liegen nur in diesem Browser.
          </p>
          <a routerLink="/konto" class="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal-300 hover:underline">
            Demodaten zurücksetzen
            <ng-icon name="phosphorArrowRight" size="16" />
          </a>
        </section>
      </div>
    </div>
  `,
})
export class Dashboard {
  protected readonly store = inject(KbStore);
  protected readonly level = SERVICE_LEVEL;
  protected readonly changeType = CHANGE_TYPE;

  protected readonly quickLinks = [
    { label: 'Zugänge', path: '/zugaenge', icon: 'phosphorKey' },
    { label: 'Netzwerkpläne', path: '/netzwerk', icon: 'phosphorTreeStructure' },
    { label: 'Runbooks', path: '/dokumentation', icon: 'phosphorBookOpen' },
    { label: 'Notfallpläne', path: '/notfall', icon: 'phosphorSiren' },
  ];

  protected readonly kpis = computed(() => [
    {
      label: 'Kunden',
      value: this.store.customers().length,
      hint: `${this.store.sites().length} Standorte`,
      icon: 'phosphorBuildings',
    },
    {
      label: 'Geräte',
      value: this.store.assets().length,
      hint: 'im Inventar erfasst',
      icon: 'phosphorHardDrives',
    },
    {
      label: 'Zugänge',
      value: this.store.secrets().length,
      hint: `${this.store.dueSecrets().length} zum Wechsel fällig`,
      icon: 'phosphorKey',
    },
    {
      label: 'Dokumente',
      value: this.store.docs().length,
      hint: `${this.store.changes().length} Tätigkeiten dokumentiert`,
      icon: 'phosphorBookOpen',
    },
  ]);

  /** The six most urgent deadlines, overdue first. */
  protected readonly todo = computed(() => this.store.openExpiries().slice(0, 6));

  /** Pinned files first, then the recently opened ones. */
  protected readonly shortcuts = computed(() => {
    const pinned = this.store.pinnedCustomers();
    const recent = this.store.recentCustomers().filter((customer) => !this.store.pinned().includes(customer.id));
    return [...pinned, ...recent].slice(0, 5);
  });

  protected customerName(customerId: string): string {
    return customerId === 'allgemein' ? 'Allgemein' : (this.store.customer(customerId)?.name ?? '');
  }

  protected status(daysLeft: number) {
    return dueLabel(daysLeft);
  }

  protected icon(kind: string): string {
    return EXPIRY_ICON[kind] ?? 'phosphorClock';
  }
}
