/**
 * Company master data, kept in sync with the website (duratus-it-frontend/src/app/content/site.ts),
 * the customer portal and the knowledge base. Placeholder values are marked for replacement.
 */
export const COMPANY = {
  name: 'Duratus IT GmbH',
  claim: 'Beständig. Sicher. Ihr IT-Partner.',
  street: 'Airportpark 12',
  city: '48268 Greven',
  // TODO: Telefonnummer prüfen (Vorwahl 02351 gehört zu Lüdenscheid, nicht zu Greven).
  phone: '+49 2351 123 456',
  phoneHref: 'tel:+492351123456',
  email: 'info@duratus-it.de',
  shopEmail: 'shop@duratus-it.de',
  web: 'www.duratus-it.de',
  serviceHours: 'Mo bis Fr, 08:00 bis 18:00 Uhr',
  // TODO: echte Register- und Bankdaten eintragen.
  register: 'HRB 12345, Amtsgericht Steinfurt',
  vatId: 'DE123456789',
  bank: 'Musterbank · IBAN DE00 0000 0000 0000 0000 00 · BIC MUSTDE00',
} as const;

/** The website next door; the shop links back to it for services and consulting. */
export const WEBSITE = {
  home: 'https://www.duratus-it.de',
  managedServices: 'https://www.duratus-it.de/managed-services',
  configurator: 'https://www.duratus-it.de/konfigurator',
  contact: 'https://www.duratus-it.de/kontakt',
  portal: 'https://portal.duratus-it.de',
} as const;

export const VAT_RATE = 0.19;

/** Free shipping above this net order value. */
export const FREE_SHIPPING_FROM = 750;

/** Flat shipping rate (net) below the free-shipping threshold. */
export const SHIPPING_FLAT = 12.9;

/** Surcharge (net) for the express option. */
export const EXPRESS_SURCHARGE = 24.9;
