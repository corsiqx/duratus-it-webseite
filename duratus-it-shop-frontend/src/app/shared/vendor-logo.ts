import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { vendorById } from '../content/vendors';

/**
 * Manufacturer logo where the brand name used to stand. Local SVG files, no remote logos.
 * Brands without a logo file in the repo (the complementary ones) keep the name as a text mark.
 */
@Component({
  selector: 'app-vendor-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-w-0 items-center' },
  template: `
    @if (vendor(); as brand) {
      @if (brand.logo) {
        <img
          [src]="brand.logo"
          [alt]="brand.name"
          [class]="imageClass()"
          loading="lazy"
          decoding="async"
        />
        @if (brand.showName) {
          <span class="ml-2 truncate text-xs font-semibold tracking-wide text-muted uppercase">{{ brand.name }}</span>
        }
      } @else {
        <span class="truncate text-xs font-semibold tracking-wide text-muted uppercase">{{ brand.name }}</span>
      }
    }
  `,
})
export class VendorLogo {
  readonly vendorId = input.required<string>();
  /** `card` sits on a product tile, `detail` is the larger version on the article page. */
  readonly size = input<'card' | 'detail'>('card');

  protected readonly vendor = computed(() => vendorById(this.vendorId()));

  protected readonly imageClass = computed(() => {
    const brand = this.vendor();
    if (!brand) return '';
    const height = this.size() === 'detail' ? brand.stripHeight : brand.cardHeight;
    // Grey by default so a wall of colourful logos does not fight the product photos.
    return `${height} w-auto max-w-[8rem] object-contain object-left opacity-75 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0`;
  });
}
