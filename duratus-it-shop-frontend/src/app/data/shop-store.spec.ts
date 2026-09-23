import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PRODUCTS, availabilityLabel, icecatRef, isPhysical, productById, unitPrice } from '../content/catalog';
import { EXPRESS_SURCHARGE, FREE_SHIPPING_FROM, SHIPPING_FLAT, VAT_RATE } from '../content/company';
import { BUNDLES } from '../content/shop';
import { VENDORS, vendorById } from '../content/vendors';
import { EMPTY_FILTER, filterProducts, sortProducts } from './catalog-query';
import { mapProduct, refKey } from './icecat.service';
import { ShopStore, bundleProductsExist, withVat } from './shop-store';
import { effectiveStatus } from './status';

function store(): ShopStore {
  localStorage.clear();
  TestBed.resetTestingModule();
  return TestBed.inject(ShopStore);
}

describe('Katalog', () => {
  it('hat eindeutige Ids, Slugs und Artikelnummern', () => {
    const ids = PRODUCTS.map((product) => product.id);
    const slugs = PRODUCTS.map((product) => product.slug);
    const mpns = PRODUCTS.map((product) => product.mpn).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(mpns).size).toBe(mpns.length);
  });

  it('verweist bei jedem Artikel auf einen bekannten Hersteller', () => {
    for (const product of PRODUCTS) {
      expect(vendorById(product.vendorId), `${product.id} ohne Hersteller`).toBeDefined();
      expect(product.manufacturer).toBe(vendorById(product.vendorId)!.name);
    }
  });

  it('deckt alle Partner mit mindestens einem Artikel ab', () => {
    const partners = VENDORS.filter((vendor) => vendor.partner).map((vendor) => vendor.id);
    for (const id of partners) {
      expect(PRODUCTS.some((product) => product.vendorId === id), `kein Artikel für ${id}`).toBe(true);
    }
  });

  it('staffelt Preise ab der jeweiligen Menge nach unten', () => {
    const product = productById('dell-p2425h')!;
    expect(unitPrice(product, 1)).toBe(product.price);
    expect(unitPrice(product, 9)).toBe(product.price);
    expect(unitPrice(product, 10)).toBe(209);
    expect(unitPrice(product, 30)).toBe(199);
    expect(unitPrice(product, 100)).toBe(189);
  });

  it('nennt Lagerware mit Stückzahl, Angebotsartikel ohne Preisversprechen', () => {
    expect(availabilityLabel(productById('dell-p2425h')!).label).toBe('Auf Lager');
    expect(availabilityLabel(productById('dell-p2425h')!).detail).toContain('64 Stück');
    expect(availabilityLabel(productById('fortinet-fg-100f')!).label).toBe('Nur auf Angebot');
    expect(availabilityLabel(productById('ms-365-business-premium')!).label).toBe('Sofort buchbar');
  });

  it('trennt Ware von Lizenzen', () => {
    expect(isPhysical(productById('dell-p2425h')!)).toBe(true);
    expect(isPhysical(productById('ms-365-business-premium')!)).toBe(false);
    expect(isPhysical(productById('veeam-ess-vul')!)).toBe(false);
  });

  it('findet Artikel über Stichwort, Hersteller und Artikelnummer', () => {
    expect(filterProducts({ ...EMPTY_FILTER, search: 'backup' }).length).toBeGreaterThan(1);
    expect(filterProducts({ ...EMPTY_FILTER, search: 'P2425H' }).map((p) => p.id)).toContain('dell-p2425h');
    expect(filterProducts({ ...EMPTY_FILTER, search: 'fortinet' }).length).toBeGreaterThan(2);
    // Umlaute und Schreibweisen werden normalisiert.
    expect(filterProducts({ ...EMPTY_FILTER, search: 'luefterlos' }).length).toBeGreaterThan(0);
    expect(filterProducts({ ...EMPTY_FILTER, search: 'gespräche' }).length).toBeGreaterThan(0);
  });

  it('sortiert nach Preis und stellt Empfehlungen voran', () => {
    const cheapFirst = sortProducts(PRODUCTS, 'preis-auf');
    expect(cheapFirst[0].price).toBeLessThanOrEqual(cheapFirst[cheapFirst.length - 1].price);
    const recommended = sortProducts(PRODUCTS, 'empfohlen');
    expect(recommended[0].badges.length).toBeGreaterThan(0);
  });

  it('verweist in jedem Set auf vorhandene Artikel', () => {
    expect(bundleProductsExist()).toBe(true);
    expect(BUNDLES.length).toBeGreaterThan(0);
  });
});

