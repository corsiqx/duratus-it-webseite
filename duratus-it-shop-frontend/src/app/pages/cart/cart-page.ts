import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FREE_SHIPPING_FROM, VAT_RATE } from '../../content/company';
import { DELIVERY_OPTIONS } from '../../content/shop';
import { productById } from '../../content/catalog';
import { CartLine } from '../../data/models';
import { ShopStore } from '../../data/shop-store';
import { Dialog } from '../../shared/dialog';
import { EmptyState } from '../../shared/empty-state';
import { euroCents } from '../../shared/format';
import { Crumb, PageHero } from '../../shared/page-hero';
import { ProductImage } from '../../shared/product-image';
import { QuantityStepper } from '../../shared/quantity-stepper';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-cart-page',
  imports: [NgTemplateOutlet, RouterLink, NgIcon, PageHero, EmptyState, Dialog, ProductImage, QuantityStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './cart-page.html',
})
export class CartPage {
  protected readonly store = inject(ShopStore);
  private readonly toasts = inject(ToastService);

  protected readonly crumbs: readonly Crumb[] = [{ label: 'Warenkorb' }];
  protected readonly deliveryOptions = DELIVERY_OPTIONS;
  protected readonly euroCents = euroCents;

  protected readonly clearOpen = signal(false);

  /** The cart stores ids; the picture needs the catalogue entry. */
  protected readonly productOf = productById;

  protected readonly oneOffLines = computed(() => this.store.lines().filter((line) => !line.recurring));
  protected readonly recurringLines = computed(() => this.store.lines().filter((line) => line.recurring));

  protected readonly shipping = computed(() => this.store.shippingFor(this.store.delivery()));
  protected readonly netTotal = computed(() => this.store.goodsNet() + this.shipping());
  protected readonly vat = computed(() => this.netTotal() * VAT_RATE);
  protected readonly grossTotal = computed(() => this.netTotal() + this.vat());

  protected readonly deliveryLabel = computed(
    () => DELIVERY_OPTIONS.find((option) => option.id === this.store.delivery())?.label ?? '',
  );

  protected readonly freeShippingProgress = computed(() =>
    Math.min(100, Math.round((this.store.goodsNet() / FREE_SHIPPING_FROM) * 100)),
  );

  protected readonly lead = computed(() => {
    const count = this.store.cartCount();
    if (count === 0) return 'Noch nichts ausgewählt.';
    const positions = this.store.lines().length;
    return `${count} Artikel in ${positions} ${positions === 1 ? 'Position' : 'Positionen'}. Mengen ändern sich sofort im Preis, Staffeln greifen automatisch.`;
  });

  protected remove(line: CartLine): void {
    this.store.remove(line.productId);
    this.toasts.show(`${line.name} entfernt.`, 'phosphorTrash');
  }

  protected moveToWishlist(line: CartLine): void {
    if (!this.store.isOnWishlist(line.productId)) this.store.toggleWishlist(line.productId);
    this.store.remove(line.productId);
    this.toasts.show(`${line.name} auf die Merkliste verschoben.`, 'phosphorBookmarkSimple');
  }

  protected clearCart(): void {
    this.store.clearCart();
    this.clearOpen.set(false);
    this.toasts.show('Warenkorb geleert.', 'phosphorTrash');
  }
}
