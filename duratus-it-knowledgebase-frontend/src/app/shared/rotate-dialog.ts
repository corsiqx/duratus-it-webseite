import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Secret } from '../data/models';
import { strengthOf, suggestPassword } from '../data/secret-rules';
import { Tone } from '../data/status';
import { CopyButton } from './copy-button';
import { Dialog } from './dialog';

const BAR: Record<number, string> = { 0: 'w-0', 1: 'w-1/3 bg-red-500', 2: 'w-2/3 bg-amber-500', 3: 'w-full bg-teal-600' };

const TONE_TEXT: Record<Tone, string> = {
  critical: 'text-red-700',
  warning: 'text-amber-700',
  good: 'text-teal-700',
  info: 'text-blue-700',
  neutral: 'text-muted',
};

/**
 * Sets a new password for a vault entry. The demo only stores the value locally; in the real system this step
 * would also change it on the device itself, which is why the checklist below stays visible.
 */
@Component({
  selector: 'app-rotate-dialog',
  imports: [Dialog, NgIcon, CopyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog
      [open]="secret() !== null"
      heading="Passwort wechseln"
      [subheading]="secret()?.name ?? ''"
      (closed)="closed.emit()"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label for="new-password" class="block text-sm font-medium text-ink">Neues Passwort</label>
          <div class="mt-1.5 flex gap-2">
            <input
              id="new-password"
              type="text"
              class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-canvas px-3.5 font-mono text-base text-ink transition outline-none hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:text-sm"
              [value]="value()"
              (input)="value.set($any($event.target).value)"
            />
            <button
              type="button"
              class="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              (click)="value.set(suggest())"
            >
              <ng-icon name="phosphorArrowsClockwise" size="16" />
              <span class="sr-only sm:not-sr-only">Vorschlag</span>
            </button>
          </div>
          <p class="mt-2 flex items-center gap-2 text-xs">
            <span class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
              <span class="block h-full rounded-full" [class]="bar()"></span>
            </span>
            <span class="font-semibold" [class]="tone()">{{ strength().label }}</span>
            <span class="text-muted">{{ strength().reason }}</span>
          </p>
        </div>

        <div class="rounded-xl bg-canvas-alt p-3.5 text-sm ring-1 ring-line">
          <p class="font-semibold text-ink">Nicht vergessen</p>
          <ul class="mt-2 flex flex-col gap-1.5 text-muted">
            <li class="flex gap-2"><ng-icon name="phosphorCheck" size="15" class="mt-0.5 shrink-0 text-teal-600" /> Passwort auf dem Gerät selbst ändern, nicht nur hier.</li>
            <li class="flex gap-2"><ng-icon name="phosphorCheck" size="15" class="mt-0.5 shrink-0 text-teal-600" /> Abhängige Dienste und Skripte prüfen, die das Konto nutzen.</li>
            <li class="flex gap-2"><ng-icon name="phosphorCheck" size="15" class="mt-0.5 shrink-0 text-teal-600" /> Danach einmal anmelden und den Zugang testen.</li>
          </ul>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <app-copy-button [value]="value()" label="Neues Passwort kopieren" />
          <button
            type="button"
            class="min-h-11 rounded-full px-4 text-sm font-semibold text-muted transition-colors hover:bg-canvas-alt hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            (click)="closed.emit()"
          >
            Abbrechen
          </button>
          <button
            type="button"
            class="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:opacity-60"
            [disabled]="value().trim().length < 8"
            (click)="saved.emit(value().trim())"
          >
            Übernehmen
          </button>
        </div>
      </div>
    </app-dialog>
  `,
})
export class RotateDialog {
  readonly secret = input<Secret | null>(null);
  /** Pre-filled suggestion from the parent, so the value does not change on every render. */
  readonly initial = input('');
  readonly saved = output<string>();
  readonly closed = output<void>();

  protected readonly value = signal('');
  protected readonly strength = computed(() => strengthOf(this.value()));
  protected readonly bar = computed(() => BAR[this.strength().score]);
  protected readonly tone = computed(() => TONE_TEXT[this.strength().tone]);

  constructor() {
    // Every time the dialog opens for another entry it starts with a fresh suggestion.
    effect(() => {
      if (this.secret()) this.value.set(this.initial() || suggestPassword());
    });
  }

  protected suggest(): string {
    return suggestPassword();
  }
}