describe('Icecat-Referenzen', () => {
  it('fragt mit EAN, sonst mit Marke und Artikelnummer', () => {
    // Dell-Monitor mit EAN: die GTIN ist der genauere Weg.
    expect(icecatRef(productById('dell-p2425h')!)).toEqual({ brand: 'Dell', gtin: '5715063490587' });
    // Ubiquiti heißt bei Icecat nicht "UniFi".
    expect(icecatRef(productById('unifi-u6-pro')!)).toEqual({ brand: 'Ubiquiti', productCode: 'U6-Pro' });
    // Aruba Instant On liegt bei Icecat unter HPE.
    expect(icecatRef(productById('aruba-ap22')!)).toEqual({ brand: 'HPE', productCode: 'R4W02A' });
  });

  it('lässt Konfigurationsartikel ohne Artikelnummer aus', () => {
    expect(icecatRef(productById('dell-latitude-5450')!)).toBeNull();
    expect(icecatRef(productById('ms-365-business-premium')!)).toBeNull();
  });

  it('bildet für jede Referenz einen stabilen Schlüssel', () => {
    expect(refKey({ brand: 'Dell', productCode: 'P2425H' })).toBe('dell:p2425h');
    expect(refKey({ brand: 'Dell', gtin: '5715063490587' })).toBe('gtin:5715063490587');
  });

  it('bildet die Icecat-Antwort auf das Shop-Modell ab', () => {
    const mapped = mapProduct({
      GeneralInfo: {
        IcecatId: 120212075,
        Title: 'DELL Pro Plus P2425H Computerbildschirm',
        ProductName: 'Pro Plus P2425H',
        Brand: 'DELL',
        BrandPartCode: 'P2425H',
        GTIN: ['5715063490587'],
        Category: { Name: { Value: 'Computerbildschirme' } },
        SummaryDescription: { ShortSummaryDescription: 'kurz', LongSummaryDescription: 'lang' },
        BulletPoints: ['Punkt eins', ''],
      },
      Image: { HighPic: 'https://images.icecat.biz/hoch.jpg', ThumbPic: 'https://images.icecat.biz/klein.jpg' },
      Gallery: [{ Pic: 'https://images.icecat.biz/zwei.jpg' }],
      FeaturesGroups: [
        {
          FeatureGroup: { Name: { Value: 'Display' } },
          Features: [{ Feature: { Name: { Value: 'Diagonale' } }, PresentationValue: '61 cm' }],
        },
      ],
    });

    expect(mapped.icecatId).toBe(120212075);
    expect(mapped.mpn).toBe('P2425H');
    expect(mapped.gtins).toEqual(['5715063490587']);
    expect(mapped.category).toBe('Computerbildschirme');
    expect(mapped.longDescription).toBe('lang');
    expect(mapped.bulletPoints).toEqual(['Punkt eins']);
    expect(mapped.image?.high).toBe('https://images.icecat.biz/hoch.jpg');
    expect(mapped.gallery.length).toBe(1);
    expect(mapped.featureGroups[0]).toEqual({
      name: 'Display',
      features: [{ name: 'Diagonale', value: '61 cm' }],
    });
  });

  it('verträgt eine leere Antwort ohne zu werfen', () => {
    const mapped = mapProduct({});
    expect(mapped.title).toBe('');
    expect(mapped.image).toBeNull();
    expect(mapped.featureGroups).toEqual([]);
  });
});

