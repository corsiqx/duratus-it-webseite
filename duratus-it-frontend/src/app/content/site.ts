/** Company facts and navigation shared across pages. Placeholder values are marked for replacement. */

export const COMPANY = {
  name: 'Duratus IT GmbH',
  claim: 'Beständig. Sicher. Ihr IT-Partner.',
  street: 'Airportpark 12',
  city: '48268 Greven',
  locationNote: 'direkt am Flughafen Münster/Osnabrück (FMO)',
  // TODO: Telefonnummer prüfen (Vorwahl 02351 gehört zu Lüdenscheid, nicht zu Greven).
  phone: '+49 2351 123 456',
  phoneHref: 'tel:+492351123456',
  email: 'info@duratus-it.de',
  serviceHours: 'Mo bis Fr, 08:00 bis 18:00 Uhr',
  // TODO: echte Registerdaten eintragen.
  register: 'HRB 12345, Amtsgericht Steinfurt',
  vatId: 'DE123456789',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Airportpark+12+48268+Greven',
} as const;

export interface NavLink {
  label: string;
  path: string;
  description?: string;
  icon?: string;
}

export const SERVICE_NAV: readonly NavLink[] = [
  {
    label: 'Hardware Beschaffung',
    path: '/hardware-beschaffung',
    description: 'Hardware, abgestimmt auf den Betrieb',
    icon: 'phosphorPackage',
  },
  {
    label: 'Managed Services',
    path: '/managed-services',
    description: 'Automatisiert betrieben, monatlich abgerechnet',
    icon: 'phosphorGearSix',
  },
  {
    label: 'IT Consulting',
    path: '/it-consulting',
    description: 'Strategie, Projekte und IT-Security',
    icon: 'phosphorCompass',
  },
  {
    label: 'Konfigurator',
    path: '/konfigurator',
    description: 'Paket zusammenstellen, Preis sofort sehen',
    icon: 'phosphorSlidersHorizontal',
  },
  {
    label: 'OpenDesk',
    path: '/opendesk',
    description: 'Sichere Office-Suite für Verwaltung und Kommune',
    icon: 'phosphorBuildingOffice',
  },
];

export const COMPANY_NAV: readonly NavLink[] = [
  { label: 'Referenzen', path: '/referenzen' },
  { label: 'Über uns', path: '/ueber-uns' },
  { label: 'Karriere', path: '/karriere' },
];

/** Single label for the contact intent, used in header, heroes, banners and footer. */
export const CONTACT_CTA = 'Beratung anfragen';

export interface Pillar {
  title: string;
  path: string;
  icon: string;
  text: string;
  points: string[];
}

export const PILLARS: readonly Pillar[] = [
  {
    title: 'Managed Services',
    path: '/managed-services',
    icon: 'phosphorGearSix',
    text: 'Firewall, Cloud-Telefonie, Workstation, Server, Backup und das Rundum-Bundle Managed IT. Automatisiert betrieben, monatlich abgerechnet.',
    points: ['Monatlicher Fixpreis pro Einheit', 'Self-Service statt Warteschlange', 'Automatisiertes Monitoring rund um die Uhr'],
  },
  {
    title: 'Produkte',
    path: '/hardware-beschaffung',
    icon: 'phosphorPackage',
    text: 'Peripherie, Workplace, Networking, Security, Server und Storage. Bevorzugt im Bundle mit dem passenden Managed-Service-Paket.',
    points: ['Zertifizierte Hersteller und Distributoren', 'Leasing und Finanzierung möglich'],
  },
  {
    title: 'IT Consulting',
    path: '/it-consulting',
    icon: 'phosphorCompass',
    text: 'Strategie- und Projektberatung sowie IT-Security, von der Analyse bis zur Umsetzungsbegleitung.',
    points: ['Security-Assessment und NIS2-Gap-Analyse', 'Umsetzungsbegleitung vor Ort oder remote'],
  },
];
