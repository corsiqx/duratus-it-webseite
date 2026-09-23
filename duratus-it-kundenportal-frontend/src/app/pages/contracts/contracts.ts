import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { nextCancellation, noticeLabel, termLabel } from '../../data/contract-terms';
import { PortalStore } from '../../data/portal-store';
import { StatusLabel } from '../../data/status';
import { dateDe, euro, euroCents } from '../../shared/format';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-contracts',
  imports: [NgIcon, RouterLink, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  template: `
    <div class="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
      <!-- Headline number -->
      <section class="flex flex-col justify-between rounded-2xl bg-canvas p-5 ring-1 ring-line sm:p-6" aria-labelledby="contracts-volume">
        <div>
          <h2 id="contracts-volume" class="text-sm text-muted">Monatliches Volumen aller aktiven Verträge</h2>
          <p class="mt-1 flex items-baseline gap-1.5">
            <span class="text-3xl font-bold tracking-tight text-ink tabular-nums">{{ euroCents(store.monthlyVolume()) }}</span>
            <span class="text-sm text-muted">netto</span>
          </p>
        </div>
        <p class="mt-4 text-sm text-muted">{{ store.activeContracts().length }} aktive Verträge</p>
      </section>

      <!-- Spend per service area: one hue, value labels in text color -->
      <section class="rounded-2xl bg-canvas p-5 ring-1 ring-line sm:p-6 lg:col-span-2" aria-labelledby="contracts-split">
        <h2 id="contracts-split" class="text-base font-bold tracking-tight text-ink">Verteilung nach Servicebereich</h2>
        <ul class="mt-5 flex flex-col gap-4">
          @for (item of split(); track item.label) {
            <li>
              <div class="flex items-baseline justify-between gap-3 text-sm">
                <span class="min-w-0 truncate font-medium text-ink">{{ item.label }}</span>
                <span class="shrink-0 whitespace-nowrap text-muted tabular-nums"><span class="font-semibold text-ink">{{ euro(item.amount) }}</span> · {{ item.percent }} %</span>
              </div>
              <div class="mt-2 h-2 rounded-full bg-slate-100" role="presentation">
                <div class="h-2 rounded-full bg-primary" [style.width.%]="item.percent"></div>
              </div>
            </li>
          }
        </ul>
      </section>
    </div>

    <ul class="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
      @for (contract of contracts(); track contract.id) {
        <li class="flex flex-col rounded-2xl bg-canvas p-5 ring-1 ring-line sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <p class="pt-1 text-xs font-medium text-muted tabular-nums">{{ contract.id }}</p>
            <app-status-badge [status]="contract.active ? active : inactive" />
          </div>
          <h2 class="mt-2 text-base font-bold tracking-tight text-ink">{{ contract.name }}</h2>
          <p class="mt-3 flex items-baseline gap-1.5">
            <span class="text-2xl font-bold tracking-tight text-ink tabular-nums">{{ euroCents(contract.amount) }}</span>
            <span class="text-sm text-muted">pro Monat, netto</span>
          </p>

          <dl class="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            <dt class="text-muted">Vertragsbeginn</dt>
            <dd class="font-medium text-ink tabular-nums">{{ contract.start }}</dd>
            <dt class="text-muted">Laufzeit</dt>
            <dd class="font-medium text-ink">{{ contract.term }}</dd>
            <dt class="text-muted">Kündigung</dt>
            <dd class="font-medium text-ink">{{ contract.notice }}</dd>
          </dl>

          <p class="mt-4 flex items-start gap-2.5 rounded-xl bg-canvas-alt p-3 text-sm text-ink">
            <ng-icon name="phosphorCalendarCheck" size="18" class="mt-0.5 shrink-0 text-primary" />
            <span>
              Nächste Kündigung möglich bis <span class="font-semibold tabular-nums">{{ contract.deadline }}</span>
              zum <span class="font-semibold tabular-nums">{{ contract.endsAt }}</span>
            </span>
          </p>

          <div class="mt-5 border-t border-line pt-4">
            <h3 class="text-xs font-semibold tracking-wide text-muted uppercase">Enthaltene Leistungen</h3>
            <ul class="mt-3 flex flex-col gap-2">
              @for (item of contract.included; track item) {
                <li class="flex items-start gap-2.5 text-sm text-ink">
                  <span class="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <ng-icon name="phosphorCheck" size="11" />
                  </span>
                  {{ item }}
                </li>
              }
            </ul>
          </div>

          <div class="mt-5 flex flex-1 items-end">
            <a
              [routerLink]="['/tickets']"
              [queryParams]="{ neu: 1, betreff: 'Vertragsänderung ' + contract.id + ' (' + contract.name + ')', kategorie: 'sonstiges' }"
              class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-slate-300 transition hover:bg-canvas-alt hover:ring-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
            >
              <ng-icon name="phosphorWrench" size="17" />
              Änderung anfragen
            </a>
          </div>
        </li>
      }
    </ul>
  `,
})
export class Contracts {
  protected readonly store = inject(PortalStore);
  protected readonly euro = euro;
  protected readonly euroCents = euroCents;
  protected readonly active: StatusLabel = { label: 'Aktiv', tone: 'good' };
  protected readonly inactive: StatusLabel = { label: 'Beendet', tone: 'neutral' };

  protected readonly contracts = computed(() =>
    this.store.contracts().map((contract) => {
      const cancellation = nextCancellation(contract);
      return {
        ...contract,
        term: termLabel(contract),
        notice: noticeLabel(contract),
        deadline: dateDe(cancellation.deadline),
        endsAt: dateDe(cancellation.endsAt),
      };
    }),
  );

  protected readonly split = computed(() => {
    const active = this.store.activeContracts();
    const total = active.reduce((sum, contract) => sum + contract.amount, 0);
    return active.map((contract) => ({
      label: contract.area,
      amount: contract.amount,
      percent: Math.round((contract.amount / total) * 100),
    }));
  });
}
