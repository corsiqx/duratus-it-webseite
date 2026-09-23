/**
 * Pricing model of the IT solutions configurator.
 * All prices are net monthly rates in EUR; setup fees are one-off.
 */

export type SiteKey = '1' | '2-3' | '>3';

export interface SiteOption {
  id: SiteKey;
  label: string;
  sub: string;
  /** Add-on prices scale with the number of sites. */
  multiplier: number;
}

export const SITE_OPTIONS: readonly SiteOption[] = [
  { id: '1', label: '1 Standort', sub: 'Zentraler Firmensitz', multiplier: 1 },
  { id: '2-3', label: '2 bis 3 Standorte', sub: 'Filialen und Niederlassungen', multiplier: 2.5 },
  { id: '>3', label: 'Mehr als 3 Standorte', sub: 'Standortverbund', multiplier: 4.5 },
];

export interface SupportTier {
  id: string;
  name: string;
  tagline: string;
  description: string;
  pricePerUser: number;
  icon: string;
  badge?: string;
}

export const SUPPORT_TIERS: readonly SupportTier[] = [
  {
    id: 'basis',
    name: 'Basis Monitoring',
    tagline: 'Nur Alarmierung',
    description:
      'Automatisierte Überwachung Ihrer Systeme rund um die Uhr mit sofortiger Alarmierung bei Störungen, ohne aktiven Anwender-Support.',
    pricePerUser: 9,
    icon: 'phosphorBell',
  },
  {
    id: 'sorglos',
    name: 'Sorglos Arbeitsplatz',
    tagline: 'Inklusive Helpdesk',
    description:
      'Alles aus Basis Monitoring, dazu ein persönlicher Helpdesk für alle Mitarbeitenden bei Fragen und Störungen im Arbeitsalltag.',
    pricePerUser: 24,
    icon: 'phosphorHeadset',
    badge: 'Häufig gewählt',
  },
  {
    id: 'premium',
    name: 'Premium Flatrate',
    tagline: 'Support rund um die Uhr mit Vor-Ort-Garantie',
    description:
      'Maximale Absicherung: Support zu jeder Zeit mit höchster Priorität und garantiertem Vor-Ort-Einsatz bei kritischen Störungen.',
    pricePerUser: 39,
    icon: 'phosphorCrown',
  },
];

export interface AddonModule {
  id: string;
  name: string;
  tag?: string;
  description: string;
  monthlyBase: number;
  setupBase: number;
  icon: string;
  /** Price is multiplied by the site factor. */
  scalesWithSites: boolean;
}

export const NETWORK_ADDONS: readonly AddonModule[] = [
  {
    id: 'networkGuard',
    name: 'Network Guard',
    tag: 'Sonde vor Ort',
    description:
      'Überwachung aller Router, Switches und Netzwerkgeräte rund um die Uhr. Erkennt Störungen und unbefugte Fremdgeräte in Echtzeit.',
    monthlyBase: 99,
    setupBase: 200,
    icon: 'phosphorNetwork',
    scalesWithSites: true,
  },
  {
    id: 'failoverInternet',
    name: 'Ausfallsicheres Internet',
    tag: 'LTE- und 5G-Backup',
    description:
      'Automatische Umschaltung auf ein mobiles Backup, sobald die Hauptleitung ausfällt. Ohne Unterbrechung im Tagesgeschäft.',
    monthlyBase: 49,
    setupBase: 0,
    icon: 'phosphorCellSignalFull',
    scalesWithSites: true,
  },
  {
    id: 'managedWifi',
    name: 'Managed Wi-Fi',
    description:
      'Einrichtung, Absicherung und laufende Optimierung Ihres WLANs, inklusive getrenntem Gästenetz.',
    monthlyBase: 39,
    setupBase: 0,
    icon: 'phosphorWifiHigh',
    scalesWithSites: true,
  },
];

export const SECURITY_ADDONS: readonly AddonModule[] = [
  {
    id: 'dsgvoMail',
    name: 'DSGVO- und Mail-Archivierung',
    description: 'Revisionssichere Archivierung Ihres gesamten E-Mail-Verkehrs nach GoBD und DSGVO.',
    monthlyBase: 120,
    setupBase: 0,
    icon: 'phosphorEnvelopeSimple',
    scalesWithSites: false,
  },
  {
    id: 'cyberResilience',
    name: 'Cyber-Resilience und Phishing-Schulung',
    description:
      'Simulierte Phishing-Angriffe und Awareness-Schulungen, die Ihr Team im Umgang mit Bedrohungen sicherer machen.',
    monthlyBase: 150,
    setupBase: 0,
    icon: 'phosphorShieldCheck',
    scalesWithSites: false,
  },
];

export const ALL_ADDONS: readonly AddonModule[] = [...NETWORK_ADDONS, ...SECURITY_ADDONS];

/** Bundle discount on the add-on total, by number of selected modules. */
export const BUNDLE_DISCOUNTS: readonly { minModules: number; percent: number }[] = [
  { minModules: 5, percent: 0.15 },
  { minModules: 4, percent: 0.12 },
  { minModules: 3, percent: 0.08 },
];

export const USER_RANGE = { min: 5, max: 100, default: 25 } as const;

/** One-off onboarding: base fee plus a per-workplace share. */
export const ONBOARDING = { base: 250, perUser: 10 } as const;

export const VAT_RATE = 0.19;
