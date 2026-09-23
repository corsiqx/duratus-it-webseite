import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { StaffRole } from '../../data/models';
import { Dialog } from '../../shared/dialog';
import { ToastService } from '../../shared/toast.service';

const ROLE_LABEL: Record<StaffRole, { label: string; hint: string }> = {
  techniker: { label: 'Technik', hint: 'Sieht Zugänge der Stufe Team.' },
  administrator: { label: 'Administration', hint: 'Sieht zusätzlich Zugänge der Stufe Administration.' },
  geschaeftsfuehrung: { label: 'Geschäftsführung', hint: 'Sieht alles, auch das vollständige Protokoll.' },
};

@Component({
  selector: 'app-account',
  imports: [RouterLink, NgIcon, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="grid gap-5 lg:grid-cols-2">
      <section class="rounded-2xl bg-canvas p-5 ring-1 ring-line sm:p-6" aria-labelledby="konto-heading">
        <h2 id="konto-heading" class="font-bold text-ink">Mein Konto</h2>
        <dl class="mt-4 flex flex-col gap-4">
          <div>
            <dt class="text-xs text-muted">Name</dt>
            <dd class="mt-0.5 font-medium text-ink">{{ store.staff().name }}</dd>
          </div>
          <div>
            <dt class="text-xs text-muted">E-Mail</dt>
            <dd class="mt-0.5 font-medium text-ink">{{ store.staff().email }}</dd>
          </div>
          <div>
            <dt class="text-xs text-muted">Team</dt>
            <dd class="mt-0.5 font-medium text-ink">{{ store.staff().team }}</dd>
          </div>
          <div>
            <dt class="text-xs text-muted">Rolle</dt>
            <dd class="mt-0.5 font-medium text-ink">{{ role().label }}</dd>
            <dd class="text-sm text-muted">{{ role().hint }}</dd>
          </div>
        </dl>
        <p class="mt-5 flex items-start gap-2 border-t border-line pt-4 text-xs text-muted">
          <ng-icon name="phosphorInfo" size="15" class="mt-0.5 shrink-0" />
          Im Prototyp lässt sich die Rolle hier umschalten, um die Wirkung zu zeigen. Im Echtbetrieb kommt sie aus dem
          Verzeichnis und wird serverseitig geprüft.
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          @for (option of roles; track option.value) {
            <button
              type="button"
              class="min-h-11 rounded-full px-4 text-sm font-semibold ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              [class]="store.staff().role === option.value ? 'bg-primary-soft text-primary ring-primary/20' : 'text-slate-700 ring-line hover:bg-canvas-alt'"
              (click)="setRole(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </section>

      <div class="flex flex-col gap-5">
        <section class="rounded-2xl bg-canvas p-5 ring-1 ring-line sm:p-6" aria-labelledby="aktivitaet-heading">
          <h2 id="aktivitaet-heading" class="font-bold text-ink">Meine letzten Zugriffe</h2>
          @if (ownEntries().length === 0) {
            <p class="mt-2 text-sm text-muted">Noch keine Zugriffe in dieser Sitzung.</p>
          } @else {
            <ul class="mt-3 flex flex-col gap-3">
              @for (entry of ownEntries(); track entry.id) {
                <li class="text-sm">
                  <p class="font-medium text-ink">{{ entry.target }}</p>
                  <p class="text-xs text-muted tabular-nums">{{ store.formatAuditTime(entry.at) }}</p>
                </li>
              }
            </ul>
          }
          <a routerLink="/protokoll" class="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Vollständiges Protokoll
            <ng-icon name="phosphorArrowRight" size="16" />
          </a>
        </section>

        <section class="rounded-2xl bg-canvas p-5 ring-1 ring-line sm:p-6" aria-labelledby="demo-heading">
          <h2 id="demo-heading" class="font-bold text-ink">Demodaten</h2>
          <p class="mt-2 text-sm text-muted">
            Gewechselte Passwörter, Anheftungen, Notizen und das Protokoll liegen in diesem Browser. Zurücksetzen stellt
            den Auslieferungsstand wieder her.
          </p>
          <button
            type="button"
            class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            (click)="confirmReset.set(true)"
          >
            <ng-icon name="phosphorArrowCounterClockwise" size="17" />
            Demodaten zurücksetzen
          </button>
        </section>
      </div>
    </div>

    <app-dialog
      [open]="confirmReset()"
      heading="Demodaten zurücksetzen"
      subheading="Alle Änderungen in diesem Browser gehen verloren."
      (closed)="confirmReset.set(false)"
    >
      <div class="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          class="min-h-11 rounded-full px-4 text-sm font-semibold text-muted transition-colors hover:bg-canvas-alt hover:text-ink"
          (click)="confirmReset.set(false)"
        >
          Abbrechen
        </button>
        <button
          type="button"
          class="min-h-11 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          (click)="reset()"
        >
          Zurücksetzen
        </button>
      </div>
    </app-dialog>
  `,
})
export class AccountPage {
  protected readonly store = inject(KbStore);
  private readonly toasts = inject(ToastService);

  protected readonly confirmReset = signal(false);
  protected readonly roles = (Object.keys(ROLE_LABEL) as StaffRole[]).map((value) => ({ value, label: ROLE_LABEL[value].label }));
  protected readonly role = computed(() => ROLE_LABEL[this.store.staff().role]);

  protected readonly ownEntries = computed(() =>
    this.store.audit().filter((entry) => entry.user === this.store.staff().name).slice(0, 5),
  );

  protected setRole(role: StaffRole): void {
    this.store.updateStaff({ ...this.store.staff(), role });
    this.toasts.show(`Rolle auf ${ROLE_LABEL[role].label} gestellt.`, 'phosphorUserGear');
  }

  protected reset(): void {
    this.store.reset();
    this.confirmReset.set(false);
    this.toasts.show('Demodaten zurückgesetzt.', 'phosphorArrowCounterClockwise');
  }
}
