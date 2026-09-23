import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { PaymentMethod } from '../../data/models';
import { PortalStore } from '../../data/portal-store';
import { ToastService } from '../../shared/toast.service';

type Field = 'company' | 'street' | 'zipCity' | 'email' | 'iban';

/** German IBAN: DE + 20 digits, spaces allowed. Only checked when SEPA direct debit is selected. */
function ibanRequiredForSepa(group: AbstractControl): ValidationErrors | null {
  if (group.get('paymentMethod')?.value !== 'sepa') return null;
  const iban = String(group.get('iban')?.value ?? '').replace(/\s/g, '').toUpperCase();
  return /^DE\d{20}$/.test(iban) ? null : { iban: true };
}

@Component({
  selector: 'app-billing',
  imports: [NgIcon, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  templateUrl: './billing.html',
})
export class Billing {
  private readonly store = inject(PortalStore);
  private readonly toasts = inject(ToastService);
  private readonly fields = viewChildren<ElementRef<HTMLInputElement>>('field');

  protected readonly submitted = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      company: [this.store.billing().company, Validators.required],
      street: [this.store.billing().street, Validators.required],
      zipCity: [this.store.billing().zipCity, Validators.required],
      email: [this.store.billing().email, [Validators.required, Validators.email]],
      paymentMethod: [this.store.billing().paymentMethod as PaymentMethod],
      iban: [this.store.billing().iban],
    },
    { validators: ibanRequiredForSepa },
  );

  protected readonly paymentMethod = toSignal(this.form.controls.paymentMethod.valueChanges, {
    initialValue: this.form.controls.paymentMethod.value,
  });

  protected showError(field: Field): boolean {
    const control = this.form.controls[field];
    const invalid = field === 'iban' ? this.form.hasError('iban') : control.invalid;
    return invalid && (this.submitted() || control.touched);
  }

  protected fieldClass(field: Field): string {
    return this.showError(field)
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/15';
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      // Inputs are queried in DOM order, so this focuses the first invalid field.
      this.fields()
        .find((ref) => this.showError(ref.nativeElement.name as Field))
        ?.nativeElement.focus();
      return;
    }
    const value = this.form.getRawValue();
    this.store.updateBilling({ ...value, iban: value.iban.replace(/\s/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim() });
    this.form.markAsPristine();
    this.submitted.set(false);
    this.toasts.show('Zahlungsinformationen wurden gespeichert.');
  }
}
