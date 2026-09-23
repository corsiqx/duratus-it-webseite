import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../data/kb-store';
import { Secret } from '../data/models';
import { daysUntilRotation, maskOf, rotationDue, strengthOf } from '../data/secret-rules';
import { SECRET_CATEGORY, SECRET_SCOPE, Tone, dueLabel } from '../data/status';
import { CopyButton } from './copy-button';
import { StatusBadge } from './status-badge';

const STRENGTH_BAR: Record<number, string> = { 1: 'w-1/3 bg-red-500', 2: 'w-2/3 bg-amber-500', 3: 'w-full bg-teal-600' };

const TONE_TEXT: Record<Tone, string> = {
  critical: 'text-red-700',
  warning: 'text-amber-700',
  good: 'text-teal-700',
  info: 'text-blue-700',
  neutral: 'text-muted',
};

/**
 * One vault entry. The password stays masked until it is opened on purpose, hides itself again after 30 seconds
 * and every access is written to the log. Entries marked "Vier Augen" ask for a confirmation first.
 */
@Component({
  selector: 'app-secret-card',
  imports: [NgIcon, RouterLink, CopyButton, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    <article class="rounded-2xl bg-canvas p-4 ring-1 ring-line transition hover:ring-slate-300 sm:p-5">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-alt text-slate-500">
          <ng-icon [name]="category().icon" size="20" />
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-ink">{{ secret().name }}</h3>
          <p class="mt-0.5 text-xs text-muted">
            {{ category().label }}
            @if (showCustomer()) {
              · <a [routerLink]="['/kunden', secret().customerId]" class="underline decoration-slate-300 underline-offset-2 hover:text-primary">{{ customerName() }}</a>
            }
          </p>
        </div>
        <div class="flex shrink-0 flex-col items-end gap-1.5">
          <app-status-badge [status]="scope()" />
          @if (secret().mfa) {
            <span class="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-teal-700">
              <ng-icon name="phosphorShieldCheck" size="14" />
              Zweiter Faktor
            </span>
          }
        </div>
      </div>

      <dl class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="min-w-0">
          <dt class="text-xs font-medium text-muted">Benutzer</dt>
          <dd class="mt-1 flex items-center gap-1">
            <span class="min-w-0 flex-1 truncate font-mono text-sm text-ink">{{ secret().username }}</span>
            <app-copy-button [value]="secret().username" [withLabel]="false" label="Benutzernamen kopieren" />
          </dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs font-medium text-muted">Passwort</dt>
          <dd class="mt-1 flex items-center gap-1">
            <span class="min-w-0 flex-1 truncate font-mono text-sm" [class]="revealed() ? 'text-ink' : 'tracking-widest text-slate-400'">
              {{ revealed() ? secret().password : mask() }}
            </span>
            @if (revealed()) {
              <app-copy-button
                [value]="secret().password"
                [withLabel]="false"
                label="Passwort kopieren"
                toast="Passwort kopiert. Es wird in 30 Sekunden wieder verdeckt."
                (copied)="log('zugang-kopiert')"
              />
            }
            <button
              type="button"
              class="flex size-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-canvas-alt hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              (click)="toggle()"
            >
              <ng-icon [name]="revealed() ? 'phosphorEyeSlash' : 'phosphorEye'" size="18" />
              <span class="sr-only">{{ revealed() ? 'Passwort verdecken' : 'Passwort anzeigen' }}</span>
            </button>
          </dd>
        </div>
      </dl>

      @if (askConfirm()) {
        <div class="mt-3 rounded-xl bg-amber-50 p-3 text-sm ring-1 ring-amber-600/20">
          <p class="font-semibold text-amber-900">Vier-Augen-Prinzip</p>
          <p class="mt-1 text-amber-900/90">{{ scopeHint() }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              class="min-h-11 rounded-full bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
              (click)="confirmReveal()"
            >
              Eine zweite Person ist dabei, anzeigen
            </button>
            <button
              type="button"
              class="min-h-11 rounded-full px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
              (click)="askConfirm.set(false)"
            >
              Abbrechen
            </button>
          </div>
        </div>
      }

      @if (revealed()) {
        <p class="mt-3 flex items-center gap-1.5 text-xs text-muted" role="status">
          <ng-icon name="phosphorClock" size="14" />
          Wird in {{ secondsLeft() }} Sekunden automatisch verdeckt. Der Zugriff steht im Protokoll.
        </p>
      }

      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-xs">
        <span class="flex items-center gap-1.5">
          <span class="text-muted">Stärke</span>
          <span class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
            <span class="block h-full rounded-full" [class]="strengthBar()"></span>
          </span>
          <span class="font-semibold" [class]="strengthText()">{{ strength().label }}</span>
        </span>
        <span class="text-muted">
          Wechsel: <span class="font-medium text-ink">{{ due() }}</span>
        </span>
        <app-status-badge [status]="dueStatus()" />
        <button
          type="button"
          class="ml-auto flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          (click)="rotate.emit(secret())"
        >
          <ng-icon name="phosphorArrowsClockwise" size="16" />
          Passwort wechseln
        </button>
      </div>

      @if (secret().note || secret().url || asset()) {
        <div class="mt-3 space-y-1.5 text-sm">
          @if (secret().url) {
            <p class="flex items-center gap-1.5 text-muted">
              <ng-icon name="phosphorGlobe" size="15" class="shrink-0" />
              <span class="truncate font-mono text-xs">{{ secret().url }}</span>
            </p>
          }
          @if (asset(); as device) {
            <p class="flex items-center gap-1.5 text-muted">
              <ng-icon name="phosphorHardDrives" size="15" class="shrink-0" />
              <span class="truncate">Gehört zu {{ device.name }} ({{ device.vendor }} {{ device.model }})</span>
            </p>
          }
          @if (secret().note) {
            <p class="text-muted">{{ secret().note }}</p>
          }
        </div>
      }

      @if (secret().tags.length > 0) {
        <ul class="mt-3 flex flex-wrap gap-1.5">
          @for (tag of secret().tags; track tag) {
            <li class="rounded-full bg-canvas-alt px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-line">{{ tag }}</li>
          }
        </ul>
      }
    </article>
  `,
})
export class SecretCard {
  private readonly store = inject(KbStore);

  readonly secret = input.required<Secret>();
  readonly showCustomer = input(true);
  readonly rotate = output<Secret>();

  protected readonly revealed = signal(false);
  protected readonly askConfirm = signal(false);
  protected readonly secondsLeft = signal(30);
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly category = computed(() => SECRET_CATEGORY[this.secret().category]);
  protected readonly scope = computed(() => SECRET_SCOPE[this.secret().scope]);
  protected readonly scopeHint = computed(() => SECRET_SCOPE[this.secret().scope].hint);
  protected readonly mask = computed(() => maskOf(this.secret().password));
  protected readonly strength = computed(() => strengthOf(this.secret().password));
  protected readonly strengthBar = computed(() => STRENGTH_BAR[this.strength().score] ?? 'w-1/3 bg-slate-300');
  protected readonly strengthText = computed(() => TONE_TEXT[this.strength().tone]);
  protected readonly due = computed(() => rotationDue(this.secret()));
  protected readonly dueStatus = computed(() => dueLabel(daysUntilRotation(this.secret()), 30));
  protected readonly customerName = computed(() => this.store.customer(this.secret().customerId)?.name ?? '');
  protected readonly asset = computed(() => (this.secret().assetId ? this.store.asset(this.secret().assetId!) : undefined));

  protected toggle(): void {
    if (this.revealed()) {
      this.hide();
      return;
    }
    if (this.secret().scope === 'vier-augen') {
      this.askConfirm.set(true);
      return;
    }
    this.reveal();
  }

  protected confirmReveal(): void {
    this.askConfirm.set(false);
    this.reveal();
  }

  protected log(action: 'zugang-angezeigt' | 'zugang-kopiert'): void {
    this.store.log(action, `${this.secret().name} (${this.customerName()})`, this.secret().customerId);
  }

  private reveal(): void {
    this.revealed.set(true);
    this.secondsLeft.set(30);
    this.log('zugang-angezeigt');
    this.timer = setInterval(() => {
      this.secondsLeft.update((value) => value - 1);
      if (this.secondsLeft() <= 0) this.hide();
    }, 1000);
  }

  private hide(): void {
    this.revealed.set(false);
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
