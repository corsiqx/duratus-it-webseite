import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { filter } from 'rxjs';
import { CATEGORIES } from '../content/catalog';
import { filterProducts, sortProducts } from '../data/catalog-query';
import { ShopStore, priceIn } from '../data/shop-store';
import { BrandMark } from '../shared/brand-mark';
import { ProductImage } from '../shared/product-image';
import { euroCents } from '../shared/format';

/** Sticky shop chrome: search with suggestions, wish list, cart, the category row and the phone menu. */
@Component({
  selector: 'app-shop-header',
  imports: [RouterLink, RouterLinkActive, NgIcon, BrandMark, ProductImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'sticky top-0 z-40 block [view-transition-name:shop-header]',
    '(document:keydown.escape)': 'closeAll()',
  },
  templateUrl: './shop-header.html',
})
export class ShopHeader {
  protected readonly store = inject(ShopStore);
  private readonly router = inject(Router);

  protected readonly categories = CATEGORIES;
  protected readonly accountNav = [
    { label: 'Warenkorb', path: '/warenkorb', icon: 'phosphorShoppingCartSimple' },
    { label: 'Merkliste', path: '/merkliste', icon: 'phosphorBookmarkSimple' },
    { label: 'Bestellungen', path: '/bestellungen', icon: 'phosphorPackage' },
    { label: 'Mein Konto', path: '/konto', icon: 'phosphorUserCircle' },
    { label: 'Versand und Zahlung', path: '/versand-und-zahlung', icon: 'phosphorTruck' },
    { label: 'Fragen und Antworten', path: '/fragen', icon: 'phosphorQuestion' },
  ];

  protected readonly query = signal('');
  protected readonly menuOpen = signal(false);
  protected readonly mobileSearchOpen = signal(false);
  private readonly suggestionsRequested = signal(false);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly mobileSearchInput = viewChild<ElementRef<HTMLInputElement>>('mobileSearchInput');
  private readonly suggestionList = viewChild<ElementRef<HTMLElement>>('suggestionList');

  /** All matches for the current query, sorted by recommendation. */
  private readonly matches = computed(() =>
    this.query().trim().length < 2 ? [] : sortProducts(filterProducts({ manufacturers: [], maxPrice: 0, inStockOnly: false, buyableOnly: false, search: this.query() }), 'empfohlen'),
  );

  protected readonly suggestions = computed(() => this.matches().slice(0, 6));
  protected readonly matchCount = computed(() => this.matches().length);
  protected readonly suggestionsOpen = computed(() => this.suggestionsRequested() && this.query().trim().length >= 2);

  protected readonly cartTotalText = computed(() =>
    euroCents(priceIn(this.store.priceMode(), this.store.goodsNet() + this.store.monthlyNet())),
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeAll());

    // Opening the phone search should put the cursor in the field right away.
    effect(() => {
      if (this.mobileSearchOpen()) setTimeout(() => this.mobileSearchInput()?.nativeElement.focus());
    });
  }

  protected priceText(net: number): string {
    return euroCents(priceIn(this.store.priceMode(), net));
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.suggestionsRequested.set(true);
  }

  protected clearQuery(): void {
    this.query.set('');
    this.suggestionsRequested.set(false);
    this.searchInput()?.nativeElement.focus();
  }

  protected closeSuggestions(): void {
    this.suggestionsRequested.set(false);
  }

  /** Enter opens the full result list; arrow down moves into the suggestions. */
  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.openSearchPage();
      return;
    }
    if (event.key === 'ArrowDown' && this.suggestionsOpen()) {
      event.preventDefault();
      this.suggestionList()?.nativeElement.querySelector<HTMLAnchorElement>('a')?.focus();
    }
  }

  protected onSearchFocusOut(event: FocusEvent, container: HTMLElement): void {
    if (!container.contains(event.relatedTarget as Node | null)) this.closeSuggestions();
  }

  protected submitMobileSearch(event: Event): void {
    event.preventDefault();
    this.openSearchPage();
  }

  private openSearchPage(): void {
    const q = this.query().trim();
    if (!q) return;
    void this.router.navigate(['/suche'], { queryParams: { q } });
  }

  protected closeAll(): void {
    this.menuOpen.set(false);
    this.mobileSearchOpen.set(false);
    this.closeSuggestions();
  }
}
