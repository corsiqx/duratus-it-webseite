import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { unitPrice } from '../../content/catalog';
import { ShopStore } from '../../data/shop-store';
import { EmptyState } from '../../shared/empty-state';
import { euroCents } from '../../shared/format';
import { Crumb, PageHero } from '../../shared/page-hero';
import { ProductCard } from '../../shared/product-card';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-wishlist-page',
  imports: [RouterLink, NgIcon, PageHero, EmptyState, ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-page-hero
      [crumbs]="crumbs"
      title="Merkliste"
      lead="Artikel für später, zum Abstimmen im Team oder als Vorlage für das nächste Angebot."
    >
      @if (store.wishlist().length) {
        <button
          type="button"
          class="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          (click)="addAll()"
        >
          <ng-icon name="phosphorShoppingCartSimple" size="16" />
          Alle in den Warenkorb
        </button>
      }
    </app-page-hero>

    <div class="bg-canvas-alt py-8 sm:py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        @if (store.wishlist().length === 0) {
          <app-empty-state
            icon="phosphorBookmarkSimple"
            title="Die Merkliste ist leer"
            hint="Das Lesezeichen auf einer Produktkarte legt einen Artikel hier ab, ohne ihn zu bestellen."
          >
            <a
              routerLink="/katalog"
              class="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Zum Katalog
              <ng-icon name="phosphorArrowRight" size="16" />
            </a>
          </app-empty-state>
        } @else {
          <div class="flex flex-wrap items-baseline justify-between gap-3">
            <p class="text-sm text-muted">
              <span class="font-semibold text-ink tabular-nums">{{ store.wishlist().length }}</span>
              {{ store.wishlist().length === 1 ? 'Artikel' : 'Artikel' }} gemerkt
            </p>
            <p class="text-sm text-muted">
              Summe je ein Stück:
              <span class="font-semibold text-ink tabular-nums">{{ euroCents(total()) }}</span>
              netto
            </p>
          </div>

          <ul class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            @for (product of store.wishlist(); track product.id) {
              <li><app-product-card [product]="product" /></li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class WishlistPage {
  protected readonly store = inject(ShopStore);
  private readonly toasts = inject(ToastService);

  protected readonly crumbs: readonly Crumb[] = [{ label: 'Merkliste' }];
  protected readonly euroCents = euroCents;

  protected readonly total = computed(() =>
    this.store.wishlist().reduce((sum, product) => sum + unitPrice(product, 1), 0),
  );

  protected addAll(): void {
    const products = this.store.wishlist();
    for (const product of products) this.store.add(product.id, 1);
    this.toasts.show(`${products.length} Artikel im Warenkorb.`, 'phosphorShoppingCartSimple');
  }
}
