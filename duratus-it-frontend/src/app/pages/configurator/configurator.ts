import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  ALL_ADDONS,
  BUNDLE_DISCOUNTS,
  NETWORK_ADDONS,
  ONBOARDING,
  SECURITY_ADDONS,
  SITE_OPTIONS,
  SUPPORT_TIERS,
  SiteKey,
  USER_RANGE,
  VAT_RATE,
} from '../../content/configurator';
import { COMPANY } from '../../content/site';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

const DEFAULT_ADDONS = ['networkGuard'];

@Component({
  selector: 'app-configurator',
  imports: [PageHero, RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './configurator.html',
})
export class Configurator {
  private readonly location = inject(Location);

  /** Configuration is shareable via query parameters (?user=, ?standorte=, ?support=, ?module=). */
  readonly user = input<string>();
  readonly standorte = input<string>();
  readonly support = input<string>();
  readonly module = input<string>();

  protected readonly company = COMPANY;
  protected readonly siteOptions = SITE_OPTIONS;
  protected readonly tiers = SUPPORT_TIERS;
  protected readonly networkAddons = NETWORK_ADDONS;
  protected readonly securityAddons = SECURITY_ADDONS;
  protected readonly range = USER_RANGE;
  protected readonly vatRate = VAT_RATE;

  protected readonly userCount = signal<number>(USER_RANGE.default);
  protected readonly siteKey = signal<SiteKey>('1');
  protected readonly tierId = signal(SUPPORT_TIERS[1].id);
  protected readonly selectedAddons = signal(new Set<string>(DEFAULT_ADDONS));

  /** Optional details that only end up in the generated PDF. */
  protected readonly customerName = signal('');
  protected readonly contactName = signal('');

  protected readonly pdfState = signal<'idle' | 'working' | 'error'>('idle');
  protected readonly copyState = signal<'idle' | 'copied' | 'error'>('idle');

  protected readonly site = computed(() => SITE_OPTIONS.find((o) => o.id === this.siteKey()) ?? SITE_OPTIONS[0]);
  protected readonly tier = computed(() => SUPPORT_TIERS.find((t) => t.id === this.tierId()) ?? SUPPORT_TIERS[1]);

  /** Every add-on with its price for the current site factor and selection state. */
  protected readonly lines = computed(() => {
    const multiplier = this.site().multiplier;
    const selected = this.selectedAddons();
    return ALL_ADDONS.map((addon) => {
      const factor = addon.scalesWithSites ? multiplier : 1;
      return {
        ...addon,
        monthly: addon.monthlyBase * factor,
        setup: addon.setupBase * factor,
        active: selected.has(addon.id),
      };
    });
  });

  protected readonly activeLines = computed(() => this.lines().filter((line) => line.active));

  protected readonly calculation = computed(() => {
    const supportMonthly = this.tier().pricePerUser * this.userCount();
    const active = this.activeLines();
    const addonsMonthly = active.reduce((sum, line) => sum + line.monthly, 0);
    const addonsSetup = active.reduce((sum, line) => sum + line.setup, 0);
    const discountPercent = BUNDLE_DISCOUNTS.find((d) => active.length >= d.minModules)?.percent ?? 0;
    const discountAmount = addonsMonthly * discountPercent;
    const monthlyTotal = supportMonthly + addonsMonthly - discountAmount;
    const onboarding = ONBOARDING.base + this.userCount() * ONBOARDING.perUser;
    const setupTotal = onboarding + addonsSetup;
    return { supportMonthly, addonsMonthly, discountPercent, discountAmount, monthlyTotal, onboarding, setupTotal };
  });

  constructor() {
    // Read a shared configuration from the URL.
    effect(() => {
      const users = Number(this.user());
      if (Number.isFinite(users) && users >= USER_RANGE.min && users <= USER_RANGE.max) {
        this.userCount.set(Math.round(users));
      }
      const site = this.standorte();
      if (site && SITE_OPTIONS.some((o) => o.id === site)) this.siteKey.set(site as SiteKey);
      const tier = this.support();
      if (tier && SUPPORT_TIERS.some((t) => t.id === tier)) this.tierId.set(tier);
      const modules = this.module();
      if (modules !== undefined) {
        const ids = modules.split(',').filter((id) => ALL_ADDONS.some((addon) => addon.id === id));
        this.selectedAddons.set(new Set(ids));
      }
    });

    // Keep the URL in sync without triggering router navigation (and its scroll handling).
    effect(() => {
      const params = new URLSearchParams({
        user: String(this.userCount()),
        standorte: this.siteKey(),
        support: this.tierId(),
      });
      const modules = [...this.selectedAddons()];
      if (modules.length) params.set('module', modules.join(','));
      this.location.replaceState('/konfigurator', params.toString());
      this.copyState.set('idle');
    });
  }

  protected setUserCount(event: Event): void {
    this.userCount.set(Number((event.target as HTMLInputElement).value));
  }

  protected toggleAddon(id: string): void {
    this.selectedAddons.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected isActive(id: string): boolean {
    return this.selectedAddons().has(id);
  }

  /** Priced line for one module, including the site factor. */
  protected lineFor(id: string) {
    return this.lines().find((line) => line.id === id)!;
  }

  protected scrollToSummary(event: Event): void {
    event.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('uebersicht')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  }

  protected euro(value: number): string {
    return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(value))} €`;
  }

  /** Percentage of the slider range, used to paint the filled part of the track. */
  protected readonly sliderPercent = computed(
    () => ((this.userCount() - USER_RANGE.min) / (USER_RANGE.max - USER_RANGE.min)) * 100,
  );

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.copyState.set('copied');
    } catch {
      this.copyState.set('error');
    }
  }

  protected async downloadPdf(): Promise<void> {
    if (this.pdfState() === 'working') return;
    this.pdfState.set('working');
    try {
      // jsPDF is loaded on demand so it never lands in the initial bundle.
      const { createOfferPdf } = await import('./offer-pdf');
      const calc = this.calculation();
      createOfferPdf({
        customerName: this.customerName(),
        contactName: this.contactName(),
        userCount: this.userCount(),
        siteLabel: this.site().label,
        tierName: this.tier().name,
        tierDescription: this.tier().description,
        tierPricePerUser: this.tier().pricePerUser,
        supportMonthly: calc.supportMonthly,
        lines: this.activeLines().map((line) => ({
          name: line.name,
          note: line.scalesWithSites && this.site().multiplier !== 1 ? `Skaliert für ${this.site().label}` : (line.tag ?? ''),
          description: line.description,
          monthly: line.monthly,
          setup: line.setup,
        })),
        onboarding: calc.onboarding,
        discountPercent: calc.discountPercent,
        discountAmount: calc.discountAmount,
        monthlyTotal: calc.monthlyTotal,
        setupTotal: calc.setupTotal,
      });
      this.pdfState.set('idle');
    } catch (error) {
      console.error('PDF konnte nicht erstellt werden.', error);
      this.pdfState.set('error');
    }
  }
}
