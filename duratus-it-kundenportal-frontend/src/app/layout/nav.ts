export type NavBadge = 'tickets' | 'offers' | 'invoices';

export interface PortalNavItem {
  label: string;
  path: string;
  icon: string;
  /** Counter shown next to the label when the area needs attention. */
  badge?: NavBadge;
}

export interface PortalNavGroup {
  label: string | null;
  items: readonly PortalNavItem[];
}

/** Sidebar structure. Paths match app.routes.ts. */
export const PORTAL_NAV: readonly PortalNavGroup[] = [
  {
    label: null,
    items: [{ label: 'Übersicht', path: '/uebersicht', icon: 'phosphorSquaresFour' }],
  },
  {
    label: 'Service',
    items: [
      { label: 'Tickets', path: '/tickets', icon: 'phosphorLifebuoy', badge: 'tickets' },
      { label: 'Meine IT', path: '/meine-it', icon: 'phosphorDesktop' },
      { label: 'Arbeitsnachweise', path: '/arbeitsnachweise', icon: 'phosphorClipboardText' },
    ],
  },
  {
    label: 'Verträge und Finanzen',
    items: [
      { label: 'Angebote', path: '/angebote', icon: 'phosphorSignature', badge: 'offers' },
      { label: 'Verträge', path: '/vertraege', icon: 'phosphorShieldCheck' },
      { label: 'E-Rechnungen', path: '/rechnungen', icon: 'phosphorReceipt', badge: 'invoices' },
      { label: 'Zahlungsinformationen', path: '/zahlungsinformationen', icon: 'phosphorCreditCard' },
    ],
  },
];
