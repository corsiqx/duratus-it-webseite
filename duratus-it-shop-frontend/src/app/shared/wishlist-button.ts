import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Product } from '../content/catalog';
import { ShopStore } from '../data/shop-store';
import { ToastService } from './toast.service';

/** Toggles an article on the wish list. The state is announced, not only shown as a filled icon. */
@Component({
  selector: 'app-wishlist-button',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <button
      type="button"
      class="flex size-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-primary"
      [class]="
        active()
          ? 'bg-primary-soft text-primary hover:bg-blue-100'
          : 'text-slate-400 hover:bg-canvas-alt hover:text-ink'
      "
      [attr.aria-pressed]="active()"
      (click)="toggle($event)"
    >
      <ng-icon [name]="active() ? 'phosphorBookmarkSimpleFill' : 'phosphorBookmarkSimple'" size="20" />
      <span class="sr-only">{{ active() ? 'Von der Merkliste entfernen' : 'Auf die Merkliste' }}</span>
    </button>
  `,
})
export class WishlistButton {
  readonly product = input.required<Product>();

  private readonly store = inject(ShopStore);
  private readonly toasts = inject(ToastService);

  protected readonly active = computed(() => this.store.wishlistIds().includes(this.product().id));

  protected toggle(event: Event): void {
    // The button often sits inside a card that is itself a link.
    event.preventDefault();
    event.stopPropagation();
    const added = this.store.toggleWishlist(this.product().id);
    this.toasts.show(
      added ? `${this.product().name} ist auf der Merkliste.` : `${this.product().name} von der Merkliste entfernt.`,
      added ? 'phosphorBookmarkSimple' : 'phosphorCheckCircle',
    );
  }
}
