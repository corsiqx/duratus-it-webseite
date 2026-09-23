import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { COMPANY } from '../../content/company';
import { AuthService, safeReturnUrl } from '../../data/auth';
import { DEMO_ACCOUNT } from '../../data/mock-data';
import { PortalStore } from '../../data/portal-store';
import { BrandMark } from '../../shared/brand-mark';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-login',
  imports: [NgIcon, BrandMark, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  host: { class: 'block' },
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly store = inject(PortalStore);

  /** Return target from the guard (?ziel=/tickets). */
  readonly ziel = input<string>();

  protected readonly company = COMPANY;
  protected readonly features = [
    { icon: 'phosphorLifebuoy', text: 'Tickets anlegen und den Verlauf mitverfolgen' },
    { icon: 'phosphorSignature', text: 'Angebote prüfen und digital unterschreiben' },
    { icon: 'phosphorReceipt', text: 'Rechnungen und Verträge jederzeit abrufen' },
    { icon: 'phosphorDesktop', text: 'Status von Backup, Updates und Geräten sehen' },
  ];

  protected readonly submitted = signal(false);
  protected readonly busy = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showHelp = signal(false);

  private readonly emailInput = viewChild.required<ElementRef<HTMLInputElement>>('emailInput');
  private readonly passwordInput = viewChild.required<ElementRef<HTMLInputElement>>('passwordInput');

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false],
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
    const { email, remember } = this.form.getRawValue();
    await this.signIn(email, remember);
  }

  /** One-click access to the demo account without typing credentials. */
  protected async useDemo(): Promise<void> {
    await this.signIn(DEMO_ACCOUNT.email, false);
  }

  private async signIn(email: string, remember: boolean): Promise<void> {
    this.busy.set(true);
    try {
      await this.auth.login(email, remember);
      await this.router.navigateByUrl(safeReturnUrl(this.ziel()));
      this.toasts.show(`Willkommen zurück, ${this.store.account().name}.`, 'phosphorCheckCircle');
    } finally {
      this.busy.set(false);
    }
  }
}
