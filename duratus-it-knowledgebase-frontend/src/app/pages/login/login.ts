import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService, safeReturnUrl } from '../../data/auth';
import { DEMO_STAFF } from '../../data/demo/customers';
import { KbStore } from '../../data/kb-store';
import { BrandMark } from '../../shared/brand-mark';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-login',
  imports: [NgIcon, BrandMark, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="grid min-h-dvh lg:grid-cols-2">
      <!-- Linke Spalte: Anmeldung -->
      <div class="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div class="mx-auto w-full max-w-sm">
          <app-brand-mark />
          <h1 class="mt-8 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Interne Wissensdatenbank</h1>
          <p class="mt-2 text-sm text-muted">
            Kundenakten, Zugänge, Netzwerkpläne und Dokumentation. Nur für Beschäftigte von Duratus IT.
          </p>

          <form class="mt-8 flex flex-col gap-4" novalidate (ngSubmit)="submit()" [formGroup]="form">
            <div>
              <label for="email" class="block text-sm font-medium text-ink">Dienstliche E-Mail-Adresse</label>
              <input
                #emailInput
                id="email"
                type="email"
                formControlName="email"
                autocomplete="username"
                placeholder="vorname.nachname@duratus-it.de"
                class="mt-1.5 min-h-11 w-full rounded-lg border bg-canvas px-3.5 text-base text-ink transition outline-none placeholder:text-slate-400 focus:ring-4 sm:text-sm"
                [class]="fieldClass('email')"
                [attr.aria-invalid]="showError('email')"
                [attr.aria-describedby]="showError('email') ? 'email-error' : null"
              />
              @if (showError('email')) {
                <p id="email-error" class="mt-1.5 text-sm text-red-700">Bitte eine gültige E-Mail-Adresse eingeben.</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-ink">Passwort</label>
              <div class="relative mt-1.5">
                <input
                  #passwordInput
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  class="min-h-11 w-full rounded-lg border bg-canvas py-2 pr-12 pl-3.5 text-base text-ink transition outline-none focus:ring-4 sm:text-sm"
                  [class]="fieldClass('password')"
                  [attr.aria-invalid]="showError('password')"
                  [attr.aria-describedby]="showError('password') ? 'password-error' : null"
                />
                <button
                  type="button"
                  class="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
                  (click)="showPassword.set(!showPassword())"
                >
                  <ng-icon [name]="showPassword() ? 'phosphorEyeSlash' : 'phosphorEye'" size="18" />
                  <span class="sr-only">Passwort {{ showPassword() ? 'verbergen' : 'anzeigen' }}</span>
                </button>
              </div>
              @if (showError('password')) {
                <p id="password-error" class="mt-1.5 text-sm text-red-700">Mindestens 8 Zeichen.</p>
              }
            </div>

            <button
              type="submit"
              class="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:opacity-70"
              [disabled]="busy()"
            >
              @if (busy()) {
                <ng-icon name="phosphorCircleNotch" size="18" class="animate-spin" />
                Anmeldung läuft
              } @else {
                Anmelden
              }
            </button>
          </form>

          <div class="mt-6 rounded-2xl bg-canvas-alt p-4 ring-1 ring-line">
            <p class="text-sm font-semibold text-ink">Demo ohne Anmeldung</p>
            <p class="mt-1 text-sm text-muted">
              Diese Oberfläche ist ein Prototyp mit erfundenen Daten. Es gibt noch keine echte Anmeldung.
            </p>
            <button
              type="button"
              class="mt-3 flex min-h-11 items-center gap-2 rounded-full bg-night px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              [disabled]="busy()"
              (click)="useDemo()"
            >
              <ng-icon name="phosphorSignIn" size="17" />
              Als {{ demo.name }} anmelden
            </button>
          </div>

          <p class="mt-6 flex items-start gap-2 text-xs text-muted">
            <ng-icon name="phosphorLockKey" size="16" class="mt-0.5 shrink-0" />
            <span>Vor dem Echtbetrieb: Anmeldung über Microsoft Entra ID mit zweitem Faktor, Rollen serverseitig geprüft.</span>
          </p>
        </div>
      </div>

      <!-- Rechte Spalte: worum es geht -->
      <div class="relative hidden flex-col justify-center bg-night px-16 py-12 text-white lg:flex">
        <div class="relative max-w-md">
          <p class="text-xs font-semibold tracking-wider text-teal-300 uppercase">Ein Ort für alles</p>
          <p class="mt-3 text-2xl font-bold tracking-tight">Wer den Kunden nicht kennt, findet hier trotzdem alles.</p>
          <ul class="mt-8 flex flex-col gap-4">
            @for (feature of features; track feature.text) {
              <li class="flex items-start gap-3">
                <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-300">
                  <ng-icon [name]="feature.icon" size="20" />
                </span>
                <span class="pt-2 text-sm text-slate-300">{{ feature.text }}</span>
              </li>
            }
          </ul>
          <p class="mt-10 border-t border-white/10 pt-5 text-xs text-slate-400">
            Jeder Zugriff auf ein Passwort wird protokolliert. Das ist gewollt und schützt am Ende auch Sie.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly store = inject(KbStore);

  /** Return target from the guard (?ziel=/zugaenge). */
  readonly ziel = input<string>();

  protected readonly demo = DEMO_STAFF;
  protected readonly features = [
    { icon: 'phosphorBuildings', text: 'Kundenakte mit Ansprechpartnern, Standorten und Zugangswegen' },
    { icon: 'phosphorKey', text: 'Zugänge im Tresor, verdeckt und protokolliert' },
    { icon: 'phosphorTreeStructure', text: 'Netzwerkpläne mit VLANs, Firewall-Regeln und VPN' },
    { icon: 'phosphorClipboardText', text: 'Jede Tätigkeit an der Infrastruktur nachvollziehbar dokumentiert' },
    { icon: 'phosphorSiren', text: 'Notfallpläne mit Eskalationskette und Wiederanlaufreihenfolge' },
  ];

  protected readonly submitted = signal(false);
  protected readonly busy = signal(false);
  protected readonly showPassword = signal(false);

  private readonly emailInput = viewChild.required<ElementRef<HTMLInputElement>>('emailInput');
  private readonly passwordInput = viewChild.required<ElementRef<HTMLInputElement>>('passwordInput');

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected showError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (this.submitted() || control.touched);
  }

  protected fieldClass(field: 'email' | 'password'): string {
    return this.showError(field)
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/15';
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) {
      (this.form.controls.email.invalid ? this.emailInput() : this.passwordInput()).nativeElement.focus();
      return;
    }
    await this.signIn(this.form.getRawValue().email);
  }

  protected async useDemo(): Promise<void> {
    await this.signIn(this.demo.email);
  }

  private async signIn(email: string): Promise<void> {
    this.busy.set(true);
    try {
      await this.auth.login(email);
      await this.router.navigateByUrl(safeReturnUrl(this.ziel()));
      this.toasts.show(`Willkommen, ${this.store.staff().name}.`, 'phosphorCheckCircle');
    } finally {
      this.busy.set(false);
    }
  }
}
