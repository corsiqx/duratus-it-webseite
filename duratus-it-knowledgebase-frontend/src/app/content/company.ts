/**
 * Company master data, kept in sync with the website (duratus-it-frontend/src/app/content/site.ts).
 * Used in the invoice PDF.
 */
export const COMPANY = {
  name: 'Duratus IT GmbH',
  street: 'Airportpark 12',
  city: '48268 Greven',
  // TODO: Telefonnummer prüfen (Vorwahl 02351 gehört zu Lüdenscheid, nicht zu Greven).
  phone: '+49 2351 123 456',
  phoneHref: 'tel:+492351123456',
  email: 'info@duratus-it.de',
  web: 'www.duratus-it.de',
  serviceHours: 'Mo bis Fr, 08:00 bis 18:00 Uhr',
  // TODO: echte Register- und Bankdaten eintragen.
  register: 'HRB 12345, Amtsgericht Steinfurt',
  vatId: 'DE123456789',
  bank: 'Musterbank · IBAN DE00 0000 0000 0000 0000 00 · BIC MUSTDE00',
} as const;

/** VAT rate applied to invoices. */
export const VAT_RATE = 0.19;
