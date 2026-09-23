import { Injectable, computed, effect, signal } from '@angular/core';
import {
  EXPRESS_SURCHARGE,
  FREE_SHIPPING_FROM,
  SHIPPING_FLAT,
  VAT_RATE,
} from '../content/company';
import { PRODUCTS, Product, isPhysical, productById, unitPrice } from '../content/catalog';
import { BUNDLES, DeliveryId, PaymentId } from '../content/shop';
import { addDays, dateDe } from '../shared/format';
import { readJson, removeKey, writeJson } from './browser-storage';
import { Address, CartItem, CartLine, CustomerProfile, Order, OrderLine } from './models';

export const STORAGE_KEY = 'duratus-shop-demo-v1';

export type PriceMode = 'netto' | 'brutto';

/** Demo master data, matching the "Muster GmbH" of the customer portal and the knowledge base. */
const DEMO_CUSTOMER: CustomerProfile = {
  customerNumber: 'K-10427',
  vatId: 'DE987654321',
  address: {
    company: 'Muster GmbH',
    contact: 'Julia Beispiel',
    street: 'Beispielweg 12',
    zip: '12345',
    city: 'Musterstadt',
    email: 'einkauf@muster-gmbh.de',
    phone: '+49 1234 567890',
    department: 'IT / Kostenstelle 4200',
  },
  billing: {
    company: '',
    contact: '',
    street: '',
    zip: '',
    city: '',
    email: 'buchhaltung@muster-gmbh.de',
    phone: '',
    department: '',
  },
  defaultReference: '',
};

/** Everything the visitor changes. Master data stays in the content files. */
interface PersistedState {
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  customer: CustomerProfile;
  priceMode: PriceMode;
  /** Product ids, newest first. */
  recent: string[];
  /** Running number for order and quote ids. */
  counter: number;
  /** Remembered checkout choices. */
  delivery: DeliveryId;
  payment: PaymentId;
}

function initialState(): PersistedState {
  return {
    cart: [],
    wishlist: ['dell-u2724d', 'unifi-u6-pro'],
    orders: [],
    customer: structuredClone(DEMO_CUSTOMER),
    priceMode: 'netto',
    recent: [],
    counter: 1,
    delivery: 'standard',
    payment: 'rechnung',
  };
}

/** Working days between today and a delivery promise, ignoring holidays. */
function deliveryDate(leadDays: number, today = new Date()): Date {
  let date = today;
  let left = Math.max(leadDays, 1);
  while (left > 0) {
    date = addDays(date, 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) left--;
  }
  return date;
}

/**
 * Client-side state of the shop. The catalogue is read-only demo content, everything the visitor does is mirrored
 * to localStorage so a reload keeps the cart. This is the single place to connect an API later
 * (catalogue and stock from the distributor, orders into the ERP).
 */
@Injectable({ providedIn: 'root' })
export class ShopStore {
  private readonly state = signal<PersistedState>({ ...initialState(), ...readJson<PersistedState>('local', STORAGE_KEY) });

