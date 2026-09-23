import { Injectable, computed, signal } from '@angular/core';
import { ICECAT } from '../content/icecat';
import { readJson, removeKey, writeJson } from './browser-storage';
import {
  ICECAT_IDLE,
  IcecatEntry,
  IcecatFeatureGroup,
  IcecatProduct,
  IcecatRef,
} from './icecat.models';

const CACHE_KEY = 'duratus-shop-icecat-v1';
const KEY_STORAGE = 'duratus-shop-icecat-key';

interface CacheRecord {
  at: number;
  entry: IcecatEntry;
}

/** Stable cache key for a reference. */
export const refKey = (ref: IcecatRef): string =>
  ref.gtin
    ? `gtin:${ref.gtin}`
    : `${ref.brand.toLowerCase()}:${(ref.productCode ?? '').toLowerCase()}`;

/**
 * Reads product data from the Icecat Live JSON API, straight from the browser.
 *
 * Deliberately a frontend service for now (that is what was asked for). It is failure-tolerant by
 * design: every article keeps working without Icecat, the local illustration and the catalogue text
 * stay the fallback. Results are cached in localStorage so browsing does not hammer the API.
 *
 * **Reading and loading are strictly separated.** `entry()` is pure and may be called from a
 * `computed`; `load()` writes signals and therefore belongs in an `effect`. Mixing the two was a real
 * bug once (NG0600: writing to signals is not allowed in a computed) — it made every render throw.
 *
 * Known limits, see `content/icecat.ts`: the app key lives in the browser, there is no shared cache
 * between visitors, and the request count is not controlled. Both belong on a server later.
 */
@Injectable({ providedIn: 'root' })
export class IcecatService {
  /** Icecat account used for the lookups. Empty disables Icecat completely. */
  readonly userName = signal(ICECAT.userName);
  /** Full-Icecat app key, entered under /konto. Empty means Open Icecat only. */
  readonly appKey = signal(readJson<string>('local', KEY_STORAGE) ?? '');

  readonly enabled = computed(() => this.userName().trim().length > 0);

  /** Everything looked up so far, keyed by `refKey`. One signal, so reading stays pure. */
  private readonly entries = signal<Record<string, IcecatEntry>>({});
  /** Keys whose lookup has already been started, so a second call is a no-op. */
  private readonly started = new Set<string>();

  private cache: Record<string, CacheRecord> =
    readJson<Record<string, CacheRecord>>('local', CACHE_KEY) ?? {};
  private fromCacheCount = signal(0);

  private running = 0;
  private readonly queue: (() => void)[] = [];

  /** Counters for the diagnostics box on the account page, derived from the entries. */
  readonly stats = computed(() => {
    const counts = {
      ok: 0,
      locked: 0,
      missing: 0,
      error: 0,
      loading: 0,
      cached: this.fromCacheCount(),
    };
    for (const entry of Object.values(this.entries())) {
      if (entry.state === 'ok') counts.ok++;
      else if (entry.state === 'locked') counts.locked++;
      else if (entry.state === 'missing') counts.missing++;
      else if (entry.state === 'error') counts.error++;
      else if (entry.state === 'loading') counts.loading++;
    }
    return counts;
  });

  /**
   * Current state of a reference. Pure: no signal is written, nothing is started.
   * Safe to call from a `computed` or straight from a template.
   */
  entry(ref: IcecatRef | null): IcecatEntry {
    if (!ref || !this.enabled()) return ICECAT_IDLE;
    return this.entries()[refKey(ref)] ?? ICECAT_IDLE;
  }

  /**
   * Starts the lookup for a reference if it has not run yet. Writes signals, so call it from an
   * `effect` (or another non-reactive context), never from a `computed`.
   */
  load(ref: IcecatRef | null): void {
    if (!ref || !this.enabled()) return;
    const key = refKey(ref);
    if (this.started.has(key)) return;
    this.started.add(key);

    const cached = this.fromCache(key);
    if (cached) {
      this.put(key, cached);
      this.fromCacheCount.update((count) => count + 1);
      return;
    }

    this.put(key, { state: 'loading', product: null, message: '' });
    this.enqueue(async () => {
      const entry = await this.fetchEntry(ref);
      this.put(key, entry);
      this.toCache(key, entry);
    });
  }

  /** Stores a Full-Icecat app key and throws the cache away, so locked articles are retried. */
  setAppKey(key: string): void {
    const value = key.trim();
    this.appKey.set(value);
    if (value) writeJson('local', KEY_STORAGE, value);
    else removeKey('local', KEY_STORAGE);
    this.clearCache();
  }

  clearCache(): void {
    this.cache = {};
    removeKey('local', CACHE_KEY);
    this.started.clear();
    this.entries.set({});
    this.fromCacheCount.set(0);
  }

  // ---------------------------------------------------------------- internals

  private put(key: string, entry: IcecatEntry): void {
    this.entries.update((entries) => ({ ...entries, [key]: entry }));
  }

