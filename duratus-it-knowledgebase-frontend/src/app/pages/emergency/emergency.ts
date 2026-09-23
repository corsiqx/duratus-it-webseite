import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { EmergencyPlan } from '../../data/models';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-emergency',
  imports: [RouterLink, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Wer wird angerufen, was kommt zuerst zurück, was ist vereinbart. Der Plan gehört ausgedruckt in den Serverraum,
      weil er genau dann gebraucht wird, wenn nichts mehr läuft.
    </p>

    @if (untested().length > 0) {
      <div class="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm ring-1 ring-amber-600/20">
        <ng-icon name="phosphorWarningCircle" size="20" class="mt-0.5 shrink-0 text-amber-700" />
        <p class="text-amber-900">
          <span class="font-semibold">{{ untested().length }} Szenarien wurden noch nie getestet.</span>
          Ein ungetesteter Notfallplan ist eine Vermutung. Termine mit den Kunden vereinbaren.
        </p>
      </div>
    }

    <ul class="mt-5 flex flex-col gap-4">
      @for (plan of plans(); track plan.customerId) {
        <li class="rounded-2xl bg-canvas p-5 ring-1 ring-line sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="text-lg font-bold tracking-tight text-ink">
                <a [routerLink]="['/kunden', plan.customerId, 'notfall']" class="hover:text-primary-hover">{{ customerName(plan.customerId) }}</a>
              </h2>
              <p class="mt-0.5 text-sm text-muted">Stand {{ plan.updated }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <a
                [routerLink]="['/kunden', plan.customerId, 'notfall']"
                class="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-700 ring-1 ring-line transition hover:bg-canvas-alt"
              >
                Vollständig ansehen
              </a>
              <button
                type="button"
                class="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:opacity-70"
                [disabled]="busy() === plan.customerId"
                (click)="download(plan)"
              >
                <ng-icon [name]="busy() === plan.customerId ? 'phosphorCircleNotch' : 'phosphorFileArrowDown'" size="17" [class.animate-spin]="busy() === plan.customerId" />
                Als PDF
              </button>
            </div>
          </div>

          <dl class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt class="text-xs text-muted">Wiederanlaufzeit</dt>
              <dd class="mt-0.5 text-sm font-medium text-ink">{{ plan.rto }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Maximaler Datenverlust</dt>
              <dd class="mt-0.5 text-sm font-medium text-ink">{{ plan.rpo }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Erste Rufnummer</dt>
              <dd class="mt-0.5 text-sm font-medium text-ink">
                {{ plan.escalation[0].name }}, {{ plan.escalation[0].phone }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Kopie außer Haus</dt>
              <dd class="mt-0.5 text-sm font-medium" [class]="plan.offlineCopy.startsWith('Nicht') ? 'text-red-700' : 'text-ink'">
                {{ plan.offlineCopy.startsWith('Nicht') ? 'fehlt' : 'vorhanden' }}
              </dd>
            </div>
          </dl>

          <ul class="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            @for (scenario of plan.scenarios; track scenario.id) {
              <li
                class="rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset"
                [class]="scenario.lastTested ? 'bg-canvas-alt text-muted ring-line' : 'bg-amber-50 text-amber-800 ring-amber-600/20'"
              >
                {{ scenario.title }}
                <span class="font-normal">· {{ scenario.lastTested ? 'getestet ' + scenario.lastTested : 'nie getestet' }}</span>
              </li>
            }
          </ul>
        </li>
      }
    </ul>
  `,
})
export class Emergency {
  private readonly store = inject(KbStore);
  private readonly toasts = inject(ToastService);

  protected readonly busy = signal<string | null>(null);
  protected readonly plans = computed(() => this.store.emergencyPlans());

  protected readonly untested = computed(() =>
    this.plans().flatMap((plan) => plan.scenarios.filter((scenario) => scenario.lastTested === null)),
  );

  protected customerName(customerId: string): string {
    return this.store.customer(customerId)?.name ?? '';
  }

  /** jsPDF is loaded only when a plan is actually exported. */
  protected async download(plan: EmergencyPlan): Promise<void> {
    const customer = this.store.customer(plan.customerId);
    if (!customer) return;
    this.busy.set(plan.customerId);
    try {
      const { createEmergencyPdf } = await import('./emergency-pdf');
      createEmergencyPdf(plan, customer);
      this.store.log('export', `Notfallplan ${customer.name} als PDF`, plan.customerId);
      this.toasts.show('Notfallplan als PDF erstellt.', 'phosphorFileArrowDown');
    } finally {
      this.busy.set(null);
    }
  }
}
