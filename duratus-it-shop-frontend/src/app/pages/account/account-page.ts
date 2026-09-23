import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICECAT } from '../../content/icecat';
import { COMPANY, WEBSITE } from '../../content/company';
import { CustomerProfile } from '../../data/models';
import { IcecatService } from '../../data/icecat.service';
import { ShopStore } from '../../data/shop-store';
import { Dialog } from '../../shared/dialog';
import { euroCents } from '../../shared/format';
import { Crumb, PageHero } from '../../shared/page-hero';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-account-page',
  imports: [ReactiveFormsModule, RouterLink, NgIcon, PageHero, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-page-hero
      [crumbs]="crumbs"
      title="Mein Konto"
      lead="Stammdaten für die Kasse, Preisanzeige und die Demodaten dieses Browsers."
    />

    <div class="bg-canvas-alt py-8 sm:py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div class="min-w-0 lg:col-span-8">
            <form [formGroup]="form" (ngSubmit)="save()" novalidate class="flex flex-col gap-6">
              <section class="rounded-2xl bg-canvas p-5 ring-1 ring-line sm:p-6" aria-labelledby="master-heading">
                <h2 id="master-heading" class="text-lg font-bold text-ink">Stammdaten</h2>
                <p class="mt-1 text-sm text-muted">Diese Angaben füllen die Kasse vor. Pflichtfelder sind mit * gekennzeichnet.</p>

                <div class="mt-5 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label for="a-number" class="text-sm font-semibold text-ink">Kundennummer</label>
                    <input id="a-number" type="text" formControlName="customerNumber" class="min-h-12 rounded-lg border border-slate-300 bg-canvas px-4 font-mono text-base text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="a-vat" class="text-sm font-semibold text-ink">USt-IdNr.</label>
                    <input id="a-vat" type="text" formControlName="vatId" class="min-h-12 rounded-lg border border-slate-300 bg-canvas px-4 font-mono text-base text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                  </div>
                  <div class="flex flex-col gap-2 sm:col-span-2">
                    <label for="a-company" class="text-sm font-semibold text-ink">Firma *</label>
                    <input id="a-company" type="text" formControlName="company" [class]="fieldClass('company')" class="min-h-12 rounded-lg border bg-canvas px-4 text-base text-ink outline-none focus:ring-4" />
                    @if (showError('company')) {
                      <p class="text-sm font-medium text-red-600">Bitte geben Sie den Firmennamen an.</p>
                    }
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="a-contact" class="text-sm font-semibold text-ink">Ansprechpartner *</label>
                    <input id="a-contact" type="text" formControlName="contact" [class]="fieldClass('contact')" class="min-h-12 rounded-lg border bg-canvas px-4 text-base text-ink outline-none focus:ring-4" />
                    @if (showError('contact')) {
                      <p class="text-sm font-medium text-red-600">Bitte geben Sie einen Namen an.</p>
                    }
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="a-department" class="text-sm font-semibold text-ink">Abteilung oder Kostenstelle</label>
                    <input id="a-department" type="text" formControlName="department" class="min-h-12 rounded-lg border border-slate-300 bg-canvas px-4 text-base text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                  </div>
                  <div class="flex flex-col gap-2 sm:col-span-2">
                    <label for="a-street" class="text-sm font-semibold text-ink">Straße und Hausnummer *</label>
                    <input id="a-street" type="text" formControlName="street" [class]="fieldClass('street')" class="min-h-12 rounded-lg border bg-canvas px-4 text-base text-ink outline-none focus:ring-4" />
                    @if (showError('street')) {
                      <p class="text-sm font-medium text-red-600">Bitte geben Sie die Straße an.</p>
                    }
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="a-zip" class="text-sm font-semibold text-ink">Postleitzahl *</label>
                    <input id="a-zip" type="text" inputmode="numeric" maxlength="5" formControlName="zip" [class]="fieldClass('zip')" class="min-h-12 rounded-lg border bg-canvas px-4 text-base text-ink outline-none focus:ring-4" />
                    @if (showError('zip')) {
                      <p class="text-sm font-medium text-red-600">Fünf Ziffern, zum Beispiel 48268.</p>
                    }
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="a-city" class="text-sm font-semibold text-ink">Ort *</label>
                    <input id="a-city" type="text" formControlName="city" [class]="fieldClass('city')" class="min-h-12 rounded-lg border bg-canvas px-4 text-base text-ink outline-none focus:ring-4" />
                    @if (showError('city')) {
                      <p class="text-sm font-medium text-red-600">Bitte geben Sie den Ort an.</p>
                    }
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="a-email" class="text-sm font-semibold text-ink">E-Mail Einkauf *</label>
                    <input id="a-email" type="email" formControlName="email" [class]="fieldClass('email')" class="min-h-12 rounded-lg border bg-canvas px-4 text-base text-ink outline-none focus:ring-4" />
                    @if (showError('email')) {
                      <p class="text-sm font-medium text-red-600">Bitte prüfen Sie die E-Mail-Adresse.</p>
                    }
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="a-phone" class="text-sm font-semibold text-ink">Telefon *</label>
                    <input id="a-phone" type="tel" formControlName="phone" [class]="fieldClass('phone')" class="min-h-12 rounded-lg border bg-canvas px-4 text-base text-ink outline-none focus:ring-4" />
                    @if (showError('phone')) {
                      <p class="text-sm font-medium text-red-600">Bitte geben Sie eine Telefonnummer an.</p>
                    }
                  </div>
                  <div class="flex flex-col gap-2 sm:col-span-2">
                    <label for="a-billing-email" class="text-sm font-semibold text-ink">E-Mail Buchhaltung</label>
                    <input id="a-billing-email" type="email" formControlName="billingEmail" class="min-h-12 rounded-lg border border-slate-300 bg-canvas px-4 text-base text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                    <p class="text-xs text-muted">Dorthin gehen Rechnungen, getrennt von Bestellbestätigungen.</p>
                  </div>
                  <div class="flex flex-col gap-2 sm:col-span-2">
                    <label for="a-reference" class="text-sm font-semibold text-ink">Standard-Bestellreferenz</label>
                    <input id="a-reference" type="text" formControlName="defaultReference" class="min-h-12 rounded-lg border border-slate-300 bg-canvas px-4 text-base text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                    <p class="text-xs text-muted">Wird bei jeder Bestellung vorgeschlagen, zum Beispiel eine Kostenstelle.</p>
                  </div>
                </div>

                <div class="mt-6 flex flex-wrap items-center gap-3">
                  <button type="submit" class="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover active:scale-[0.98]">
                    <ng-icon name="phosphorFloppyDisk" size="16" />
                    Stammdaten speichern
                  </button>
                  @if (saved()) {
                    <p class="flex items-center gap-1.5 text-sm font-medium text-teal-700" role="status" aria-live="polite">
                      <ng-icon name="phosphorCheckCircle" size="16" />
                      Gespeichert
                    </p>
                  }
                </div>
              </section>
            </form>
          </div>

          <aside class="lg:col-span-4">
            <div class="flex flex-col gap-4">
              <section class="rounded-2xl bg-canvas p-5 ring-1 ring-line">
                <h2 class="text-sm font-semibold text-ink">Preisanzeige</h2>
                <p class="mt-1 text-xs text-muted">Gilt für den ganzen Shop und bleibt gespeichert.</p>
                <fieldset class="mt-3 flex gap-2">
                  <legend class="sr-only">Preise netto oder brutto anzeigen</legend>
                  @for (mode of priceModes; track mode.value) {
                    <label class="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-semibold ring-1 transition-colors has-checked:bg-primary has-checked:text-white has-checked:ring-primary" [class]="store.priceMode() === mode.value ? 'ring-primary' : 'text-ink ring-line hover:bg-canvas-alt'">
                      <input type="radio" name="preis" class="sr-only" [value]="mode.value" [checked]="store.priceMode() === mode.value" (change)="store.setPriceMode(mode.value)" />
                      {{ mode.label }}
                    </label>
                  }
                </fieldset>
              </section>

              <section class="rounded-2xl bg-canvas p-5 ring-1 ring-line">
                <h2 class="text-sm font-semibold text-ink">Dieser Browser</h2>
                <dl class="mt-3 flex flex-col gap-2 text-sm">
                  @for (row of stats(); track row.label) {
                    <div class="flex items-baseline justify-between gap-4">
                      <dt class="text-muted">{{ row.label }}</dt>
                      <dd class="font-semibold text-ink tabular-nums">{{ row.value }}</dd>
                    </div>
                  }
                </dl>
                <ul class="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-sm">
                  <li><a routerLink="/warenkorb" class="inline-block py-1.5 font-semibold text-primary hover:text-primary-hover">Warenkorb ansehen</a></li>
                  <li><a routerLink="/bestellungen" class="inline-block py-1.5 font-semibold text-primary hover:text-primary-hover">Bestellungen und Angebote</a></li>
                  <li><a routerLink="/merkliste" class="inline-block py-1.5 font-semibold text-primary hover:text-primary-hover">Merkliste</a></li>
                </ul>
              </section>

              <!-- Icecat: manufacturer data straight from the browser. -->
              <section class="rounded-2xl bg-canvas p-5 ring-1 ring-line">
                <h2 class="flex items-center gap-2 text-sm font-semibold text-ink">
                  <ng-icon name="phosphorDatabase" size="16" class="text-primary" />
                  Herstellerdaten (Icecat)
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-muted">
                  Bezeichnung, EAN, Beschreibung und Produktfoto holt der Shop bei Icecat. Ohne Schlüssel funktioniert
                  das nur für die Marken in Open Icecat, hier Dell, APC und Yealink. Für die übrigen Partner braucht es
                  einen Full-Icecat-Zugang.
                </p>

                <dl class="mt-4 grid grid-cols-2 gap-2 text-sm">
                  @for (row of icecatStats(); track row.label) {
                    <div class="rounded-lg bg-canvas-alt px-3 py-2">
                      <dt class="text-xs text-muted">{{ row.label }}</dt>
                      <dd class="font-semibold text-ink tabular-nums">{{ row.value }}</dd>
                    </div>
                  }
                </dl>

                <div class="mt-4 flex flex-col gap-2">
                  <label for="icecat-key" class="text-sm font-semibold text-ink">Full-Icecat app_key</label>
                  <input
                    id="icecat-key"
                    type="text"
                    autocomplete="off"
                    spellcheck="false"
                    class="min-h-12 rounded-lg border border-slate-300 bg-canvas px-4 font-mono text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    placeholder="leer lassen für Open Icecat"
                    [value]="icecat.appKey()"
                    (input)="keyDraft.set($any($event.target).value)"
                  />
                  <p class="text-xs text-muted">
                    Wird nur in diesem Browser gespeichert.
                    <span class="text-amber-700">In einer echten Anwendung gehört der Schlüssel auf den Server</span>,
                    weil er hier für jeden lesbar wäre.
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
                      (click)="saveIcecatKey()"
                    >
                      <ng-icon name="phosphorFloppyDisk" size="16" />
                      Schlüssel speichern
                    </button>
                    <button
                      type="button"
                      class="inline-flex min-h-11 items-center gap-2 rounded-full bg-canvas-alt px-4 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
                      (click)="clearIcecatCache()"
                    >
                      <ng-icon name="phosphorArrowCounterClockwise" size="16" />
                      Zwischenspeicher leeren
                    </button>
                  </div>
                  <a
                    [href]="icecatDocs"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    Icecat-Dokumentation
                    <ng-icon name="phosphorArrowUpRight" size="13" />
                  </a>
                </div>
              </section>

              <section class="rounded-2xl bg-canvas p-5 ring-1 ring-amber-600/25">
                <h2 class="flex items-center gap-2 text-sm font-semibold text-ink">
                  <ng-icon name="phosphorWarningCircle" size="16" class="text-amber-600" />
                  Demo ohne Anmeldung
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-muted">
                  Es gibt keine echte Anmeldung. Warenkorb, Merkliste, Bestellungen und Stammdaten liegen nur in diesem
                  Browser. Mit einer echten Anmeldung kämen Konditionen, Rahmenverträge und Freigaben aus dem ERP.
                </p>
                <button
                  type="button"
                  class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-canvas-alt px-4 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
                  (click)="resetOpen.set(true)"
                >
                  <ng-icon name="phosphorArrowCounterClockwise" size="16" />
                  Demodaten zurücksetzen
                </button>
              </section>

              <section class="rounded-2xl bg-night p-5 text-slate-300">
                <h2 class="font-bold text-white">Rechnungen und Tickets</h2>
                <p class="mt-2 text-sm leading-relaxed">
                  Rechnungen, Verträge, Arbeitsnachweise und der Support liegen im Kundenportal, nicht im Shop.
                </p>
                <a [href]="website.portal" class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15">
                  Kundenportal öffnen
                  <ng-icon name="phosphorArrowUpRight" size="13" class="opacity-70" />
                </a>
              </section>

              <p class="px-1 text-xs text-slate-400">
                Fragen zur Bestellung: <a [href]="'mailto:' + company.shopEmail" class="font-medium text-muted hover:text-ink">{{ company.shopEmail }}</a>
                · {{ company.phone }}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <app-dialog
      [open]="resetOpen()"
      heading="Demodaten zurücksetzen?"
      subheading="Warenkorb, Merkliste, Bestellungen, Angebote und Stammdaten dieses Browsers werden auf den Anfangszustand gesetzt."
      (closed)="resetOpen.set(false)"
    >
      <div class="flex flex-col gap-2 sm:flex-row-reverse">
        <button type="button" class="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700" (click)="reset()">
          <ng-icon name="phosphorArrowCounterClockwise" size="16" />
          Ja, zurücksetzen
        </button>
        <button type="button" class="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-canvas px-5 text-sm font-semibold text-ink ring-1 ring-line transition hover:bg-canvas-alt" (click)="resetOpen.set(false)">
          Abbrechen
        </button>
      </div>
    </app-dialog>
  `,
})
export class AccountPage {
  protected readonly store = inject(ShopStore);
  protected readonly icecat = inject(IcecatService);
  private readonly toasts = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly crumbs: readonly Crumb[] = [{ label: 'Mein Konto' }];
  protected readonly company = COMPANY;
  protected readonly website = WEBSITE;
  protected readonly priceModes = [
    { value: 'netto' as const, label: 'Netto' },
    { value: 'brutto' as const, label: 'Brutto' },
  ];

  protected readonly icecatDocs = ICECAT.docs;
  protected readonly keyDraft = signal('');

  protected readonly icecatStats = computed(() => {
    const stats = this.icecat.stats();
    return [
      { label: 'Daten geladen', value: String(stats.ok) },
      { label: 'Aus dem Zwischenspeicher', value: String(stats.cached) },
      { label: 'Läuft gerade', value: String(stats.loading) },
      { label: 'Zugang gesperrt', value: String(stats.locked) },
      { label: 'Nummer unbekannt', value: String(stats.missing) },
    ];
  });

  protected readonly resetOpen = signal(false);
  protected readonly saved = signal(false);

  protected readonly form = this.fb.group({
    customerNumber: [''],
    vatId: [''],
    company: ['', [Validators.required, Validators.maxLength(160)]],
    contact: ['', [Validators.required, Validators.maxLength(120)]],
    department: ['', [Validators.maxLength(120)]],
    street: ['', [Validators.required, Validators.maxLength(160)]],
    zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    city: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(40)]],
    billingEmail: ['', [Validators.email]],
    defaultReference: ['', [Validators.maxLength(80)]],
  });

  protected readonly stats = computed(() => [
    { label: 'Artikel im Warenkorb', value: String(this.store.cartCount()) },
    { label: 'Warenwert netto', value: euroCents(this.store.goodsNet()) },
    { label: 'Monatlich netto', value: euroCents(this.store.monthlyNet()) },
    { label: 'Merkliste', value: String(this.store.wishlistIds().length) },
    { label: 'Vorgänge', value: String(this.store.orders().length) },
  ]);

  constructor() {
    const customer = this.store.customer();
    this.form.patchValue({
      customerNumber: customer.customerNumber,
      vatId: customer.vatId,
      ...customer.address,
      billingEmail: customer.billing.email,
      defaultReference: customer.defaultReference,
    });
  }

  protected showError(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected fieldClass(control: keyof typeof this.form.controls): string {
    return this.showError(control)
      ? 'border-red-500 focus:border-red-600 focus:ring-red-600/15'
      : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/15';
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const previous = this.store.customer();
    const profile: CustomerProfile = {
      customerNumber: value.customerNumber,
      vatId: value.vatId,
      address: {
        company: value.company,
        contact: value.contact,
        department: value.department,
        street: value.street,
        zip: value.zip,
        city: value.city,
        email: value.email,
        phone: value.phone,
      },
      billing: { ...previous.billing, email: value.billingEmail },
      defaultReference: value.defaultReference,
    };
    this.store.saveCustomer(profile);
    this.saved.set(true);
    this.toasts.show('Stammdaten gespeichert.', 'phosphorFloppyDisk');
    setTimeout(() => this.saved.set(false), 3000);
  }

  protected saveIcecatKey(): void {
    this.icecat.setAppKey(this.keyDraft());
    this.toasts.show(
      this.keyDraft().trim() ? 'Icecat-Schlüssel gespeichert.' : 'Icecat-Schlüssel entfernt.',
      'phosphorFloppyDisk',
    );
  }

  protected clearIcecatCache(): void {
    this.icecat.clearCache();
    this.toasts.show('Icecat-Zwischenspeicher geleert.', 'phosphorArrowCounterClockwise');
  }

  protected reset(): void {
    this.store.resetDemo();
    this.resetOpen.set(false);
    const customer = this.store.customer();
    this.form.patchValue({
      customerNumber: customer.customerNumber,
      vatId: customer.vatId,
      ...customer.address,
      billingEmail: customer.billing.email,
      defaultReference: customer.defaultReference,
    });
    this.toasts.show('Demodaten zurückgesetzt.', 'phosphorArrowCounterClockwise');
  }
}
