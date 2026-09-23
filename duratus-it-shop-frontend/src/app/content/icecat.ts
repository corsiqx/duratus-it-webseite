/**
 * Settings for the Icecat product data service.
 *
 * Icecat (https://icecat.biz) delivers manufacturer data: title, model name, EAN, description and
 * product photos. Two levels exist:
 *
 * - **Open Icecat** – free, works with the demo user `openIcecat-live`, covers the brands that
 *   sponsor Icecat (here: Dell, APC, Yealink, Jabra). No registration needed.
 * - **Full Icecat** – paid; covers the remaining brands (HPE, Cisco, Fortinet, Sophos, Ubiquiti,
 *   Huawei, Microsoft, Veeam, 3CX). Without a key those articles answer with HTTP 403; the shop then
 *   falls back to the local illustration and the catalogue text.
 *
 * The key is not compiled in: it is entered once under `/konto` and kept in localStorage. That is fine
 * for this demo but **not** for production — an app key in the browser is readable by everyone.
 * → Wiki: offene-punkte (der Aufruf gehört hinter einen eigenen Endpunkt mit Serverteil und Cache).
 */
export const ICECAT = {
  endpoint: 'https://live.icecat.biz/api',
  /** Demo account of Open Icecat, documented publicly by Icecat. */
  userName: 'openIcecat-live',
  language: 'DE',
  /** Cache lifetime for a successful lookup. */
  cacheHours: 24 * 7,
  /**
   * Cache lifetime for "locked" and "not found". A missing product code or a missing subscription
   * does not change overnight, so this is deliberately long; entering an app key clears the cache.
   */
  negativeCacheHours: 24 * 7,
  /** How many lookups may run at the same time. */
  maxParallel: 4,
  /** Request timeout in milliseconds. */
  timeoutMs: 8000,
  docs: 'https://iceclog.com/manual-for-icecat-json-product-requests/',
  signUp: 'https://icecat.biz/registration',
} as const;
