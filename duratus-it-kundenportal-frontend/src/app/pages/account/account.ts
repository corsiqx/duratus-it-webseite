import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../data/auth';
import { NotificationPrefs } from '../../data/models';
import { PortalStore } from '../../data/portal-store';
import { Dialog } from '../../shared/dialog';
import { dateTimeDe, initials } from '../../shared/format';
import { ToastService } from '../../shared/toast.service';

type ProfileField = 'name' | 'email' | 'phone' | 'position';

@Component({
  selector: 'app-account',
  imports: [NgIcon, ReactiveFormsModule, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  templateUrl: './account.html',
})
export class AccountPage {
  protected readonly store = inject(PortalStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  protected readonly initials = computed(() => initials(this.store.account().name));
  protected readonly signedInSince = computed(() => {
    const session = this.auth.session();
    return session ? dateTimeDe(new Date(session.since)) : '';
  });
  protected readonly sessionEmail = computed(() => this.auth.session()?.email ?? '');

  protected readonly prefOptions: { key: keyof NotificationPrefs; label: string; text: string }[] = [
    { key: 'tickets', label: 'Antworten auf Tickets', text: 'Wenn das Service-Team antwortet oder eine Rückfrage stellt.' },
    { key: 'offers', label: 'Neue Angebote', text: 'Wenn ein Angebot auf Ihre Unterschrift wartet.' },
    { key: 'invoices', label: 'Neue Rechnungen', text: 'Sobald eine Rechnung bereitsteht oder fällig wird.' },
    { key: 'maintenance', label: 'Wartungsfenster', text: 'Vorab-Info zu geplanten Updates und Neustarts.' },
  ];

  protected readonly submitted = signal(false);
  protected readonly resetOpen = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.store.account().name, Validators.required],
    email: [this.store.account().email, [Validators.required, Validators.email]],
    phone: [this.store.account().phone],
    position: [this.store.account().position],
  });

  protected showError(field: ProfileField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (this.submitted() || control.touched);
  }

  protected fieldClass(field: ProfileField): string {
    return this.showError(field)
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/15';
  }

  protected saveProfile(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.store.updateAccount({ ...value, name: value.name.trim(), email: value.email.trim() });
    this.submitted.set(false);
    this.form.markAsPristine();
    this.toasts.show('Ihre Daten wurden gespeichert.');
  }

  protected togglePref(key: keyof NotificationPrefs): void {
    const prefs = this.store.prefs();
    this.store.updatePrefs({ ...prefs, [key]: !prefs[key] });
  }

  protected resetDemo(): void {
    this.store.reset();
    this.form.reset(this.store.account());
    this.resetOpen.set(false);
    this.toasts.show('Die Demodaten wurden zurückgesetzt.', 'phosphorArrowCounterClockwise');
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/anmelden']);
    this.toasts.show('Sie wurden abgemeldet.', 'phosphorSignOut');
  }
}
