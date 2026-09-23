import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CATEGORIES, PRODUCTS, SERVICE_LINES, productById, unitPrice } from '../../content/catalog';
import { COMPANY, FREE_SHIPPING_FROM, VAT_RATE, WEBSITE } from '../../content/company';
import { BUNDLES, Bundle, SHOP_BENEFITS } from '../../content/shop';
import { PARTNER_VENDORS } from '../../content/vendors';
import { countByCategory, sortProducts } from '../../data/catalog-query';
import { ShopStore, priceIn } from '../../data/shop-store';
import { euro, euroCents } from '../../shared/format';
import { ProductCard } from '../../shared/product-card';
import { ProductImage } from '../../shared/product-image';
import { RevealDirective } from '../../shared/reveal.directive';
import { ToastService } from '../../shared/toast.service';

interface BundleLine {
  slug: string;
  name: string;
  quantity: number;
  lineNet: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIcon, ProductCard, ProductImage, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './home.html',
})
export class Home {
  protected readonly store = inject(ShopStore);
  private readonly toasts = inject(ToastService);

  protected readonly company = COMPANY;
  protected readonly website = WEBSITE;
  protected readonly categories = CATEGORIES;
  protected readonly benefits = SHOP_BENEFITS;
  protected readonly bundles = BUNDLES;
  protected readonly vendors = PARTNER_VENDORS;
  protected readonly serviceLines = Object.values(SERVICE_LINES);
  protected readonly counts = countByCategory(PRODUCTS);
  protected readonly productCount = PRODUCTS.length;

  /** Three tiles in the hero: the articles ordered most often. */
  protected readonly quickPicks = ['fortinet-fg-60f', 'dell-p2425h', 'unifi-u6-pro']
    .map((id) => productById(id))
    .filter((product): product is NonNullable<typeof product> => product !== undefined);

  protected readonly recommended = sortProducts(
    PRODUCTS.filter((product) => !product.quoteOnly),
    'empfohlen',
  ).slice(0, 4);

  protected readonly heroFacts = [
    { label: 'Artikel im Katalog', value: String(PRODUCTS.length) },
    { label: 'Lagerware versandfertig', value: '2 Tage' },
    { label: 'Versandfrei ab', value: euro(FREE_SHIPPING_FROM) },
    { label: 'Zahlungsziel', value: '14 Tage' },
  ];

  protected priceText(net: number): string {
    return euroCents(priceIn(this.store.priceMode(), net));
  }

  protected taxNote(): string {
    return this.store.priceMode() === 'netto'
      ? `zzgl. ${Math.round(VAT_RATE * 100)} % MwSt.`
      : `inkl. ${Math.round(VAT_RATE * 100)} % MwSt.`;
  }

  protected unitLabel(product: { unit?: string }): string {
    return product.unit ? `je ${product.unit}` : 'je Stück';
  }

  protected bundleLines(bundle: Bundle): readonly BundleLine[] {
    return bundle.items.flatMap((item) => {
      const product = productById(item.productId);
      if (!product) return [];
      return [
        {
          slug: product.slug,
          name: product.name,
          quantity: item.quantity,
          lineNet: unitPrice(product, item.quantity) * item.quantity,
        },
      ];
    });
  }

  protected bundleTotal(bundle: Bundle): number {
    return this.bundleLines(bundle).reduce((sum, line) => sum + line.lineNet, 0);
  }

  protected addBundle(bundle: Bundle): void {
    const count = this.store.addBundle(bundle.id);
    this.toasts.show(`${bundle.name} mit ${count} Artikeln im Warenkorb.`, 'phosphorShoppingCartSimple');
  }
}
