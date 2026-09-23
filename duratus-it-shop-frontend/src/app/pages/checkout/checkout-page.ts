import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { productById } from '../../content/catalog';
import { VAT_RATE } from '../../content/company';
import { DELIVERY_OPTIONS, DeliveryId, PAYMENT_METHODS, PaymentId } from '../../content/shop';
import { Address } from '../../data/models';
import { ShopStore } from '../../data/shop-store';
import { EmptyState } from '../../shared/empty-state';
import { euroCents } from '../../shared/format';
import { Crumb, PageHero } from '../../shared/page-hero';
import { ProductImage } from '../../shared/product-image';
import { ToastService } from '../../shared/toast.service';

/** Leasing is only offered from this net goods value upwards. */
const LEASING_FROM = 2500;

@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, RouterLink, NgIcon, PageHero, EmptyState, ProductImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './checkout-page.html',
})
export class CheckoutPage {
  /** ?art=angebot turns the checkout into a quote request. */
  readonly art = input<string>();

  protected readonly store = inject(ShopStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly crumbs: readonly Crumb[] = [{ label: 'Warenkorb', path: '/warenkorb' }, { label: 'Kasse' }];
  protected readonly deliveryOptions = DELIVERY_OPTIONS;
  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly euroCents = euroCents;
  protected readonly steps = [
    { step: 1 as const, label: 'Adresse' },
    { step: 2 as const, label: 'Versand und Zahlung' },
    { step: 3 as const, label: 'Prüfen' },
  ];

  protected readonly productOf = productById;

  protected readonly step = signal<1 | 2 | 3>(1);
  protected readonly submitting = signal(false);
  protected readonly termsAccepted = signal(false);
  protected readonly termsError = signal(false);

  /** A quote is requested explicitly, or forced by a quote-only article in the cart. */
  protected readonly isQuote = computed(() => this.art() === 'angebot' || this.store.hasQuoteOnly());

  protected readonly addressForm = this.fb.group({
    company: ['', [Validators.required, Validators.maxLength(160)]],
    contact: ['', [Validators.required, Validators.maxLength(120)]],
    department: ['', [Validators.maxLength(120)]],
    street: ['', [Validators.required, Validators.maxLength(160)]],
    zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    city: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(40)]],
    billingSame: [true],
    billing: this.fb.group({
      company: ['', [Validators.required, Validators.maxLength(160)]],
      street: ['', [Validators.required, Validators.maxLength(160)]],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      city: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.email]],
    }),
  });

  protected readonly optionsForm = this.fb.group({
    delivery: [this.store.delivery()],
    payment: [this.store.payment()],
    reference: ['', [Validators.maxLength(80)]],
    note: ['', [Validators.maxLength(1000)]],
  });

  protected get billingGroup() {
    return this.addressForm.controls.billing;
  }

  protected readonly shipping = computed(() => this.store.shippingFor(this.optionsForm.controls.delivery.value));
  protected readonly netTotal = computed(() => this.store.goodsNet() + this.shipping());
  protected readonly vat = computed(() => this.netTotal() * VAT_RATE);
  protected readonly grossTotal = computed(() => this.netTotal() + this.vat());

  protected readonly deliveryLabel = computed(
    () => DELIVERY_OPTIONS.find((option) => option.id === this.optionsForm.controls.delivery.value)?.label ?? '',
  );
  protected readonly paymentLabel = computed(
    () => PAYMENT_METHODS.find((method) => method.id === this.optionsForm.controls.payment.value)?.label ?? '',
  );

  protected readonly lead = computed(() =>
    this.isQuote()
      ? 'Sie erhalten das Angebot sofort als PDF. Es ist 14 Tage gültig und kann später in eine Bestellung überführt werden.'
      : 'Drei Schritte: Adresse, Versand und Zahlung, prüfen. Zahlungsdaten fragen wir nicht ab.',
  );

  constructor() {
    // The demo account is prefilled, so the flow can be walked through without typing.
    const customer = this.store.customer();
    this.addressForm.patchValue({
      ...customer.address,
      billingSame: !customer.billing.company,
      billing: {
        company: customer.billing.company,
        street: customer.billing.street,
        zip: customer.billing.zip,
        city: customer.billing.city,
        email: customer.billing.email,
      },
    });
    this.optionsForm.controls.reference.setValue(customer.defaultReference);
    this.syncBillingValidators();
    this.addressForm.controls.billingSame.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.syncBillingValidators());

    // A cart change can drop the order below the leasing threshold; fall back to invoice then.
    effect(() => {
      if (!this.paymentAllowed(this.optionsForm.controls.payment.value)) {
        this.optionsForm.controls.payment.setValue('rechnung');
        this.store.setPayment('rechnung');
      }
    });
  }

  /** Leasing needs a minimum order value. */
  protected paymentAllowed(id: PaymentId): boolean {
    return id !== 'leasing' || this.store.goodsNet() >= LEASING_FROM;
  }

  protected shippingFor(id: DeliveryId): number {
    return this.store.shippingFor(id);
  }

  protected showError(group: AbstractControl, control: string): boolean {
    const c = group.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  protected fieldClass(group: AbstractControl, control: string): string {
    return this.showError(group, control)
      ? 'border-red-500 focus:border-red-600 focus:ring-red-600/15'
      : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/15';
  }

  protected goTo(step: 1 | 2 | 3): void {
    this.step.set(step);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected nextFromAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    this.goTo(2);
  }

  protected nextFromOptions(): void {
    // Keep the choice for the next visit.
    this.store.setDelivery(this.optionsForm.controls.delivery.value);
    this.store.setPayment(this.optionsForm.controls.payment.value);
    this.goTo(3);
  }

  protected async submit(): Promise<void> {
    if (!this.termsAccepted()) {
      this.termsError.set(true);
      return;
    }
    if (this.addressForm.invalid) {
      this.goTo(1);
      this.addressForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    // Simulated round trip, so the loading state can be seen and tested.
    await new Promise((resolve) => setTimeout(resolve, 650));

    const raw = this.addressForm.getRawValue();
    const address: Address = {
      company: raw.company,
      contact: raw.contact,
      street: raw.street,
      zip: raw.zip,
      city: raw.city,
      email: raw.email,
      phone: raw.phone,
      department: raw.department,
    };
    const billing: Address = raw.billingSame
      ? address
      : {
          company: raw.billing.company,
          contact: raw.contact,
          street: raw.billing.street,
          zip: raw.billing.zip,
          city: raw.billing.city,
          email: raw.billing.email || raw.email,
          phone: raw.phone,
          department: '',
        };

    const order = this.store.submit({
      kind: this.isQuote() ? 'angebot' : 'bestellung',
      delivery: this.optionsForm.controls.delivery.value,
      payment: this.optionsForm.controls.payment.value,
      address,
      billing,
      reference: this.optionsForm.controls.reference.value,
      note: this.optionsForm.controls.note.value,
    });

    this.submitting.set(false);
    this.toasts.show(
      order.kind === 'angebot' ? `Angebot ${order.id} erstellt.` : `Bestellung ${order.id} bestätigt.`,
      'phosphorCheckCircle',
    );
    void this.router.navigate(['/bestellungen', order.id], { queryParams: { neu: '1' } });
  }

  /** The billing group only has to be valid while a separate address is used. */
  private syncBillingValidators(): void {
    const same = this.addressForm.controls.billingSame.value;
    if (same) this.billingGroup.disable({ emitEvent: false });
    else this.billingGroup.enable({ emitEvent: false });
  }

  private focusFirstInvalid(): void {
    const fields: [string, string][] = [
      ['company', 'k-company'],
      ['contact', 'k-contact'],
      ['street', 'k-street'],
      ['zip', 'k-zip'],
      ['city', 'k-city'],
      ['email', 'k-email'],
      ['phone', 'k-phone'],
    ];
    const first = fields.find(([name]) => this.addressForm.get(name)?.invalid);
    if (first) {
      document.getElementById(first[1])?.focus();
      return;
    }
    const billingFields: [string, string][] = [
      ['company', 'k-b-company'],
      ['street', 'k-b-street'],
      ['zip', 'k-b-zip'],
      ['city', 'k-b-city'],
    ];
    const firstBilling = billingFields.find(([name]) => this.billingGroup.get(name)?.invalid);
    if (firstBilling) document.getElementById(firstBilling[1])?.focus();
  }
}
