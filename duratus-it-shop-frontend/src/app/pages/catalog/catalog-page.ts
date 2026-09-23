import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CATEGORIES, MANUFACTURERS, PRODUCTS, categoryBySlug } from '../../content/catalog';
import { COMPANY, WEBSITE } from '../../content/company';
import {
  SORT_OPTIONS,
  SortKey,
  countByCategory,
  countByManufacturer,
  filterProducts,
  sortProducts,
} from '../../data/catalog-query';
import { Crumb, PageHero } from '../../shared/page-hero';
import { Dialog } from '../../shared/dialog';
import { EmptyState } from '../../shared/empty-state';
import { euro } from '../../shared/format';
import { ProductCard } from '../../shared/product-card';
import { RevealDirective } from '../../shared/reveal.directive';

/**
 * Catalogue listing. Every filter lives in the URL, so a filtered list can be sent to a colleague
 * (same idea as the configurator on the website).
 */
@Component({
  selector: 'app-catalog-page',
  imports: [NgTemplateOutlet, RouterLink, NgIcon, PageHero, ProductCard, EmptyState, Dialog, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './catalog-page.html',
})
export class CatalogPage {
  /** Route parameter. */
  readonly categorySlug = input<string>();
  /** Query parameters, bound by withComponentInputBinding. */
  readonly hersteller = input<string>();
  readonly max = input<string>();
  readonly lager = input<string>();
  readonly kauf = input<string>();
  readonly sortierung = input<string>();
  readonly q = input<string>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly company = COMPANY;
  protected readonly website = WEBSITE;
  protected readonly categories = CATEGORIES;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly totalCount = PRODUCTS.length;
  protected readonly categoryCounts = countByCategory(PRODUCTS);
  protected readonly euro = euro;

  protected readonly filterDialogOpen = signal(false);

  protected readonly category = computed(() => (this.categorySlug() ? categoryBySlug(this.categorySlug()!) : undefined));
  protected readonly categoryId = computed(() => this.category()?.id);

  protected readonly manufacturers = computed(() =>
    (this.hersteller() ?? '')
      .split(',')
      .map((name) => name.trim())
      .filter((name) => MANUFACTURERS.includes(name)),
  );
  protected readonly maxPrice = computed(() => Math.max(0, Number(this.max() ?? 0) || 0));
  protected readonly inStockOnly = computed(() => this.lager() === '1');
  protected readonly buyableOnly = computed(() => this.kauf() === '1');
  protected readonly search = computed(() => this.q() ?? '');
  protected readonly sort = computed<SortKey>(() => {
    const value = this.sortierung();
    return SORT_OPTIONS.some((option) => option.value === value) ? (value as SortKey) : 'empfohlen';
  });

  /** Everything in the chosen category, before the remaining filters; used for the counters. */
  private readonly categoryScope = computed(() =>
    this.categoryId() ? PRODUCTS.filter((product) => product.categoryId === this.categoryId()) : PRODUCTS,
  );

  protected readonly results = computed(() =>
    sortProducts(
      filterProducts({
        categoryId: this.categoryId(),
        manufacturers: this.manufacturers(),
        maxPrice: this.maxPrice(),
        inStockOnly: this.inStockOnly(),
        buyableOnly: this.buyableOnly(),
        search: this.search(),
      }),
      this.sort(),
    ),
  );

  protected readonly inStockCount = computed(() => this.results().filter((product) => product.availability === 'lager').length);
  protected readonly manufacturerCounts = computed(() => countByManufacturer(this.categoryScope()));
  protected readonly manufacturerOptions = computed(() =>
    MANUFACTURERS.filter((name) => (this.manufacturerCounts()[name] ?? 0) > 0 || this.manufacturers().includes(name)),
  );

  /** Slider bounds, rounded so the handle lands on sensible values. */
  protected readonly priceBounds = computed(() => {
    const prices = this.categoryScope().map((product) => product.price);
    return {
      min: 0,
      max: Math.ceil(Math.max(...prices, 100) / 50) * 50,
    };
  });

  protected readonly activeFilterCount = computed(
    () =>
      this.manufacturers().length +
      (this.maxPrice() > 0 ? 1 : 0) +
      (this.inStockOnly() ? 1 : 0) +
      (this.buyableOnly() ? 1 : 0) +
      (this.search() ? 1 : 0),
  );

  protected readonly activeChips = computed(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (this.search()) chips.push({ label: `Suche: ${this.search()}`, clear: () => this.patch({ q: null }) });
    for (const name of this.manufacturers()) chips.push({ label: name, clear: () => this.toggleManufacturer(name) });
    if (this.maxPrice() > 0) chips.push({ label: `bis ${euro(this.maxPrice())}`, clear: () => this.patch({ max: null }) });
    if (this.inStockOnly()) chips.push({ label: 'Nur ab Lager', clear: () => this.patch({ lager: null }) });
    if (this.buyableOnly()) chips.push({ label: 'Ohne Angebotsartikel', clear: () => this.patch({ kauf: null }) });
    return chips;
  });

  protected readonly heading = computed(() => this.category()?.name ?? 'Alle Artikel');
  protected readonly lead = computed(() => this.category()?.text ?? 'Der vollständige Katalog, filterbar nach Kategorie, Hersteller, Preis und Verfügbarkeit.');
  protected readonly crumbs = computed<readonly Crumb[]>(() =>
    this.category() ? [{ label: 'Katalog', path: '/katalog' }, { label: this.category()!.name }] : [{ label: 'Katalog' }],
  );

  /** Filters that survive a category switch (the category link keeps them). */
  protected readonly keptQueryParams = computed<Params>(() => ({
    hersteller: this.hersteller() || null,
    lager: this.lager() || null,
    kauf: this.kauf() || null,
    sortierung: this.sortierung() || null,
    q: this.q() || null,
  }));

  protected toggleManufacturer(name: string): void {
    const next = this.manufacturers().includes(name)
      ? this.manufacturers().filter((entry) => entry !== name)
      : [...this.manufacturers(), name];
    this.patch({ hersteller: next.length ? next.join(',') : null });
  }

  protected toggleInStock(): void {
    this.patch({ lager: this.inStockOnly() ? null : '1' });
  }

  protected toggleBuyable(): void {
    this.patch({ kauf: this.buyableOnly() ? null : '1' });
  }

  protected onMaxPrice(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.patch({ max: value >= this.priceBounds().max ? null : String(value) });
  }

  protected onSort(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.patch({ sortierung: value === 'empfohlen' ? null : value });
  }

  protected resetFilters(): void {
    this.patch({ hersteller: null, max: null, lager: null, kauf: null, q: null });
  }

  /** Writes filter state into the URL; null removes a parameter. */
  private patch(params: Params): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: params, queryParamsHandling: 'merge' });
  }
}
