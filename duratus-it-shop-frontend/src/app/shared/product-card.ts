import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, categoryById } from '../content/catalog';
import { AddToCart } from './add-to-cart';
import { AvailabilityPill } from './availability-pill';
import { Price } from './price';
import { ProductBadges } from './product-badges';
import { ProductImage } from './product-image';
import { VendorLogo } from './vendor-logo';
import { WishlistButton } from './wishlist-button';

/**
 * Product tile for the catalogue and for recommendation rows.
 * The whole tile is one link; the wish list and cart buttons stop the click from bubbling.
 * Where the brand name used to be written out, the manufacturer logo now sits.
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, AddToCart, AvailabilityPill, Price, ProductBadges, ProductImage, VendorLogo, WishlistButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    <article
      class="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-canvas ring-1 ring-line transition-shadow duration-300 ease-out-expo hover:shadow-[0_18px_40px_-20px_rgb(15_23_42/0.25)]"
    >
      <a [routerLink]="['/artikel', product().slug]" class="flex flex-1 flex-col outline-none">
        <div class="relative aspect-[4/3] overflow-hidden bg-canvas-alt p-4">
          <app-product-image
            [product]="product()"
            class="size-full"
            imageClass="size-full object-contain transition-transform duration-500 ease-out-expo group-hover:scale-[1.04] motion-reduce:transition-none"
          />
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <app-product-badges [badges]="product().badges" />
          </div>
        </div>

        <div class="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <!-- Manufacturer logo where the brand name used to stand. -->
          <div class="flex min-w-0 items-center justify-between gap-3">
            <app-vendor-logo [vendorId]="product().vendorId" class="h-6 shrink-0" />
            <app-availability-pill [product]="product()" />
          </div>

          <div class="min-w-0 flex-1">
            <h3
              class="text-base leading-snug font-bold text-ink transition-colors group-hover:text-primary group-focus-visible:text-primary"
            >
              {{ product().name }}
            </h3>
            <p class="mt-1 text-sm leading-snug text-muted">{{ product().subtitle }}</p>
            <p class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
              @if (categoryName()) {
                <span>{{ categoryName() }}</span>
              }
              @if (product().mpn) {
                <span aria-hidden="true">·</span>
                <span class="font-mono">{{ product().mpn }}</span>
              }
            </p>
          </div>

          <div class="mt-auto">
            <app-price [net]="product().price" [list]="product().listPrice ?? 0" [unit]="product().unit ?? ''" />
            @if (tierHint()) {
              <p class="mt-1 text-xs font-medium text-primary">{{ tierHint() }}</p>
            }
          </div>
        </div>
      </a>

      <div class="flex items-center gap-2 border-t border-line p-4 pt-3 sm:px-5">
        <div class="min-w-0 flex-1">
          <app-add-to-cart [product]="product()" variant="quiet" />
        </div>
        <app-wishlist-button [product]="product()" />
      </div>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Hide the category line inside a category listing. */
  readonly showCategory = input(true);

  // The Icecat lookup is started by <app-product-image>, which also owns the fallback.

  protected readonly categoryName = computed(() =>
    this.showCategory() ? (categoryById(this.product().categoryId)?.name ?? '') : '',
  );

  protected readonly tierHint = computed(() => {
    const first = this.product().tiers?.[0];
    return first ? `ab ${first.qty} Stück günstiger` : '';
  });
}
