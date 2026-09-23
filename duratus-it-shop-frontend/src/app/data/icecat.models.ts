/**
 * Typed subset of the Icecat Live JSON response (https://live.icecat.biz/api).
 * Only the fields the shop actually renders are modelled; everything else is ignored.
 */

export interface IcecatRef {
  /** Brand exactly as Icecat spells it, e.g. "Dell", "HPE", "Ubiquiti". */
  brand: string;
  /** Manufacturer part number / product code. */
  productCode?: string;
  /** EAN/UPC/GTIN; used instead of brand + product code when present. */
  gtin?: string;
}

export interface IcecatImage {
  thumb: string;
  low: string;
  medium: string;
  high: string;
}

export interface IcecatFeature {
  name: string;
  value: string;
}

export interface IcecatFeatureGroup {
  name: string;
  features: readonly IcecatFeature[];
}

export interface IcecatProduct {
  icecatId: number;
  /** Full marketing title, e.g. "DELL UltraSharp U2724D Computerbildschirm …". */
  title: string;
  /** Model name without the brand, e.g. "UltraSharp U2724D". */
  productName: string;
  brand: string;
  /** Manufacturer part number as Icecat holds it. */
  mpn: string;
  /** All GTINs; the first one is shown as the EAN. */
  gtins: readonly string[];
  category: string;
  shortDescription: string;
  longDescription: string;
  bulletPoints: readonly string[];
  image: IcecatImage | null;
  gallery: readonly IcecatImage[];
  featureGroups: readonly IcecatFeatureGroup[];
}

/**
 * `ok` – data available · `locked` – product exists but the account may not read it (Full Icecat) ·
 * `missing` – unknown product code · `error` – network or parsing problem · `off` – no lookup configured.
 */
export type IcecatState = 'loading' | 'ok' | 'locked' | 'missing' | 'error' | 'off';

export interface IcecatEntry {
  state: IcecatState;
  product: IcecatProduct | null;
  /** Message from Icecat, shown in the diagnostics on the account page. */
  message: string;
}

export const ICECAT_IDLE: IcecatEntry = { state: 'off', product: null, message: '' };

/** Picks the largest picture that is actually set. */
export function bestImage(image: IcecatImage | null): string {
  if (!image) return '';
  return image.high || image.medium || image.low || image.thumb || '';
}

/**
 * Display size for the page. Icecat ships originals of several thousand pixels, which are far too
 * heavy for a product tile, so the 500-px version comes first and the original is only the fallback.
 */
export function displayImage(image: IcecatImage | null): string {
  if (!image) return '';
  return image.medium || image.low || image.high || image.thumb || '';
}

/** Smallest usable size, for the thumbnail strip and the cart lines. */
export function thumbImage(image: IcecatImage | null): string {
  if (!image) return '';
  return image.thumb || image.low || image.medium || image.high || '';
}
