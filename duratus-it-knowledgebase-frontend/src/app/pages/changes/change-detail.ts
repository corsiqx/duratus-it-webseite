import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { CHANGE_RISK, CHANGE_STATUS, CHANGE_TYPE } from '../../data/status';
import { EmptyState } from '../../shared/empty-state';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-change-detail',
  imports: [RouterLink, NgIcon, StatusBadge, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (change(); as entry) {
      <a routerLink="/taetigkeiten" class="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink">
        <ng-icon name="phosphorArrowLeft" size="16" />
        Alle Tätigkeiten
      </a>

      <header class="mt-2">
        <p class="flex flex-wrap items-center gap-x-2 text-sm text-muted">
          <span class="font-semibold tabular-nums">{{ entry.id }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ type[entry.type].label }}</span>
          <span aria-hidden="true">·</span>
          <span class="tabular-nums">{{ entry.date }}</span>
        </p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{{ entry.title }}</h2>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <app-status-badge [status]="status[entry.status]" />
          <app-status-badge [status]="risk[entry.risk]" />
          <a [routerLink]="['/kunden', entry.customerId]" class="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-primary ring-1 ring-line hover:ring-primary/30">
            {{ customerName() }}
          </a>
        </div>
      </header>

      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="min-w-0">
          <section>
            <h3 class="text-lg font-bold tracking-tight text-ink">Worum es ging</h3>
            <p class="mt-2 leading-relaxed text-ink">{{ entry.summary }}</p>
          </section>

          <section class="mt-8">
            <h3 class="text-lg font-bold tracking-tight text-ink">Durchgeführte Schritte</h3>
            <ol class="mt-4 flex flex-col gap-3">
              @for (step of entry.steps; track step; let index = $index) {
                <li class="flex items-start gap-3">
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-bold text-muted ring-1 ring-line tabular-nums">
                    {{ index + 1 }}
                  </span>
                  <span class="pt-0.5 leading-relaxed text-ink">{{ step }}</span>
                </li>
              }
            </ol>
          </section>

          <section class="mt-8 rounded-2xl bg-canvas-alt p-5 ring-1 ring-line">
            <h3 class="flex items-center gap-2 font-bold text-ink">
              <ng-icon name="phosphorArrowCounterClockwise" size="18" class="text-slate-500" />
              Rückweg
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-ink">{{ entry.rollback }}</p>
          </section>
        </div>

        <aside class="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div class="rounded-2xl bg-canvas p-5 ring-1 ring-line">
            <h3 class="font-bold text-ink">Eckdaten</h3>
            <dl class="mt-3 flex flex-col gap-3 text-sm">
              <div>
                <dt class="text-xs text-muted">Ausgeführt von</dt>
                <dd class="mt-0.5 font-medium text-ink">{{ entry.technician }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">Aufwand</dt>
                <dd class="mt-0.5 font-medium text-ink tabular-nums">{{ entry.duration }} Stunden</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">Freigegeben durch</dt>
                <dd class="mt-0.5 font-medium text-ink">{{ entry.approvedBy ?? 'keine Freigabe nötig' }}</dd>
              </div>
              @if (entry.ticketRef) {
                <div>
                  <dt class="text-xs text-muted">Ticket im Kundenportal</dt>
                  <dd class="mt-0.5 font-mono text-xs font-medium text-ink">{{ entry.ticketRef }}</dd>
                </div>
              }
            </dl>
          </div>

          @if (assets().length > 0) {
            <div class="rounded-2xl bg-canvas p-5 ring-1 ring-line">
              <h3 class="font-bold text-ink">Betroffene Geräte</h3>
              <ul class="mt-3 flex flex-col gap-2 text-sm">
                @for (asset of assets(); track asset.id) {
                  <li class="flex items-start gap-2">
                    <ng-icon name="phosphorHardDrives" size="16" class="mt-0.5 shrink-0 text-slate-400" />
                    <span>
                      <span class="block font-medium text-ink">{{ asset.name }}</span>
                      <span class="block text-xs text-muted">{{ asset.vendor }} {{ asset.model }}</span>
                    </span>
                  </li>
                }
              </ul>
            </div>
          }
        </aside>
      </div>
    } @else {
      <app-empty-state icon="phosphorClipboardText" title="Tätigkeit nicht gefunden" hint="Der Link zeigt auf einen Eintrag, den es nicht gibt.">
        <a routerLink="/taetigkeiten" class="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover">
          Alle Tätigkeiten
        </a>
      </app-empty-state>
    }
  `,
})
export class ChangeDetail {
  private readonly store = inject(KbStore);
  protected readonly type = CHANGE_TYPE;
  protected readonly risk = CHANGE_RISK;
  protected readonly status = CHANGE_STATUS;

  readonly changeId = input.required<string>();

  protected readonly change = computed(() => this.store.changes().find((change) => change.id === this.changeId()));

  protected readonly assets = computed(() =>
    (this.change()?.affectedAssets ?? []).map((id) => this.store.asset(id)).filter((asset) => asset !== undefined),
  );

  protected customerName(): string {
    const customerId = this.change()?.customerId;
    return customerId ? (this.store.customer(customerId)?.name ?? '') : '';
  }
}
