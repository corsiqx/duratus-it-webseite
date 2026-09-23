import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { PortalStore } from '../../data/portal-store';
import { OFFER_STATUS } from '../../data/status';
import { euroCents } from '../../shared/format';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-offers',
  imports: [NgIcon, RouterLink, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Prüfen Sie unsere Angebote in Ruhe und unterzeichnen Sie direkt digital, ohne Ausdrucken und Einscannen.
    </p>

    <ul class="mt-5 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
      @for (offer of store.offers(); track offer.id) {
        <li>
          <a
            [routerLink]="['/angebote', offer.id]"
            class="group flex h-full flex-col rounded-2xl bg-canvas p-5 ring-1 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0 sm:p-6"
            [class]="offer.status === 'wartet' ? 'shadow-lg shadow-slate-900/5 ring-slate-300' : 'ring-line hover:ring-slate-300'"
          >
            <div class="flex items-start justify-between gap-3">
              <p class="pt-1 text-xs font-medium text-muted tabular-nums">{{ offer.id }}</p>
              <app-status-badge [status]="status[offer.status]" />
            </div>
            <h2 class="mt-2 text-base font-bold tracking-tight text-balance text-ink group-hover:text-primary-hover">{{ offer.title }}</h2>

            <p class="mt-4 flex items-baseline gap-1.5">
              <span class="text-2xl font-bold tracking-tight text-ink tabular-nums">{{ euroCents(offer.amount) }}</span>
              <span class="text-sm text-muted">pro {{ offer.period }}, netto</span>
            </p>

            <dl class="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-canvas-alt p-3 text-sm">
              <div>
                <dt class="text-xs text-muted">Erstellt am</dt>
                <dd class="mt-0.5 font-semibold text-ink tabular-nums">{{ offer.created }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">Gültig bis</dt>
                <dd class="mt-0.5 font-semibold text-ink tabular-nums">{{ offer.validUntil }}</dd>
              </div>
            </dl>

            <div class="mt-5 flex flex-1 flex-col justify-end">
              @switch (offer.status) {
                @case ('wartet') {
                  <span class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition group-hover:bg-primary-hover">
                    <ng-icon name="phosphorSignature" size="19" />
                    Prüfen und unterzeichnen
                  </span>
                }
                @case ('angenommen') {
                  <span class="flex min-h-12 items-center gap-2 rounded-xl bg-teal-50 px-4 text-sm font-medium text-teal-800">
                    <ng-icon name="phosphorCheckCircle" size="19" class="shrink-0" />
                    Unterzeichnet am {{ offer.signedAt }}
                  </span>
                }
                @case ('abgelehnt') {
                  <span class="flex min-h-12 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm text-slate-700">
                    <ng-icon name="phosphorXCircle" size="19" class="shrink-0" />
                    Abgelehnt am {{ offer.declinedAt }}
                  </span>
                }
                @case ('abgelaufen') {
                  <span class="flex min-h-12 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
                    <ng-icon name="phosphorClock" size="19" class="shrink-0" />
                    Abgelaufen. Ein neues Angebot können Sie anfragen.
                  </span>
                }
              }
            </div>
          </a>
        </li>
      }
    </ul>
  `,
})
export class Offers {
  protected readonly store = inject(PortalStore);
  protected readonly status = OFFER_STATUS;
  protected readonly euroCents = euroCents;
}
