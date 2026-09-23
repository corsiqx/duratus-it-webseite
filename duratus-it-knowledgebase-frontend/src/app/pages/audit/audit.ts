import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { AUDIT_ACTION } from '../../data/status';
import { CustomerFilter } from '../../shared/customer-filter';
import { EmptyState } from '../../shared/empty-state';

@Component({
  selector: 'app-audit',
  imports: [NgIcon, CustomerFilter, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Wer hat wann welchen Zugang geöffnet, kopiert oder gewechselt. Das Protokoll schützt das Team: Es zeigt, dass
      sauber gearbeitet wurde, und macht einen Missbrauch nachvollziehbar.
    </p>

    <div class="mt-4 flex items-start gap-3 rounded-2xl bg-canvas-alt p-4 text-sm ring-1 ring-line">
      <ng-icon name="phosphorInfo" size="19" class="mt-0.5 shrink-0 text-slate-500" />
      <p class="text-muted">
        Im Prototyp liegt das Protokoll nur in diesem Browser und lässt sich zurücksetzen. Im Echtbetrieb gehört es auf
        den Server, für die aufnehmende Person unveränderbar, mit fester Aufbewahrungsfrist.
      </p>
    </div>

    <div class="mt-5 sm:max-w-xs">
      <app-customer-filter [(value)]="customerId" />
    </div>

    @if (visible().length === 0) {
      <div class="mt-5">
        <app-empty-state icon="phosphorListMagnifyingGlass" title="Keine Einträge" hint="Für diesen Kunden wurde noch kein Zugriff protokolliert." />
      </div>
    } @else {
      <ol class="mt-5 flex flex-col divide-y divide-line overflow-hidden rounded-2xl bg-canvas ring-1 ring-line">
        @for (entry of visible(); track entry.id) {
          <li class="flex items-start gap-3 px-4 py-3.5 sm:px-5">
            <span
              class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
              [class]="entry.action === 'zugang-rotiert' ? 'bg-teal-50 text-teal-700' : 'bg-canvas-alt text-slate-500'"
            >
              <ng-icon [name]="action[entry.action].icon" size="17" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-ink">
                {{ action[entry.action].label }}: <span class="font-normal">{{ entry.target }}</span>
              </p>
              <p class="mt-0.5 text-xs text-muted">
                {{ entry.user }} · <span class="tabular-nums">{{ store.formatAuditTime(entry.at) }}</span>
                @if (entry.customerId) {
                  · {{ customerName(entry.customerId) }}
                }
              </p>
            </div>
          </li>
        }
      </ol>
      <p class="mt-3 text-xs text-muted">{{ visible().length }} Einträge, neueste zuerst.</p>
    }
  `,
})
export class Audit {
  protected readonly store = inject(KbStore);
  protected readonly action = AUDIT_ACTION;
  protected readonly customerId = signal('alle');

  protected readonly visible = computed(() =>
    this.customerId() === 'alle'
      ? this.store.audit()
      : this.store.audit().filter((entry) => entry.customerId === this.customerId()),
  );

  protected customerName(customerId: string): string {
    return this.store.customer(customerId)?.name ?? '';
  }
}
