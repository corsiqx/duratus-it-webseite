import { Availability, PRODUCTS, Product, categoryById } from '../content/catalog';

/** Sort orders offered in the catalogue. */
export type SortKey = 'empfohlen' | 'preis-auf' | 'preis-ab' | 'name' | 'lieferzeit';

export const SORT_OPTIONS: readonly { value: SortKey; label: string }[] = [
  { value: 'empfohlen', label: 'Empfohlen' },
  { value: 'preis-auf', label: 'Preis aufsteigend' },
  { value: 'preis-ab', label: 'Preis absteigend' },
  { value: 'name', label: 'Bezeichnung' },
  { value: 'lieferzeit', label: 'Schnellste Lieferung' },
];

export interface CatalogFilter {
  categoryId?: string;
  manufacturers: readonly string[];
  /** Net price ceiling; 0 means no limit. */
  maxPrice: number;
  /** Only articles that ship from stock. */
  inStockOnly: boolean;
  /** Hide articles that are quote-only. */
  buyableOnly: boolean;
  search: string;
}

export const EMPTY_FILTER: CatalogFilter = {
  manufacturers: [],
  maxPrice: 0,
  inStockOnly: false,
  buyableOnly: false,
  search: '',
};

/** Recommendation order: badges first, then stock, then price. */
const RECOMMENDED_WEIGHT = (product: Product): number => {
  let weight = 0;
  if (product.badges.includes('bestseller')) weight -= 40;
  if (product.badges.includes('aktion')) weight -= 25;
  if (product.badges.includes('neu')) weight -= 15;
  if (product.availability === 'lager') weight -= 10;
  if (product.quoteOnly) weight += 30;
  return weight;
};

const normalise = (value: string): string =>
  value
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss');

/** Words a product can be found by. */
const haystack = (product: Product): string =>
  normalise(
    [
      product.name,
      product.subtitle,
      product.manufacturer,
      product.mpn,
      product.text,
      categoryById(product.categoryId)?.name ?? '',
      ...product.tags,
      ...product.specs.map((spec) => `${spec.label} ${spec.value}`),
    ].join(' '),
  );

/** Free-text match: every search word has to appear somewhere. */
export function matchesSearch(product: Product, search: string): boolean {
  const words = normalise(search).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = haystack(product);
  return words.every((word) => text.includes(word));
}

export function filterProducts(filter: CatalogFilter, products: readonly Product[] = PRODUCTS): readonly Product[] {
  return products.filter((product) => {
    if (filter.categoryId && product.categoryId !== filter.categoryId) return false;
    if (filter.manufacturers.length && !filter.manufacturers.includes(product.manufacturer)) return false;
    if (filter.maxPrice > 0 && product.price > filter.maxPrice) return false;
    if (filter.inStockOnly && product.availability !== 'lager') return false;
    if (filter.buyableOnly && product.quoteOnly) return false;
    return matchesSearch(product, filter.search);
  });
}

export function sortProducts(products: readonly Product[], sort: SortKey): readonly Product[] {
  const list = [...products];
  switch (sort) {
    case 'preis-auf':
      return list.sort((a, b) => a.price - b.price);
    case 'preis-ab':
      return list.sort((a, b) => b.price - a.price);
    case 'name':
      return list.sort((a, b) => `${a.name} ${a.subtitle}`.localeCompare(`${b.name} ${b.subtitle}`, 'de'));
    case 'lieferzeit':
      return list.sort((a, b) => a.leadDays - b.leadDays || a.price - b.price);
    case 'empfohlen':
      return list.sort((a, b) => RECOMMENDED_WEIGHT(a) - RECOMMENDED_WEIGHT(b) || a.price - b.price);
  }
}

/** How many articles of a set fall into each category, for the filter counters. */
export function countByCategory(products: readonly Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
  return counts;
}

export function countByManufacturer(products: readonly Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) counts[product.manufacturer] = (counts[product.manufacturer] ?? 0) + 1;
  return counts;
}

export function countByAvailability(products: readonly Product[]): Record<Availability, number> {
  const counts = { lager: 0, bestellware: 0, lieferzeit: 0, anfrage: 0 };
  for (const product of products) counts[product.availability]++;
  return counts;
}

/** Up to four articles of the same category, used as "fits with this" on the detail page. */
export function relatedProducts(product: Product, limit = 4): readonly Product[] {
  const sameCategory = PRODUCTS.filter((entry) => entry.categoryId === product.categoryId && entry.id !== product.id);
  const others = PRODUCTS.filter((entry) => entry.categoryId !== product.categoryId && entry.id !== product.id);
  const sharesTag = others.filter((entry) => entry.tags.some((tag) => product.tags.includes(tag)));
  return [...sortProducts(sameCategory, 'empfohlen'), ...sortProducts(sharesTag, 'empfohlen')].slice(0, limit);
}
