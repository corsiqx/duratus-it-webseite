import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Product } from '../content/catalog';
import { ShopStore } from '../data/shop-store';
import { ToastService } from './toast.service';

/**
 * Puts an article into the cart. Quote-only articles land in the cart as well, but the label says what will
 * happen: at checkout the whole cart turns into a written quote instead of an order.
 */
@Component({
  selector: 'app-add-to-cart',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <button
      type="button"
      class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
      [class]="
        variant() === 'primary'
          ? 'bg-primary text-white hover:bg-primary-hover'
          : 'bg-canvas text-ink ring-1 ring-line hover:bg-canvas-alt'
      "
      (click)="add($event)"
    >
      <ng-icon [name]="product().quoteOnly ? 'phosphorFileText' : 'phosphorShoppingCartSimple'" size="18" />
      {{ label() }}
    </button>
  `,
})
export class AddToCart {
  readonly product = input.required<Product>();
  readonly quantity = input(1);
  readonly variant = input<'primary' | 'quiet'>('primary');
  /** Jump to the cart right after adding (used on the detail page). */
  readonly thenGoToCart = input(false);

  private readonly store = inject(ShopStore);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly label = computed(() => (this.product().quoteOnly ? 'Für Angebot vormerken' : 'In den Warenkorb'));

  protected add(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const quantity = Math.max(1, this.quantity());
    this.store.add(this.product().id, quantity);
    this.toasts.show(
      `${quantity} × ${this.product().name} ${this.product().quoteOnly ? 'für das Angebot vorgemerkt' : 'im Warenkorb'}.`,
      'phosphorShoppingCartSimple',
    );
    if (this.thenGoToCart()) void this.router.navigate(['/warenkorb']);
  }
}