describe('ShopStore', () => {
  beforeEach(() => localStorage.clear());

  it('fasst denselben Artikel zu einer Position zusammen', () => {
    const shop = store();
    shop.add('dell-p2425h', 2);
    shop.add('dell-p2425h', 3);
    expect(shop.lines().length).toBe(1);
    expect(shop.cartCount()).toBe(5);
  });

  it('rechnet Staffelpreise und den Staffelvorteil je Position', () => {
    const shop = store();
    shop.add('dell-p2425h', 10);
    const line = shop.lines()[0];
    expect(line.unitPrice).toBe(209);
    expect(line.lineTotal).toBe(2090);
    expect(line.tierSaving).toBe(100);
    expect(shop.tierSaving()).toBe(100);
  });

  it('trennt einmalige Positionen von monatlichen Lizenzen', () => {
    const shop = store();
    shop.add('dell-p2425h', 1);
    shop.add('ms-365-business-premium', 10);
    expect(shop.goodsNet()).toBe(219);
    expect(shop.monthlyNet()).toBe(226);
  });

  it('berechnet Versand nur auf Ware, die tatsächlich verschickt wird', () => {
    const shop = store();
    shop.add('ms-365-business-premium', 10);
    expect(shop.shippingFor('standard')).toBe(0);

    // Jahreslizenz: wird berechnet, aber nicht geliefert.
    shop.add('veeam-ess-vul', 1);
    expect(shop.goodsNet()).toBe(1290);
    expect(shop.physicalNet()).toBe(0);
    expect(shop.shippingFor('standard')).toBe(0);

    shop.add('dell-p2425h', 1);
    expect(shop.shippingFor('standard')).toBe(SHIPPING_FLAT);
    expect(shop.shippingFor('express')).toBe(SHIPPING_FLAT + EXPRESS_SURCHARGE);

    shop.setQuantity('dell-p2425h', 10);
    expect(shop.physicalNet()).toBeGreaterThanOrEqual(FREE_SHIPPING_FROM);
    expect(shop.shippingFor('standard')).toBe(0);
    expect(shop.shippingFor('express')).toBe(EXPRESS_SURCHARGE);
  });

  it('meldet Angebotsartikel im Warenkorb', () => {
    const shop = store();
    shop.add('dell-p2425h', 1);
    expect(shop.hasQuoteOnly()).toBe(false);
    shop.add('fortinet-fg-100f', 1);
    expect(shop.hasQuoteOnly()).toBe(true);
  });

  it('legt ein ganzes Set in den Warenkorb', () => {
    const shop = store();
    const added = shop.addBundle('arbeitsplatz-set');
    expect(added).toBe(5);
    expect(shop.lines().length).toBe(4);
    expect(shop.lines().find((line) => line.productId === 'dell-p2425h')?.quantity).toBe(2);
  });

  it('macht aus dem Warenkorb eine Bestellung und leert ihn', () => {
    const shop = store();
    shop.add('dell-p2425h', 10);
    shop.add('ms-365-business-premium', 5);
    const order = shop.submit({
      kind: 'bestellung',
      delivery: 'standard',
      payment: 'rechnung',
      address: shop.customer().address,
      billing: shop.customer().address,
      reference: 'PR-42',
      note: '',
    });

    expect(order.id).toMatch(/^BST-\d{4}-0001$/);
    expect(order.lines.length).toBe(2);
    expect(order.goodsNet).toBe(2090);
    expect(order.monthlyNet).toBe(113);
    expect(order.vat).toBeCloseTo(2090 * VAT_RATE, 6);
    expect(order.gross).toBeCloseTo(2090 * (1 + VAT_RATE), 6);
    // Die Lizenz wird bereitgestellt, nicht geliefert.
    expect(order.lines.find((line) => line.productId === 'ms-365-business-premium')?.deliveryDate).toBe('sofort');
    expect(shop.isEmpty()).toBe(true);
    expect(shop.orders().length).toBe(1);
  });

  it('gibt Angeboten eine eigene Nummer und eine Gültigkeit', () => {
    const shop = store();
    shop.add('fortinet-fg-100f', 1);
    const quote = shop.submit({
      kind: 'angebot',
      delivery: 'standard',
      payment: 'rechnung',
      address: shop.customer().address,
      billing: shop.customer().address,
      reference: '',
      note: '',
    });
    expect(quote.id).toMatch(/^ANG-\d{4}-/);
    expect(quote.status).toBe('offen');
    expect(quote.validUntil).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });

  it('legt eine frühere Bestellung wieder in den Warenkorb', () => {
    const shop = store();
    shop.add('dell-p2425h', 2);
    const order = shop.submit({
      kind: 'bestellung',
      delivery: 'standard',
      payment: 'rechnung',
      address: shop.customer().address,
      billing: shop.customer().address,
      reference: '',
      note: '',
    });
    shop.reorder(order.id);
    expect(shop.lines()[0].quantity).toBe(2);
  });

  it('schaltet Artikel auf der Merkliste um', () => {
    const shop = store();
    expect(shop.isOnWishlist('unifi-u6-pro')).toBe(true);
    shop.toggleWishlist('unifi-u6-pro');
    expect(shop.isOnWishlist('unifi-u6-pro')).toBe(false);
    shop.toggleWishlist('unifi-u6-pro');
    expect(shop.wishlist()[0].id).toBe('unifi-u6-pro');
  });

  it('setzt die Demodaten zurück', () => {
    const shop = store();
    shop.add('dell-p2425h', 3);
    shop.resetDemo();
    expect(shop.isEmpty()).toBe(true);
    expect(shop.orders().length).toBe(0);
  });
});

describe('Preise und Status', () => {
  it('rechnet brutto aus netto', () => {
    expect(withVat(100)).toBeCloseTo(119, 6);
  });

  it('lässt ein Angebot nach dem Gültigkeitsdatum ablaufen', () => {
    const quote = {
      kind: 'angebot' as const,
      status: 'offen' as const,
      validUntil: '01.01.2026',
    };
    expect(effectiveStatus(quote as never, new Date(2026, 0, 1))).toBe('offen');
    expect(effectiveStatus(quote as never, new Date(2026, 0, 2))).toBe('abgelaufen');
  });
});
