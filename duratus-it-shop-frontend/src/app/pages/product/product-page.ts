import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  SERVICE_LINES,
  categoryById,
  icecatRef,
  isPhysical,
  productBySlug,
  unitPrice,
} from '../../content/catalog';
import { FREE_SHIPPING_FROM, WEBSITE } from '../../content/company';
import { relatedProducts } from '../../data/catalog-query';
import { IcecatService } from '../../data/icecat.service';
import { IcecatImage, displayImage, thumbImage } from '../../data/icecat.models';
import { ShopStore, priceIn } from '../../data/shop-store';
import { AddToCart } from '../../shared/add-to-cart';
import { AvailabilityPill } from '../../shared/availability-pill';
import { EmptyState } from '../../shared/empty-state';
import { euro, euroCents } from '../../shared/format';
import { Price } from '../../shared/price';
import { ProductBadges } from '../../shared/product-badges';
import { ProductCard } from '../../shared/product-card';
import { QuantityStepper } from '../../shared/quantity-stepper';
import { VendorLogo } from '../../shared/vendor-logo';
import { WishlistButton } from '../../shared/wishlist-button';

@Component({
  selector: 'app-product-page',
  imports: [
    RouterLink,
    NgIcon,
    AddToCart,
    AvailabilityPill,
    EmptyState,
    Price,
    ProductBadges,
    ProductCard,
    QuantityStepper,
    VendorLogo,
    WishlistButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './product-page.html',
})
export class ProductPage {
  /** Route parameter. */
  readonly slug = input.required<string>();

  private readonly store = inject(ShopStore);
  private readonly icecat = inject(IcecatService);

  protected readonly website = WEBSITE;
  protected readonly quantity = signal(1);
  protected readonly activeImage = signal(0);
  protected readonly imageFailed = signal(false);

  protected readonly product = computed(() => productBySlug(this.slug()));
  protected readonly category = computed(() => {
    const product = this.product();
    return product ? categoryById(product.categoryId) : undefined;
  });
  protected readonly serviceLine = computed(() => {
    const category = this.category();
    return category ? SERVICE_LINES[category.serviceId] : undefined;
  });
  protected readonly related = computed(() => {
    const product = this.product();
    return product ? relatedProducts(product) : [];
  });

  // ---------------------------------------------------------------- Icecat

  /** Pure read; the lookup itself is started in the constructor effect below. */
  private readonly entry = computed(() => {
    const product = this.product();
    return this.icecat.entry(product ? icecatRef(product) : null);
  });

  private readonly icecatProduct = computed(() => this.entry().product);

  /** Manufacturer photos; the main picture comes first. Empty when Icecat has nothing. */
  protected readonly pictures = computed<readonly IcecatImage[]>(() => {
    const data = this.icecatProduct();
    if (!data) return [];
    const seen = new Set<string>();
    return [data.image, ...data.gallery].filter((image): image is IcecatImage => {
      const key = image ? displayImage(image) : '';
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  /** Small versions for the strip under the main picture. */
  protected readonly gallery = computed(() => this.pictures().map((image) => thumbImage(image)));

  protected readonly mainImage = computed(() => {
    const product = this.product();
    const fallback = product ? `artikel/${product.art}.svg` : '';
    if (this.imageFailed()) return fallback;
    const picture = this.pictures()[this.activeImage()] ?? this.pictures()[0];
    return displayImage(picture ?? null) || fallback;
  });

  protected readonly ean = computed(
    () => this.icecatProduct()?.gtins[0] ?? this.product()?.gtin ?? '',
  );
  protected readonly icecatCategory = computed(() => this.icecatProduct()?.category ?? '');
  protected readonly featureGroups = computed(() => this.icecatProduct()?.featureGroups ?? []);

  /** Icecat title, but only when it says more than our own designation. */
  protected readonly manufacturerTitle = computed(() => {
    const title = this.icecatProduct()?.title ?? '';
    const own = `${this.product()?.manufacturer} ${this.product()?.name}`;
    return title && title.toLowerCase() !== own.toLowerCase() ? title : '';
  });

  /** Long manufacturer text, unless it only repeats the title. */
  protected readonly manufacturerText = computed(() => {
    const data = this.icecatProduct();
    if (!data) return '';
    const description = data.longDescription || data.shortDescription;
    return description && description !== data.title ? description : '';
  });

  protected readonly manufacturerBullets = computed(() => this.icecatProduct()?.bulletPoints ?? []);

  protected readonly imageNote = computed(() => {
    if (this.gallery().length && !this.imageFailed())
      return 'Produktfoto des Herstellers, bereitgestellt über Icecat.';
    if (this.entry().state === 'locked')
      return 'Eigene Abbildung. Das Herstellerfoto liegt bei Icecat, der Zugang dafür ist noch nicht freigeschaltet.';
    return 'Eigene Abbildung, schematisch. Die tatsächliche Ausführung kann je nach Konfiguration abweichen.';
  });

  protected readonly dataNote = computed(() => {
    switch (this.entry().state) {
      case 'ok':
        return 'Technische Daten und Produktfoto stammen vom Hersteller und kommen über Icecat.';
      case 'locked':
        return 'Weitere Herstellerdaten liegen bei Icecat, der Zugang dafür ist noch nicht freigeschaltet. Angaben oben aus dem Datenblatt.';
      case 'missing':
        return 'Zu dieser Artikelnummer liegen bei Icecat keine Daten. Angaben aus dem Datenblatt des Herstellers.';
      default:
        return 'Angaben aus dem Datenblatt des Herstellers. Abweichungen durch Modellpflege sind möglich.';
    }
  });

  // ---------------------------------------------------------------- pricing

  protected readonly lineTotal = computed(() => {
    const product = this.product();
    return product ? unitPrice(product, this.quantity()) * this.quantity() : 0;
  });

  /** Index of the tier in effect: 0 means the base price, 1 the first tier and so on. */
  protected readonly activeTier = computed(() => {
    const tiers = this.product()?.tiers;
    if (!tiers?.length) return 0;
    let active = 0;
    tiers.forEach((tier, index) => {
      if (this.quantity() >= tier.qty) active = index + 1;
    });
    return active;
  });

  /** Nudge towards the next volume tier, but only when it is close enough to be realistic. */
  protected readonly tierHint = computed(() => {
    const product = this.product();
    const next = product?.tiers?.find((tier) => tier.qty > this.quantity());
    if (!product || !next) return '';
    const missing = next.qty - this.quantity();
    if (missing > Math.max(5, next.qty / 2)) return '';
    return `Ab ${next.qty}: ${euroCents(priceIn(this.store.priceMode(), next.price))} je ${product.unit ?? 'Stück'}`;
  });

  protected readonly buyNotes = computed(() => {
    const product = this.product();
    if (!product) return [];
    const notes = [
      {
        icon: 'phosphorReceipt',
        text: 'Kauf auf Rechnung, 14 Tage netto. Leasing ab 2.500 € netto möglich.',
      },
      {
        icon: 'phosphorArrowsClockwise',
        text: 'Jedes gelieferte Gerät wird als Onboarding-Vorgang im Service-System angelegt.',
      },
    ];
    if (product.recurring) {
      notes.unshift({
        icon: 'phosphorCalendarCheck',
        text: 'Monatliche Lizenz auf Ihrer Sammelrechnung. Mengen lassen sich monatlich nach oben anpassen.',
      });
    } else if (!isPhysical(product)) {
      notes.unshift({
        icon: 'phosphorCalendarCheck',
        text: 'Lizenz mit einjähriger Laufzeit, wird bereitgestellt statt geliefert. Kein Versand.',
      });
    } else {
      notes.unshift({
        icon: 'phosphorTruck',
        text: `Versandkostenfrei ab ${euro(FREE_SHIPPING_FROM)} netto Warenwert.`,
      });
    }
    return notes;
  });

  constructor() {
    // Remembering the article also feeds the "last seen" row on the start page.
    effect(() => {
      const product = this.product();
      if (product) {
        this.store.markViewed(product.id);
        // Signal writes are allowed in an effect, unlike in a computed.
        this.icecat.load(icecatRef(product));
      }
      this.quantity.set(1);
      this.activeImage.set(0);
      this.imageFailed.set(false);
    });
  }

  protected priceText(net: number): string {
    return euroCents(priceIn(this.store.priceMode(), net));
  }
}
