import { DeliveryId, PaymentId } from '../content/shop';

/** One line in the cart. Prices are derived from the catalogue, never stored. */
export interface CartItem {
  productId: string;
  quantity: number;
}

/** A cart line with everything the view needs, computed in the store. */
export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  subtitle: string;
  manufacturer: string;
  art: string;
  quantity: number;
  /** Catalogue price without any volume tier. */
  basePrice: number;
  /** Price actually charged for this quantity. */
  unitPrice: number;
  lineTotal: number;
  /** Net amount saved through the volume tier. */
  tierSaving: number;
  recurring: boolean;
  /** Licence or subscription billed once per year: invoiced, not shipped. */
  digital: boolean;
  /** Goods that actually get packed and shipped. */
  physical: boolean;
  unit: string;
  quoteOnly: boolean;
  availability: string;
  leadDays: number;
  /** Manufacturer part number, shown on the line and in the PDF. */
  mpn: string;
  vendorId: string;
}

export interface Address {
  company: string;
  contact: string;
  street: string;
  zip: string;
  city: string;
  email: string;
  phone: string;
  /** Department or cost centre, printed on the delivery note. */
  department: string;
}

/** Customer master data of the demo account. */
export interface CustomerProfile {
  customerNumber: string;
  vatId: string;
  address: Address;
  /** Separate invoice address; empty company means "same as delivery address". */
  billing: Address;
  /** Default reference printed on every order. */
  defaultReference: string;
}

export interface OrderLine {
  productId: string;
  slug: string;
  name: string;
  subtitle: string;
  manufacturer: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  recurring: boolean;
  digital: boolean;
  unit: string;
  mpn: string;
  /** Promised delivery, as a German date. */
  deliveryDate: string;
}

export type OrderKind = 'bestellung' | 'angebot';

export type OrderStatus = 'bestaetigt' | 'in-lieferung' | 'geliefert' | 'offen' | 'abgelaufen';

export interface Order {
  id: string;
  kind: OrderKind;
  /** ISO timestamp. */
  createdAt: string;
  status: OrderStatus;
  lines: readonly OrderLine[];
  delivery: DeliveryId;
  payment: PaymentId;
  address: Address;
  billing: Address;
  reference: string;
  note: string;
  /** One-off net total of the goods. */
  goodsNet: number;
  shippingNet: number;
  /** Monthly net total of the recurring licences. */
  monthlyNet: number;
  vat: number;
  gross: number;
  /** German date the complete order is expected. */
  expectedDelivery: string;
  /** Quotes only: German date the quote expires. */
  validUntil?: string;
}