  readonly priceMode = computed(() => this.state().priceMode);
  readonly customer = computed(() => this.state().customer);
  readonly orders = computed(() => [...this.state().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  readonly wishlistIds = computed(() => this.state().wishlist);
  readonly cartItems = computed(() => this.state().cart);
  readonly delivery = computed(() => this.state().delivery);
  readonly payment = computed(() => this.state().payment);

  /** Products on the wishlist, in the order they were added. */
  readonly wishlist = computed(() =>
    this.state()
      .wishlist.map((id) => productById(id))
      .filter((product): product is Product => product !== undefined),
  );

  /** Recently viewed products, newest first, without the one currently open. */
  readonly recent = computed(() =>
    this.state()
      .recent.map((id) => productById(id))
      .filter((product): product is Product => product !== undefined),
  );

  readonly lines = computed<readonly CartLine[]>(() =>
    this.state().cart.flatMap<CartLine>((item) => {
      const product = productById(item.productId);
      if (!product) return [];
      const price = unitPrice(product, item.quantity);
      return [
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          subtitle: product.subtitle,
          manufacturer: product.manufacturer,
          art: product.art,
          quantity: item.quantity,
          basePrice: product.price,
          unitPrice: price,
          lineTotal: price * item.quantity,
          tierSaving: (product.price - price) * item.quantity,
          recurring: product.recurring === true,
          digital: product.digital === true,
          physical: isPhysical(product),
          unit: product.unit ?? 'Stück',
          quoteOnly: product.quoteOnly === true,
          availability: product.availability,
          leadDays: product.leadDays,
          mpn: product.mpn,
          vendorId: product.vendorId,
        },
      ];
    }),
  );

  readonly cartCount = computed(() => this.state().cart.reduce((sum, item) => sum + item.quantity, 0));
  readonly isEmpty = computed(() => this.state().cart.length === 0);

  /** One-off goods, without the monthly licences. */
  readonly goodsNet = computed(() =>
    this.lines()
      .filter((line) => !line.recurring)
      .reduce((sum, line) => sum + line.lineTotal, 0),
  );

  readonly monthlyNet = computed(() =>
    this.lines()
      .filter((line) => line.recurring)
      .reduce((sum, line) => sum + line.lineTotal, 0),
  );

  /** One-off goods that are actually shipped; drives shipping and the free-shipping threshold. */
  readonly physicalNet = computed(() =>
    this.lines()
      .filter((line) => line.physical)
      .reduce((sum, line) => sum + line.lineTotal, 0),
  );

  readonly tierSaving = computed(() => this.lines().reduce((sum, line) => sum + line.tierSaving, 0));

  /** Cart contains an article that only goes out as a written quote. */
  readonly hasQuoteOnly = computed(() => this.lines().some((line) => line.quoteOnly));

  /** Net amount still missing for free shipping; 0 once reached. */
  readonly missingForFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_FROM - this.physicalNet()));

  /** Longest lead time in the cart, as a German date. */
  readonly expectedDelivery = computed(() => {
    const lines = this.lines().filter((line) => line.physical);
    if (lines.length === 0) return dateDe(deliveryDate(1));
    return dateDe(deliveryDate(Math.max(...lines.map((line) => line.leadDays))));
  });

  constructor() {
    effect(() => writeJson('local', STORAGE_KEY, this.state()));
  }

  // ------------------------------------------------------------------ cart

  add(productId: string, quantity = 1): void {
    this.state.update((state) => {
      const existing = state.cart.find((item) => item.productId === productId);
      const cart = existing
        ? state.cart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item))
        : [...state.cart, { productId, quantity }];
      return { ...state, cart };
    });
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity < 1) return this.remove(productId);
    this.state.update((state) => ({
      ...state,
      cart: state.cart.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(quantity, 999) } : item)),
    }));
  }

  remove(productId: string): void {
    this.state.update((state) => ({ ...state, cart: state.cart.filter((item) => item.productId !== productId) }));
  }

  clearCart(): void {
    this.state.update((state) => ({ ...state, cart: [] }));
  }

  /** Adds every article of a prepared set; existing quantities are raised, not replaced. */
  addBundle(bundleId: string): number {
    const bundle = BUNDLES.find((entry) => entry.id === bundleId);
    if (!bundle) return 0;
    for (const item of bundle.items) this.add(item.productId, item.quantity);
    return bundle.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ------------------------------------------------------------------ wishlist and history

  toggleWishlist(productId: string): boolean {
    const onList = this.state().wishlist.includes(productId);
    this.state.update((state) => ({
      ...state,
      wishlist: onList ? state.wishlist.filter((id) => id !== productId) : [productId, ...state.wishlist],
    }));
    return !onList;
  }

  isOnWishlist(productId: string): boolean {
    return this.state().wishlist.includes(productId);
  }

  /** Remembers the last eight viewed products for the "last seen" row. */
  markViewed(productId: string): void {
    this.state.update((state) => ({
      ...state,
      recent: [productId, ...state.recent.filter((id) => id !== productId)].slice(0, 8),
    }));
  }

  // ------------------------------------------------------------------ settings and master data

  setPriceMode(mode: PriceMode): void {
    this.state.update((state) => ({ ...state, priceMode: mode }));
  }

  setDelivery(delivery: DeliveryId): void {
    this.state.update((state) => ({ ...state, delivery }));
  }

  setPayment(payment: PaymentId): void {
    this.state.update((state) => ({ ...state, payment }));
  }

  saveCustomer(customer: CustomerProfile): void {
    this.state.update((state) => ({ ...state, customer }));
  }

  resetDemo(): void {
    removeKey('local', STORAGE_KEY);
    this.state.set(initialState());
  }

  // ------------------------------------------------------------------ checkout

  /** Shipping for the current cart and delivery option. Monthly licences never carry shipping. */
  shippingFor(delivery: DeliveryId): number {
    // Only a cart with something to pack carries shipping; licences alone never do.
    const physical = this.physicalNet();
    if (physical === 0) return 0;
    const base = physical >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT;
    return delivery === 'express' ? base + EXPRESS_SURCHARGE : base;
  }

  /**
   * Turns the cart into an order or a quote, empties the cart and returns the new record.
   * A real shop would do this server side; here it only lands in localStorage.
   */
  submit(input: {
    kind: Order['kind'];
    delivery: DeliveryId;
    payment: PaymentId;
    address: Address;
    billing: Address;
    reference: string;
    note: string;
  }): Order {
    const lines: OrderLine[] = this.lines().map((line) => ({
      productId: line.productId,
      slug: line.slug,
      name: line.name,
      subtitle: line.subtitle,
      manufacturer: line.manufacturer,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
      recurring: line.recurring,
      digital: line.digital,
      unit: line.unit,
      mpn: line.mpn,
      deliveryDate: line.physical ? dateDe(deliveryDate(line.leadDays)) : 'sofort',
    }));

    const goodsNet = this.goodsNet();
    const monthlyNet = this.monthlyNet();
    const shippingNet = this.shippingFor(input.delivery);
    // The VAT shown covers the one-off part; the monthly licences are invoiced separately each month.
    const net = goodsNet + shippingNet;
    const vat = net * VAT_RATE;

    const now = new Date();
    const number = String(this.state().counter).padStart(4, '0');
    const order: Order = {
      id: `${input.kind === 'angebot' ? 'ANG' : 'BST'}-${now.getFullYear()}-${number}`,
      kind: input.kind,
      createdAt: now.toISOString(),
      status: input.kind === 'angebot' ? 'offen' : 'bestaetigt',
      lines,
      delivery: input.delivery,
      payment: input.payment,
      address: input.address,
      billing: input.billing,
      reference: input.reference,
      note: input.note,
      goodsNet,
      shippingNet,
      monthlyNet,
      vat,
      gross: net + vat,
      expectedDelivery: this.expectedDelivery(),
      validUntil: input.kind === 'angebot' ? dateDe(addDays(now, 14)) : undefined,
    };

    this.state.update((state) => ({ ...state, orders: [...state.orders, order], cart: [], counter: state.counter + 1 }));
    return order;
  }

  orderById(id: string): Order | undefined {
    return this.state().orders.find((order) => order.id === id);
  }

  /** Puts every article of an earlier order back into the cart. */
  reorder(id: string): number {
    const order = this.orderById(id);
    if (!order) return 0;
    for (const line of order.lines) if (productById(line.productId)) this.add(line.productId, line.quantity);
    return order.lines.length;
  }
}

/** Gross price for the display toggle. */
export const withVat = (net: number): number => net * (1 + VAT_RATE);

/** Price as the current mode wants it. */
export const priceIn = (mode: PriceMode, net: number): number => (mode === 'brutto' ? withVat(net) : net);

/** Sanity check used by the tests: every bundle references existing products. */
export const bundleProductsExist = (): boolean =>
  BUNDLES.every((bundle) => bundle.items.every((item) => PRODUCTS.some((product) => product.id === item.productId)));