  private url(ref: IcecatRef): string {
    const params = new URLSearchParams({ UserName: this.userName(), Language: ICECAT.language });
    if (ref.gtin) params.set('GTIN', ref.gtin);
    else {
      params.set('Brand', ref.brand);
      params.set('ProductCode', ref.productCode ?? '');
    }
    if (this.appKey()) params.set('app_key', this.appKey());
    return `${ICECAT.endpoint}?${params.toString()}`;
  }

  private async fetchEntry(ref: IcecatRef): Promise<IcecatEntry> {
    try {
      const response = await fetch(this.url(ref), {
        signal: AbortSignal.timeout(ICECAT.timeoutMs),
      });
      const body = (await response.json()) as Record<string, unknown>;

      if (body['msg'] === 'OK' && body['data']) {
        return {
          state: 'ok',
          product: mapProduct(body['data'] as Record<string, unknown>),
          message: '',
        };
      }
      const code = Number(body['Code'] ?? response.status);
      const message = String(body['Message'] ?? body['Error'] ?? `HTTP ${response.status}`);
      // 403: the product exists but this account may not read it (Full Icecat).
      if (code === 403) return { state: 'locked', product: null, message };
      // 404/400: unknown product code or GTIN.
      if (code === 404 || code === 400) return { state: 'missing', product: null, message };
      return { state: 'error', product: null, message };
    } catch (error) {
      return {
        state: 'error',
        product: null,
        message: error instanceof Error ? error.message : 'Unbekannter Fehler',
      };
    }
  }

  private fromCache(key: string): IcecatEntry | null {
    const record = this.cache[key];
    if (!record) return null;
    const hours = record.entry.state === 'ok' ? ICECAT.cacheHours : ICECAT.negativeCacheHours;
    if (Date.now() - record.at > hours * 3_600_000) return null;
    return record.entry;
  }

  private toCache(key: string, entry: IcecatEntry): void {
    if (entry.state === 'error') return; // a network hiccup should not be remembered
    this.cache = { ...this.cache, [key]: { at: Date.now(), entry } };
    writeJson('local', CACHE_KEY, this.cache);
  }

  /** Keeps at most `maxParallel` requests in flight so a catalogue page does not open 40 connections. */
  private enqueue(task: () => Promise<void>): void {
    const run = () => {
      this.running++;
      void task().finally(() => {
        this.running--;
        const next = this.queue.shift();
        if (next) next();
      });
    };
    if (this.running < ICECAT.maxParallel) run();
    else this.queue.push(run);
  }
}

// ---------------------------------------------------------------- mapping

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function mapImage(raw: Record<string, unknown> | undefined): IcecatProduct['image'] {
  if (!raw) return null;
  const image = {
    thumb: text(raw['ThumbPic']),
    low: text(raw['LowPic']),
    medium: text(raw['Pic500x500']) || text(raw['Pic']),
    high: text(raw['HighPic']) || text(raw['Pic']),
  };
  return image.high || image.medium || image.low || image.thumb ? image : null;
}

function mapFeatureGroups(raw: unknown): readonly IcecatFeatureGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((group: Record<string, unknown>) => {
      const header = group['FeatureGroup'] as Record<string, unknown> | undefined;
      const name = text((header?.['Name'] as Record<string, unknown> | undefined)?.['Value']);
      const features = Array.isArray(group['Features'])
        ? (group['Features'] as Record<string, unknown>[])
            .map((feature) => ({
              name: text(
                (
                  (feature['Feature'] as Record<string, unknown> | undefined)?.['Name'] as
                    Record<string, unknown> | undefined
                )?.['Value'],
              ),
              value: text(feature['PresentationValue']),
            }))
            .filter((feature) => feature.name && feature.value)
        : [];
      return { name, features };
    })
    .filter((group) => group.features.length > 0);
}

/** Maps the Icecat payload onto the small model the shop renders. */
export function mapProduct(data: Record<string, unknown>): IcecatProduct {
  const general = (data['GeneralInfo'] ?? {}) as Record<string, unknown>;
  const summary = (general['SummaryDescription'] ?? {}) as Record<string, unknown>;
  const category = (general['Category'] ?? {}) as Record<string, unknown>;
  const gallery = Array.isArray(data['Gallery'])
    ? (data['Gallery'] as Record<string, unknown>[])
    : [];
  const bullets = general['BulletPoints'] ?? general['GeneratedBulletPoints'];

  return {
    icecatId: Number(general['IcecatId'] ?? 0),
    title: text(general['Title']),
    productName: text(general['ProductName']),
    brand: text(general['Brand']),
    mpn: text(general['BrandPartCode']),
    gtins: Array.isArray(general['GTIN'])
      ? (general['GTIN'] as unknown[]).map(text).filter(Boolean)
      : [],
    category: text((category['Name'] as Record<string, unknown> | undefined)?.['Value']),
    shortDescription: text(summary['ShortSummaryDescription']),
    longDescription: text(summary['LongSummaryDescription']),
    bulletPoints: Array.isArray(bullets) ? (bullets as unknown[]).map(text).filter(Boolean) : [],
    image: mapImage(data['Image'] as Record<string, unknown> | undefined),
    gallery: gallery
      .map((entry) => mapImage(entry))
      .filter((image): image is NonNullable<typeof image> => image !== null),
    featureGroups: mapFeatureGroups(data['FeaturesGroups']),
  };
}
