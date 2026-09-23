import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Product, icecatRef } from '../content/catalog';
import { IcecatService } from '../data/icecat.service';
import { displayImage, thumbImage } from '../data/icecat.models';

/**
 * Product picture: the manufacturer photo from Icecat when it is there, otherwise the local
 * illustration from `public/artikel`. The illustration is also the fallback if the remote picture
 * fails to load, so a tile never ends up empty.
 *
 * The lookup only starts once the tile comes close to the viewport. A catalogue page has 40 tiles;
 * firing 40 requests before anything is even visible made the first paint crawl.
 */
@Component({
  selector: 'app-product-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <img
      [src]="source()"
      [alt]="alt()"
      [class]="imageClass()"
      loading="lazy"
      decoding="async"
      (error)="remoteFailed.set(true)"
    />
  `,
})
export class ProductImage {
  readonly product = input.required<Product>();
  /** Contain keeps the white manufacturer photos intact; the illustration fills the tile. */
  readonly imageClass = input('size-full object-contain');
  /** Which Icecat size to prefer. */
  readonly prefer = input<'thumb' | 'medium'>('medium');
  /** Skip the viewport check for pictures that are visible right away. */
  readonly eager = input(false);

  private readonly icecat = inject(IcecatService);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  protected readonly remoteFailed = signal(false);
  private readonly inView = signal(false);

  /** Pure read: the service never writes a signal here. */
  private readonly entry = computed(() => this.icecat.entry(icecatRef(this.product())));

  /** Local illustration, always available and shown until a photo has arrived. */
  private readonly fallback = computed(() => `artikel/${this.product().art}.svg`);

  protected readonly source = computed(() => {
    if (this.remoteFailed()) return this.fallback();
    const image = this.entry().product?.image;
    if (!image) return this.fallback();
    const picked = this.prefer() === 'thumb' ? thumbImage(image) : displayImage(image);
    return picked || this.fallback();
  });

  protected readonly alt = computed(() => {
    const product = this.product();
    return `${product.manufacturer} ${product.name}, ${product.subtitle}`;
  });

  constructor() {
    afterNextRender(() => {
      if (this.eager() || typeof IntersectionObserver === 'undefined') {
        this.inView.set(true);
        return;
      }
      const observer = new IntersectionObserver(
        ([item]) => {
          if (!item.isIntersecting) return;
          this.inView.set(true);
          observer.disconnect();
        },
        // Start a little before the tile scrolls in, so the photo is there when it arrives.
        { rootMargin: '300px' },
      );
      observer.observe(this.host);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    // Writing signals is allowed here, unlike in a computed.
    effect(() => {
      if (this.eager() || this.inView()) this.icecat.load(icecatRef(this.product()));
    });

    // A new article in the same component slot deserves a fresh attempt at its picture.
    effect(() => {
      this.product();
      this.remoteFailed.set(false);
    });
  }
}
