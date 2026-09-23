import { IcecatRef } from '../data/icecat.models';
import { vendorById } from './vendors';

/**
 * Catalogue of the Duratus IT shop.
 *
 * **Echte Artikel, Demo-Preise.** Hersteller, Modellbezeichnung und Artikelnummer sind echt und
 * gegen Icecat geprüft (jede Nummer liefert dort entweder Daten oder „existiert, Zugang gesperrt“).
 * Bezeichnung, EAN, Beschreibung und Produktbild holt `IcecatService` zur Laufzeit nach.
 * **Preise, Bestände und Lieferzeiten sind Beispieldaten** und kommen im Echtbetrieb aus den
 * Preislisten der Distributoren.
 *
 * Statische `specs` und `highlights` sind der Rückfall, solange Icecat nichts liefert; sie stammen
 * aus den Datenblättern der Hersteller.
 *
 * Markenrechtliche Freigabe der Herstellernamen und Logos ist weiterhin offen → Wiki: offene-punkte.
 */

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  text: string;
  /** Illustration in public/artikel used as the category tile. */
  art: string;
  /** Matching managed service line on the website. */
  serviceId: string;
  serviceLabel: string;
}

export const CATEGORIES: readonly Category[] = [
  {
    id: 'arbeitsplatz',
    slug: 'arbeitsplatz',
    name: 'Arbeitsplatz',
    icon: 'phosphorLaptop',
    tagline: 'Notebooks, Thin Clients',
    text: 'Geräte für den täglichen Betrieb. Notebooks und Desktops von Dell sind Konfigurationsgeräte: Ausstattung und Preis stimmen wir im Angebot ab, Thin Clients und Surface-Geräte gibt es ab Lager.',
    art: 'notebook',
    serviceId: 'workstation',
    serviceLabel: 'Managed Workstation',
  },
  {
    id: 'peripherie',
    slug: 'peripherie',
    name: 'Peripherie',
    icon: 'phosphorMonitor',
    tagline: 'Monitore, Docks, Telefone',
    text: 'Alles rund um den Arbeitsplatz. Gleiche Modelle im Rollout halten Ersatzteilbestand und Support einfach.',
    art: 'monitor',
    serviceId: 'workstation',
    serviceLabel: 'Managed Workstation',
  },
  {
    id: 'netzwerk',
    slug: 'netzwerk',
    name: 'Netzwerk',
    icon: 'phosphorNetwork',
    tagline: 'Switches, Access Points, Gateways',
    text: 'Verkabelt und per Funk, von Aruba Instant On über Cisco und UniFi bis Huawei eKitEngine. Alle Reihen lassen sich zentral verwalten und überwachen.',
    art: 'switch',
    serviceId: 'firewall',
    serviceLabel: 'Managed Firewall',
  },
  {
    id: 'sicherheit',
    slug: 'sicherheit',
    name: 'Sicherheit',
    icon: 'phosphorShieldCheck',
    tagline: 'Firewalls von Fortinet und Sophos',
    text: 'Der Übergang ins Internet, mit Wartung und Sicherheitsabo. Ohne gültiges Abo prüft eine Firewall keine aktuellen Bedrohungen mehr, deshalb gehört beides zusammen.',
    art: 'firewall',
    serviceId: 'firewall',
    serviceLabel: 'Managed Firewall',
  },
  {
    id: 'server',
    slug: 'server',
    name: 'Server',
    icon: 'phosphorHardDrives',
    tagline: 'Rack-Server, Stromversorgung',
    text: 'Server für Rack und Serverraum, inklusive unterbrechungsfreier Stromversorgung. Konfigurationen stimmen wir vor der Bestellung ab.',
    art: 'server-rack',
    serviceId: 'server',
    serviceLabel: 'Managed Server',
  },
  {
    id: 'speicher',
    slug: 'speicher-und-backup',
    name: 'Speicher und Backup',
    icon: 'phosphorDatabase',
    tagline: 'Veeam-Lizenzen, Sicherungsziele',
    text: 'Die Sicherungssoftware und ihre Lizenzen. Speicherhardware stimmen wir auf Ihr Sicherungskonzept ab und legen sie ins Angebot.',
    art: 'backup-appliance',
    serviceId: 'backup',
    serviceLabel: 'Managed Backup',
  },
  {
    id: 'software',
    slug: 'software-und-lizenzen',
    name: 'Software und Lizenzen',
    icon: 'phosphorCertificate',
    tagline: 'Microsoft 365, 3CX',
    text: 'Monatliche und jährliche Lizenzen. Werden auf Ihrer Sammelrechnung geführt statt einzeln abgebucht.',
    art: 'license',
    serviceId: 'managed-it',
    serviceLabel: 'Managed IT',
  },
];

export const categoryBySlug = (slug: string): Category | undefined => CATEGORIES.find((c) => c.slug === slug);
export const categoryById = (id: string): Category | undefined => CATEGORIES.find((c) => c.id === id);

export type Availability = 'lager' | 'bestellware' | 'lieferzeit' | 'anfrage';

export type Badge = 'neu' | 'aktion' | 'bestseller' | 'auslauf';

export interface SpecRow {
  label: string;
  value: string;
}

/** Volume pricing: from `qty` pieces the unit price drops to `price`. */
export interface PriceTier {
  qty: number;
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  /** Model designation as the manufacturer writes it. */
  name: string;
  /** Configuration line shown under the name. */
  subtitle: string;
  /** Key into VENDORS. */
  vendorId: string;
  /** Display name of the manufacturer, derived from the vendor. */
  manufacturer: string;
  categoryId: string;
  /** Manufacturer part number; also the Icecat product code. Empty for configured articles. */
  mpn: string;
  /** EAN, when known. Icecat is asked by GTIN then, which is the most precise lookup. */
  gtin?: string;
  /** Illustration in public/artikel, used until an Icecat photo is there and as the fallback. */
  art: string;
  /** Net unit price in euro. Demo value. */
  price: number;
  /** Former net price, shown struck through when set. */
  listPrice?: number;
  availability: Availability;
  /** Pieces on stock; only meaningful for `lager`. */
  stock?: number;
  /** Working days until delivery. */
  leadDays: number;
  badges: readonly Badge[];
  text: string;
  highlights: readonly string[];
  specs: readonly SpecRow[];
  tiers?: readonly PriceTier[];
  /** Monthly licence: own monthly total, never shipped. */
  recurring?: boolean;
  /** Licence or subscription billed once (per year): invoiced, not shipped. */
  digital?: boolean;
  /** Unit shown next to the price. */
  unit?: string;
  /** Only available as a written quote (configured article or project business). */
  quoteOnly?: boolean;
  /** Extra sentence linking the article to its managed service line. */
  serviceHint?: string;
  /** Additional words the search should match. */
  tags: readonly string[];
}

type ProductInput = Omit<Product, 'manufacturer'>;

const P = (product: ProductInput): Product => ({
  ...product,
  manufacturer: vendorById(product.vendorId)?.name ?? product.vendorId,
});

export const PRODUCTS: readonly Product[] = [
  // ---------------------------------------------------------------- Arbeitsplatz
  P({
    id: 'ms-surface-laptop-6',
    slug: 'microsoft-surface-laptop-6-for-business',
    name: 'Surface Laptop 6 for Business',
    subtitle: 'Intel Core Ultra 7 165H · Windows 11 Pro',
    vendorId: 'microsoft',
    categoryId: 'arbeitsplatz',
    mpn: 'ZKB-00005',
    art: 'notebook',
    price: 1899,
    availability: 'bestellware',
    leadDays: 10,
    badges: ['neu'],
    text: 'Das Gerät für Rollen, die viel unterwegs sind. Mit dem Core Ultra bringt es eine eigene Recheneinheit für KI-Funktionen mit, die Windows 11 lokal statt in der Cloud nutzt. Kommt vorbereitet für die automatische Einrichtung über Autopilot, sodass der erste Start beim Anwender ohne Technikertermin funktioniert.',
    highlights: [
      'Vorbereitet für automatische Einrichtung über Windows Autopilot',
      'Intel Core Ultra mit eigener Einheit für KI-Funktionen',
      'Geschäftsvariante mit verlängerter Verfügbarkeit und Austauschservice',
    ],
    specs: [
      { label: 'Prozessor', value: 'Intel Core Ultra 7 165H' },
      { label: 'Betriebssystem', value: 'Windows 11 Pro' },
      { label: 'Bauform', value: 'Notebook, Touchdisplay' },
      { label: 'Verwaltung', value: 'Autopilot, Intune, Entra ID' },
    ],
    serviceHint: 'Mit Managed Workstation kommt das Gerät eingerichtet, überwacht und mit Patchstand beim Anwender an.',
    tags: ['notebook', 'laptop', 'surface', 'mobil', 'windows', 'autopilot'],
  }),
  P({
    id: 'dell-latitude-5450',
    slug: 'dell-latitude-5450-konfiguration',
    name: 'Latitude 5450',
    subtitle: '14 Zoll · Konfiguration nach Bedarf',
    vendorId: 'dell',
    categoryId: 'arbeitsplatz',
    mpn: '',
    art: 'notebook',
    price: 1090,
    availability: 'anfrage',
    leadDays: 15,
    badges: ['bestseller'],
    quoteOnly: true,
    text: 'Das Standardnotebook im Büro. Die Latitude-Reihe wird als Konfiguration gefertigt: Prozessor, Arbeitsspeicher, Laufwerk, Mobilfunk und Garantielaufzeit legen wir gemeinsam fest, deshalb gibt es hier keinen festen Preis. Wir liefern eine Empfehlung für Ihre Standardausstattung mit, damit alle Geräte gleich bleiben.',
    highlights: [
      'Konfiguration und Preis kommen als Angebot, meist innerhalb eines Arbeitstags',
      'Einheitliche Standardausstattung für den ganzen Rollout',
      'Vor-Ort-Service wahlweise 3 oder 5 Jahre',
    ],
    specs: [
      { label: 'Baureihe', value: 'Dell Latitude 5000' },
      { label: 'Display', value: '14 Zoll' },
      { label: 'Konfigurierbar', value: 'Prozessor, RAM, SSD, Mobilfunk, Garantie' },
      { label: 'Bestellweg', value: 'Angebot mit Dell-Konfigurationscode' },
    ],
    serviceHint: 'Wir nehmen das Gerät direkt in die Managed Workstation auf.',
    tags: ['notebook', 'laptop', 'latitude', 'dell', 'konfiguration', 'cto'],
  }),
  P({
    id: 'dell-optiplex-7020',
    slug: 'dell-optiplex-7020-micro-konfiguration',
    name: 'OptiPlex 7020 Micro',
    subtitle: 'Kompakter Desktop · Konfiguration nach Bedarf',
    vendorId: 'dell',
    categoryId: 'arbeitsplatz',
    mpn: '',
    art: 'desktop',
    price: 760,
    availability: 'anfrage',
    leadDays: 15,
    badges: [],
    quoteOnly: true,
    text: 'Der feste Arbeitsplatz ohne Akku: passt hinter den Monitor oder unter den Tisch. Wie die Latitude-Reihe ein Konfigurationsgerät, das wir passend zur vorhandenen Ausstattung anbieten.',
    highlights: ['Passt hinter den Monitor oder unter den Tisch', 'Leiser Betrieb für offene Büroflächen', 'Konfiguration im Angebot abgestimmt'],
    specs: [
      { label: 'Baureihe', value: 'Dell OptiPlex 7020' },
      { label: 'Bauform', value: 'Micro' },
      { label: 'Konfigurierbar', value: 'Prozessor, RAM, SSD, Garantie' },
      { label: 'Bestellweg', value: 'Angebot mit Dell-Konfigurationscode' },
    ],
    serviceHint: 'Feste Arbeitsplätze laufen in derselben Managed-Workstation-Linie wie die Notebooks.',
    tags: ['desktop', 'pc', 'optiplex', 'micro', 'buero', 'konfiguration'],
  }),
  P({
    id: 'dell-wyse-5070',
    slug: 'dell-wyse-5070-thin-client',
    name: 'Wyse 5070',
    subtitle: 'Thin Client · für Terminalserver und virtuelle Arbeitsplätze',
    vendorId: 'dell',
    categoryId: 'arbeitsplatz',
    mpn: 'Wyse 5070',
    art: 'thin-client',
    price: 529,
    availability: 'lager',
    stock: 18,
    leadDays: 3,
    badges: [],
    text: 'Für Arbeitsplätze, die nur eine Sitzung auf dem Server öffnen: keine lokalen Daten, nichts, was gesichert werden müsste. Robust genug für Werkstatt, Lager und Schichtbetrieb.',
    highlights: ['Keine lokalen Daten auf dem Gerät', 'Zentrale Verwaltung über Wyse Management Suite', 'Mehrere Monitore möglich'],
    specs: [
      { label: 'Bauform', value: 'Thin Client, Desktop' },
      { label: 'Einsatz', value: 'Terminalserver, VDI, Cloud-Arbeitsplatz' },
      { label: 'Verwaltung', value: 'Wyse Management Suite' },
    ],
    tiers: [
      { qty: 10, price: 505 },
      { qty: 25, price: 485 },
    ],
    serviceHint: 'Thin Clients zählen in der Managed Workstation als vollwertiger Arbeitsplatz.',
    tags: ['thin client', 'wyse', 'vdi', 'terminal', 'lager', 'werkstatt'],
  }),
  P({
    id: 'dell-wyse-3040',
    slug: 'dell-wyse-3040-thin-client',
    name: 'Wyse 3040',
    subtitle: 'Thin Client · lüfterlos · kleinste Bauform',
    vendorId: 'dell',
    categoryId: 'arbeitsplatz',
    mpn: 'Wyse 3040',
    art: 'thin-client',
    price: 289,
    availability: 'lager',
    stock: 31,
    leadDays: 3,
    badges: [],
    text: 'Der kleinste Thin Client der Reihe: lüfterlos, damit auch in staubiger Umgebung und in Räumen, in denen es leise bleiben muss. Reicht für Terminalsitzungen und Weboberflächen.',
    highlights: ['Lüfterlos und lautlos', 'Sehr kleine Bauform, Halterung hinter dem Monitor möglich', 'Geringer Stromverbrauch'],
    specs: [
      { label: 'Bauform', value: 'Thin Client, lüfterlos' },
      { label: 'Einsatz', value: 'Terminalsitzung, Weboberflächen' },
      { label: 'Verwaltung', value: 'Wyse Management Suite' },
    ],
    tiers: [{ qty: 25, price: 269 }],
    tags: ['thin client', 'wyse', 'luefterlos', 'klein', 'vdi'],
  }),

  // ---------------------------------------------------------------- Peripherie
  P({
    id: 'dell-p2425h',
    slug: 'dell-pro-plus-p2425h',
    name: 'Pro Plus P2425H',
    subtitle: '24 Zoll · Full HD · höhenverstellbar',
    vendorId: 'dell',
    categoryId: 'peripherie',
    mpn: 'P2425H',
    gtin: '5715063490587',
    art: 'monitor',
    price: 219,
    availability: 'lager',
    stock: 64,
    leadDays: 2,
    badges: ['bestseller'],
    text: 'Der Standardmonitor für zwei Bildschirme pro Platz. Höhenverstellbar und drehbar, damit der Arbeitsplatz zur Person passt und nicht umgekehrt.',
    highlights: ['Höhen-, neigungs- und drehbar verstellbar', 'Entspiegeltes Panel für helle Büros', 'Austauschservice inklusive Pixelfehlergarantie'],
    specs: [
      { label: 'Diagonale', value: '61 cm (24 Zoll)' },
      { label: 'Auflösung', value: '1920 × 1080 (Full HD)' },
      { label: 'Panel', value: 'LCD, entspiegelt' },
      { label: 'Farbe', value: 'Schwarz' },
    ],
    tiers: [
      { qty: 10, price: 209 },
      { qty: 25, price: 199 },
      { qty: 50, price: 189 },
    ],
    tags: ['monitor', 'bildschirm', 'display', '24 zoll', 'full hd'],
  }),
  P({
    id: 'dell-p2425he',
    slug: 'dell-pro-plus-p2425he',
    name: 'Pro Plus P2425HE',
    subtitle: '24 Zoll · Full HD · USB-C mit Netzwerkanschluss',
    vendorId: 'dell',
    categoryId: 'peripherie',
    mpn: 'P2425HE',
    gtin: '5715063427316',
    art: 'monitor',
    price: 289,
    availability: 'lager',
    stock: 27,
    leadDays: 2,
    badges: [],
    text: 'Ein Kabel für Bild, Netzwerk, Zubehör und Strom: dieser Monitor ersetzt die Dockingstation. Spart am Arbeitsplatz ein Gerät und im Support eine Fehlerquelle.',
    highlights: ['Ersetzt die Dockingstation über ein USB-C-Kabel', 'Netzwerkanschluss im Monitor eingebaut', 'Monitore lassen sich in Reihe schalten'],
    specs: [
      { label: 'Diagonale', value: '61 cm (24 Zoll)' },
      { label: 'Auflösung', value: '1920 × 1080 (Full HD)' },
      { label: 'Anschluss', value: 'USB-C mit Stromversorgung, LAN' },
      { label: 'Farbe', value: 'Schwarz' },
    ],
    tiers: [
      { qty: 10, price: 275 },
      { qty: 25, price: 265 },
    ],
    tags: ['monitor', 'usb-c', 'dock', 'netzwerk', '24 zoll'],
  }),
  P({
    id: 'dell-u2724d',
    slug: 'dell-ultrasharp-u2724d',
    name: 'UltraSharp U2724D',
    subtitle: '27 Zoll · Quad HD · USB-C',
    vendorId: 'dell',
    categoryId: 'peripherie',
    mpn: 'U2724D',
    gtin: '5715063346402',
    art: 'monitor',
    price: 469,
    availability: 'lager',
    stock: 16,
    leadDays: 2,
    badges: [],
    text: 'Mehr Fläche für Tabellen, Konstruktion und geteilte Ansichten. Die UltraSharp-Reihe ist ab Werk farbkalibriert, was überall dort zählt, wo Farben verbindlich sind.',
    highlights: ['Ab Werk farbkalibriert', 'Quad HD auf 27 Zoll', 'Höhen-, neigungs- und drehbar verstellbar'],
    specs: [
      { label: 'Diagonale', value: '68,6 cm (27 Zoll)' },
      { label: 'Auflösung', value: '2560 × 1440 (Quad HD)' },
      { label: 'Panel', value: 'LCD (IPS Black)' },
      { label: 'Farbe', value: 'Schwarz, Silber' },
    ],
    tiers: [{ qty: 10, price: 449 }],
    tags: ['monitor', 'ultrasharp', '27 zoll', 'qhd', 'usb-c'],
  }),
  P({
    id: 'dell-p2723qe',
    slug: 'dell-p2723qe-4k',
    name: 'P2723QE',
    subtitle: '27 Zoll · 4K Ultra HD · USB-C',
    vendorId: 'dell',
    categoryId: 'peripherie',
    mpn: 'P2723QE',
    art: 'monitor',
    price: 529,
    availability: 'bestellware',
    leadDays: 8,
    badges: [],
    text: 'Für Arbeitsplätze mit viel Text oder feinen Zeichnungen: die vierfache Full-HD-Auflösung macht Schrift merklich ruhiger. Mit USB-C auch als Dock nutzbar.',
    highlights: ['4K auf 27 Zoll', 'USB-C mit Stromversorgung für das Notebook', 'Netzwerkanschluss im Monitor'],
    specs: [
      { label: 'Diagonale', value: '68,6 cm (27 Zoll)' },
      { label: 'Auflösung', value: '3840 × 2160 (4K Ultra HD)' },
      { label: 'Anschluss', value: 'USB-C, DisplayPort, HDMI, LAN' },
      { label: 'Farbe', value: 'Schwarz, Silber' },
    ],
    tags: ['monitor', '4k', '27 zoll', 'usb-c', 'dock'],
  }),
  P({
    id: 'dell-c2422he',
    slug: 'dell-c2422he-videokonferenz',
    name: 'C2422HE',
    subtitle: '24 Zoll · Full HD · Kamera und Mikrofon eingebaut',
    vendorId: 'dell',
    categoryId: 'peripherie',
    mpn: 'C2422HE',
    gtin: '5704174823001',
    art: 'monitor',
    price: 379,
    availability: 'lager',
    stock: 9,
    leadDays: 3,
    badges: [],
    text: 'Monitor mit eingebauter Kamera, Mikrofon und Lautsprechern. Für Besprechungsräume und Arbeitsplätze, an denen viel per Video gesprochen wird, spart er drei Einzelgeräte und deren Kabel.',
    highlights: ['Kamera, Mikrofon und Lautsprecher eingebaut', 'Für Videokonferenzsysteme zertifiziert', 'USB-C mit Stromversorgung und Netzwerk'],
    specs: [
      { label: 'Diagonale', value: '60,5 cm (23,8 Zoll)' },
      { label: 'Auflösung', value: '1920 × 1080 (Full HD)' },
      { label: 'Ausstattung', value: 'Kamera, Mikrofon, Lautsprecher' },
      { label: 'Anschluss', value: 'USB-C, LAN' },
    ],
    tags: ['monitor', 'videokonferenz', 'kamera', 'teams', 'besprechung'],
  }),
  P({
    id: 'dell-wd22tb4',
    slug: 'dell-thunderbolt-dock-wd22tb4',
    name: 'Thunderbolt Dock WD22TB4',
    subtitle: 'Dockingstation · Thunderbolt 4 · 130 W',
    vendorId: 'dell',
    categoryId: 'peripherie',
    mpn: 'DELL-WD22TB4',
    gtin: '5397184635629',
    art: 'dock',
    price: 279,
    availability: 'lager',
    stock: 22,
    leadDays: 2,
    badges: [],
    text: 'Ein Kabel am Platz: Notebook andocken, Monitore, Netzwerk und Zubehör sind verbunden. Die Firmware lässt sich zentral aktualisieren, das erspart den Gang zu jedem Schreibtisch.',
    highlights: ['Thunderbolt 4 für mehrere Monitore', 'Firmware zentral aktualisierbar', 'Netzwerkanschluss mit MAC-Adressdurchreichung'],
    specs: [
      { label: 'Anschluss', value: 'Thunderbolt 4 (USB-C)' },
      { label: 'Ladeleistung', value: '130 W an das Notebook' },
      { label: 'Netzwerk', value: 'Ethernet mit MAC-Adressdurchreichung' },
    ],
    tiers: [{ qty: 10, price: 265 }],
    tags: ['dock', 'docking', 'thunderbolt', 'usb-c', 'arbeitsplatz'],
  }),
  P({
    id: 'dell-wd19s',
    slug: 'dell-dockingstation-wd19s-130w',
    name: 'Dockingstation WD19S',
    subtitle: 'USB-C · 130 W',
    vendorId: 'dell',
    categoryId: 'peripherie',
    mpn: 'DELL-WD19S130W',
    gtin: '5397184513972',
    art: 'dock',
    price: 199,
    availability: 'lager',
    stock: 35,
    leadDays: 2,
    badges: [],
    text: 'Die günstigere Dockingstation ohne Thunderbolt. Reicht für zwei Monitore und das übliche Zubehör und passt zu allen Notebooks mit USB-C.',
    highlights: ['Passt zu jedem Notebook mit USB-C', 'Firmware zentral aktualisierbar', 'Abnehmbares Modulkabel'],
    specs: [
      { label: 'Anschluss', value: 'USB-C' },
      { label: 'Ladeleistung', value: '130 W an das Notebook' },
      { label: 'Netzwerk', value: 'Ethernet' },
    ],
    tiers: [
      { qty: 10, price: 189 },
      { qty: 25, price: 179 },
    ],
    tags: ['dock', 'docking', 'usb-c', 'wd19s'],
  }),
  P({
    id: 'dell-km3322w',
    slug: 'dell-km3322w-tastatur-maus-set',
    name: 'KM3322W',
    subtitle: 'Tastatur- und Maus-Set · kabellos',
    vendorId: 'dell',
    categoryId: 'peripherie',
    mpn: 'KM3322W',
    art: 'keyboard',
    price: 39,
    availability: 'lager',
    stock: 120,
    leadDays: 2,
    badges: [],
    text: 'Leises Set für offene Büros. Tastatur und Maus melden sich an einem Empfänger an, das hält die Anzahl belegter Anschlüsse klein.',
    highlights: ['Ein Empfänger für beide Geräte', 'Leise Tasten für offene Büroflächen', 'Lange Batterielaufzeit'],
    specs: [
      { label: 'Verbindung', value: 'Kabellos (2,4 GHz Empfänger)' },
      { label: 'Lieferumfang', value: 'Tastatur und Maus' },
      { label: 'Farbe', value: 'Schwarz' },
    ],
    tiers: [
      { qty: 25, price: 36 },
      { qty: 50, price: 33 },
    ],
    tags: ['tastatur', 'maus', 'eingabe', 'kabellos', 'set'],
  }),
  P({
    id: 'yealink-t43u',
    slug: 'yealink-sip-t43u',
    name: 'SIP-T43U',
    subtitle: 'Tischtelefon · 12 Leitungen · PoE',
    vendorId: 'yealink',
    categoryId: 'peripherie',
    mpn: 'T43U',
    gtin: '6938818304284',
    art: 'desk-phone',
    price: 129,
    availability: 'lager',
    stock: 26,
    leadDays: 3,
    badges: [],
    text: 'Das Arbeitstier unter den Tischtelefonen: für Empfang, Werkstatt und Pforte. Wird über das Netzwerkkabel mit Strom versorgt und meldet sich nach dem Anstecken an der 3CX-Anlage an.',
    highlights: ['Strom über das Netzwerkkabel (PoE)', 'Meldet sich selbst an der Anlage an', 'Zwei USB-Anschlüsse für Headset oder WLAN-Stick'],
    specs: [
      { label: 'Leitungen', value: '12' },
      { label: 'Display', value: 'LCD' },
      { label: 'Netzwerk', value: '2 × Ethernet, PoE' },
      { label: 'Farbe', value: 'Grau' },
    ],
    tiers: [{ qty: 10, price: 119 }],
    serviceHint: 'Passt zur Managed Cloud-Telefonie mit 3CX: Anlage, Rufnummern und Telefone aus einer Hand.',
    tags: ['telefon', 'voip', 'sip', 'yealink', '3cx', 'telefonie'],
  }),
  P({
    id: 'yealink-t46u',
    slug: 'yealink-sip-t46u',
    name: 'SIP-T46U',
    subtitle: 'Tischtelefon · Farbdisplay · PoE',
    vendorId: 'yealink',
    categoryId: 'peripherie',
    mpn: 'SIP-T46U',
    gtin: '6938818304314',
    art: 'desk-phone',
    price: 179,
    availability: 'lager',
    stock: 14,
    leadDays: 3,
    badges: [],
    text: 'Die größere Variante mit Farbdisplay, für Plätze mit vielen Rufnummern und Besetztlampenfeld. Gleiche Bedienung und gleiche Verwaltung wie das T43U.',
    highlights: ['Farbdisplay für Besetztlampenfeld', 'Erweiterungsmodule anschließbar', 'Strom über das Netzwerkkabel (PoE)'],
    specs: [
      { label: 'Display', value: 'LCD in Farbe' },
      { label: 'Netzwerk', value: '2 × Ethernet, PoE' },
      { label: 'Erweiterung', value: 'Tastenerweiterungsmodule' },
      { label: 'Farbe', value: 'Grau' },
    ],
    serviceHint: 'Passt zur Managed Cloud-Telefonie mit 3CX.',
    tags: ['telefon', 'voip', 'sip', 'yealink', 'chef', 'empfang'],
  }),

  // ---------------------------------------------------------------- Netzwerk
  P({
    id: 'aruba-1930-24g',
    slug: 'aruba-instant-on-1930-24g',
    name: 'Instant On 1930 24G',
    subtitle: '24 × Gigabit · 4 × SFP/SFP+ · verwaltet',
    vendorId: 'aruba',
    categoryId: 'netzwerk',
    mpn: 'JL682A',
    art: 'switch-24',
    price: 449,
    availability: 'lager',
    stock: 8,
    leadDays: 3,
    badges: [],
    text: 'Der Etagen-Switch ohne PoE, für Bereiche, in denen nur Rechner und Drucker hängen. Verwaltbar, VLAN-fähig und über die Instant-On-Oberfläche auch aus der Ferne zu überwachen.',
    highlights: ['4 Uplinks mit bis zu 10 GBit/s', 'VLAN, Link-Bündelung und Spanning Tree', 'Verwaltung über Weboberfläche oder App'],
    specs: [
      { label: 'Ports', value: '24 × 10/100/1000 Mbit/s' },
      { label: 'Uplinks', value: '4 × SFP/SFP+' },
      { label: 'Bauform', value: '19 Zoll, 1 Höheneinheit' },
      { label: 'Verwaltung', value: 'Instant On Weboberfläche und App' },
    ],
    serviceHint: 'Konfiguration, Überwachung und Firmwarestand übernimmt das Modul Network Guard.',
    tags: ['switch', 'aruba', 'instant on', '24 port', 'netzwerk'],
  }),
  P({
    id: 'aruba-1930-24g-poe',
    slug: 'aruba-instant-on-1930-24g-poe',
    name: 'Instant On 1930 24G PoE',
    subtitle: '24 × Gigabit PoE (195 W) · 4 × SFP/SFP+',
    vendorId: 'aruba',
    categoryId: 'netzwerk',
    mpn: 'JL683A',
    art: 'switch-24-poe',
    price: 699,
    availability: 'lager',
    stock: 6,
    leadDays: 3,
    badges: ['bestseller'],
    text: 'Der Etagen-Switch, der Access Points, Telefone und Kameras gleich mit Strom versorgt. 195 W reichen in der Praxis für eine komplette Etage.',
    highlights: ['195 W PoE-Budget für Access Points, Telefone und Kameras', '4 Uplinks mit bis zu 10 GBit/s', 'Verwaltung über Weboberfläche oder App'],
    specs: [
      { label: 'Ports', value: '24 × 10/100/1000 Mbit/s mit PoE Klasse 4' },
      { label: 'PoE-Budget', value: '195 W' },
      { label: 'Uplinks', value: '4 × SFP/SFP+' },
      { label: 'Bauform', value: '19 Zoll, 1 Höheneinheit' },
    ],
    serviceHint: 'Im Network Guard überwachen wir PoE-Auslastung und Portfehler mit.',
    tags: ['switch', 'poe', 'aruba', 'instant on', '24 port'],
  }),
  P({
    id: 'aruba-ap22',
    slug: 'aruba-instant-on-ap22',
    name: 'Instant On AP22',
    subtitle: 'Access Point · Wi-Fi 6 · Deckenmontage',
    vendorId: 'aruba',
    categoryId: 'netzwerk',
    mpn: 'R4W02A',
    art: 'access-point',
    price: 149,
    availability: 'lager',
    stock: 34,
    leadDays: 3,
    badges: [],
    text: 'Deckenmontage, Strom über das Netzwerkkabel, Konfiguration zentral. Gäste und Mitarbeitende landen in getrennten Netzen, ohne dass dafür ein zweites Gerät gebraucht wird.',
    highlights: ['Getrennte Netze für Gäste und Mitarbeitende', 'Strom über das Netzwerkkabel (PoE)', 'Deckenhalterung im Lieferumfang'],
    specs: [
      { label: 'Standard', value: 'Wi-Fi 6 (802.11ax)' },
      { label: 'Bauform', value: 'Innenbereich, Decke oder Wand' },
      { label: 'Stromversorgung', value: 'PoE oder Netzteil' },
      { label: 'Verwaltung', value: 'Instant On Weboberfläche und App' },
    ],
    tiers: [
      { qty: 5, price: 142 },
      { qty: 15, price: 135 },
    ],
    serviceHint: 'Im Modul Managed Wi-Fi betreiben wir die Funkabdeckung inklusive Gastnetz und Kanalplanung.',
    tags: ['wlan', 'wifi 6', 'access point', 'aruba', 'instant on', 'gastnetz'],
  }),
  P({
    id: 'cisco-c1300-24p',
    slug: 'cisco-catalyst-1300-24p-4g',
    name: 'Catalyst 1300 24P',
    subtitle: '24 × Gigabit PoE+ · 4 × SFP',
    vendorId: 'cisco',
    categoryId: 'netzwerk',
    mpn: 'C1300-24P-4G',
    art: 'switch-24-poe',
    price: 1290,
    availability: 'bestellware',
    leadDays: 12,
    badges: [],
    text: 'Wenn im Haus bereits Cisco läuft oder eine Ausschreibung Cisco verlangt: verwaltbarer Switch mit PoE+, statischem Routing und den gewohnten Werkzeugen.',
    highlights: ['PoE+ auf allen Kupferports', 'Layer-3-Funktionen für getrennte Netze', 'Verwaltung über Weboberfläche, Kommandozeile oder Cloud'],
    specs: [
      { label: 'Ports', value: '24 × 10/100/1000 Mbit/s mit PoE+' },
      { label: 'Uplinks', value: '4 × SFP' },
      { label: 'Bauform', value: '19 Zoll, 1 Höheneinheit' },
      { label: 'Reihe', value: 'Cisco Catalyst 1300' },
    ],
    serviceHint: 'Läuft im Network Guard wie die übrigen Reihen mit.',
    tags: ['switch', 'cisco', 'catalyst', 'poe', '24 port'],
  }),
  P({
    id: 'cisco-c1300-8t',
    slug: 'cisco-catalyst-1300-8t-e-2g',
    name: 'Catalyst 1300 8T-E',
    subtitle: '8 × Gigabit · 2 × Uplink · lüfterlos',
    vendorId: 'cisco',
    categoryId: 'netzwerk',
    mpn: 'C1300-8T-E-2G',
    art: 'switch-8',
    price: 349,
    availability: 'bestellware',
    leadDays: 12,
    badges: [],
    text: 'Der kleine Bruder für Nebenräume, Baustellenbüros und Außenstellen: lüfterlos und damit leise genug für einen Raum, in dem gearbeitet wird.',
    highlights: ['Lüfterlos und lautlos', 'Gleiche Verwaltung wie die großen Modelle', 'Wand- oder Rackmontage'],
    specs: [
      { label: 'Ports', value: '8 × 10/100/1000 Mbit/s' },
      { label: 'Uplinks', value: '2 × Gigabit' },
      { label: 'Kühlung', value: 'Passiv, ohne Lüfter' },
      { label: 'Reihe', value: 'Cisco Catalyst 1300' },
    ],
    tags: ['switch', 'cisco', 'catalyst', 'klein', 'luefterlos'],
  }),
  P({
    id: 'unifi-u6-pro',
    slug: 'unifi-u6-pro-access-point',
    name: 'U6 Pro',
    subtitle: 'Access Point · Wi-Fi 6 · Deckenmontage',
    vendorId: 'unifi',
    categoryId: 'netzwerk',
    mpn: 'U6-Pro',
    art: 'access-point',
    price: 179,
    availability: 'lager',
    stock: 21,
    leadDays: 3,
    badges: ['bestseller'],
    text: 'Der meistverbaute Access Point der UniFi-Reihe. Wird über den UniFi-Controller verwaltet, der auch Switches und Gateway mitführt, sodass es für das ganze Netz eine Oberfläche gibt.',
    highlights: ['Eine Oberfläche für Access Points, Switches und Gateway', 'Strom über das Netzwerkkabel (PoE)', 'Deckenhalterung im Lieferumfang'],
    specs: [
      { label: 'Standard', value: 'Wi-Fi 6 (802.11ax)' },
      { label: 'Bauform', value: 'Innenbereich, Decke oder Wand' },
      { label: 'Stromversorgung', value: 'PoE' },
      { label: 'Verwaltung', value: 'UniFi Network' },
    ],
    tiers: [
      { qty: 5, price: 172 },
      { qty: 15, price: 165 },
    ],
    serviceHint: 'Im Modul Managed Wi-Fi betreiben wir Controller, Gastnetz und Kanalplanung.',
    tags: ['wlan', 'wifi 6', 'access point', 'unifi', 'ubiquiti'],
  }),
  P({
    id: 'unifi-usw-lite-8-poe',
    slug: 'unifi-switch-lite-8-poe',
    name: 'Switch Lite 8 PoE',
    subtitle: '8 × Gigabit · 4 × PoE+ · lüfterlos',
    vendorId: 'unifi',
    categoryId: 'netzwerk',
    mpn: 'USW-Lite-8-PoE',
    art: 'switch-8-poe',
    price: 119,
    availability: 'lager',
    stock: 29,
    leadDays: 3,
    badges: [],
    text: 'Kleiner verwalteter Switch mit vier PoE-Ports, genug für zwei Access Points und zwei Telefone. Lüfterlos, deshalb auch für Besprechungsräume geeignet.',
    highlights: ['4 Ports mit PoE+ für Access Points und Telefone', 'Lüfterlos und lautlos', 'Verwaltung im UniFi-Controller'],
    specs: [
      { label: 'Ports', value: '8 × 10/100/1000 Mbit/s' },
      { label: 'PoE', value: '4 × PoE+' },
      { label: 'Kühlung', value: 'Passiv, ohne Lüfter' },
      { label: 'Verwaltung', value: 'UniFi Network' },
    ],
    tags: ['switch', 'unifi', 'poe', 'klein', 'ubiquiti'],
  }),
  P({
    id: 'unifi-ucg-ultra',
    slug: 'unifi-cloud-gateway-ultra',
    name: 'Cloud Gateway Ultra',
    subtitle: 'Gateway mit UniFi-Controller · für kleine Standorte',
    vendorId: 'unifi',
    categoryId: 'netzwerk',
    mpn: 'UCG-Ultra',
    art: 'gateway',
    price: 149,
    availability: 'lager',
    stock: 11,
    leadDays: 3,
    badges: ['neu'],
    text: 'Gateway und Controller in einem Gerät: übernimmt Routing, Firewall-Grundfunktionen und die Verwaltung der UniFi-Geräte. Für kleine Standorte die einfachste Art, ein UniFi-Netz zu betreiben.',
    highlights: ['UniFi-Controller ist eingebaut, kein zweiter Server nötig', 'VPN zu weiteren Standorten', 'Verwaltet bis zu einer üblichen Filialgröße'],
    specs: [
      { label: 'Funktion', value: 'Gateway, Router, UniFi-Controller' },
      { label: 'Bauform', value: 'Desktop' },
      { label: 'Verwaltung', value: 'UniFi Network (eingebaut)' },
    ],
    serviceHint: 'Für Standorte mit erhöhtem Schutzbedarf empfehlen wir stattdessen eine Managed Firewall.',
    tags: ['gateway', 'router', 'unifi', 'controller', 'filiale', 'ubiquiti'],
  }),
  P({
    id: 'huawei-s310-48t4s',
    slug: 'huawei-ekitengine-s310-48t4s',
    name: 'eKitEngine S310-48T4S',
    subtitle: '48 × Gigabit · 4 × SFP · ohne PoE',
    vendorId: 'huawei',
    categoryId: 'netzwerk',
    mpn: 'S310-48T4S',
    art: 'switch-48',
    price: 399,
    availability: 'bestellware',
    leadDays: 10,
    badges: [],
    text: 'Viele Ports zum kleinen Preis: 48 Anschlüsse in einer Höheneinheit, für Etagen mit vielen festen Arbeitsplätzen oder für die Produktion.',
    highlights: ['48 Ports in einer Höheneinheit', 'Verwaltbar über Weboberfläche und Cloud', 'Leise genug für einen Technikraum'],
    specs: [
      { label: 'Ports', value: '48 × 10/100/1000BASE-T' },
      { label: 'Uplinks', value: '4 × GE SFP' },
      { label: 'Schaltleistung', value: '104 Gbit/s' },
      { label: 'Paketrate', value: '77 Mpps' },
    ],
    tags: ['switch', 'huawei', 'ekit', '48 port', 'netzwerk'],
  }),
  P({
    id: 'huawei-s310-24p4s',
    slug: 'huawei-ekitengine-s310-24p4s',
    name: 'eKitEngine S310-24P4S',
    subtitle: '24 × Gigabit PoE+ (400 W) · 4 × SFP',
    vendorId: 'huawei',
    categoryId: 'netzwerk',
    mpn: 'S310-24P4S',
    art: 'switch-24-poe',
    price: 449,
    availability: 'bestellware',
    leadDays: 10,
    badges: [],
    text: 'PoE-Switch mit großzügigem Budget: 400 W reichen für 24 Geräte nach 802.3af oder 13 Geräte nach 802.3at, also auch für Access Points mit hohem Bedarf.',
    highlights: ['400 W PoE-Budget', 'Voller PoE-Betrieb auf allen 24 Ports nach 802.3af', 'Verwaltbar über Weboberfläche und Cloud'],
    specs: [
      { label: 'Ports', value: '24 × 10/100/1000BASE-T mit PoE+' },
      { label: 'PoE-Budget', value: '400 W' },
      { label: 'Uplinks', value: '4 × GE SFP' },
      { label: 'Schaltleistung', value: '56 Gbit/s' },
    ],
    serviceHint: 'Im Network Guard überwachen wir PoE-Auslastung und Portfehler mit.',
    tags: ['switch', 'huawei', 'poe', 'ekit', '24 port'],
  }),
  P({
    id: 'huawei-ap263',
    slug: 'huawei-ekitengine-ap263',
    name: 'eKitEngine AP263',
    subtitle: 'Access Point für die Wanddose · Wi-Fi 6',
    vendorId: 'huawei',
    categoryId: 'netzwerk',
    mpn: 'AP263',
    art: 'ap-wall',
    price: 129,
    availability: 'bestellware',
    leadDays: 10,
    badges: [],
    text: 'Access Point in Wanddosenform: sitzt dort, wo ohnehin eine Netzwerkdose ist, und bringt zusätzlich zwei Kupferports mit. Üblich in Hotels, Praxen und Büros mit kleinen Räumen.',
    highlights: ['Montage direkt auf der Netzwerkdose', 'Zwei zusätzliche Kupferports am Gerät', 'Unauffällig, kein Gerät an der Decke'],
    specs: [
      { label: 'Standard', value: 'Wi-Fi 6 (802.11ax)' },
      { label: 'Datenrate', value: 'bis 2,975 Gbit/s' },
      { label: 'Sendeleistung', value: 'max. 23 dBm' },
      { label: 'Anschlüsse', value: '2 × Gigabit Ethernet' },
    ],
    tags: ['wlan', 'wifi 6', 'access point', 'huawei', 'wanddose', 'hotel'],
  }),
  P({
    id: 'fortinet-fs-108f-poe',
    slug: 'fortinet-fortiswitch-108f-poe',
    name: 'FortiSwitch 108F-POE',
    subtitle: '8 × Gigabit PoE+ · 2 × SFP · lüfterlos',
    vendorId: 'fortinet',
    categoryId: 'netzwerk',
    mpn: 'FS-108F-POE',
    art: 'switch-8-poe',
    price: 449,
    availability: 'bestellware',
    leadDays: 14,
    badges: [],
    text: 'Switch, der sich von der FortiGate mitverwalten lässt. Damit gibt es für Firewall und Switching eine Oberfläche und ein Regelwerk, was die Fehlersuche deutlich verkürzt.',
    highlights: ['Wird von der FortiGate mitverwaltet', 'Lüfterlos und lautlos', 'PoE+ für Access Points und Telefone'],
    specs: [
      { label: 'Ports', value: '8 × 10/100/1000 Mbit/s mit PoE+' },
      { label: 'Uplinks', value: '2 × SFP' },
      { label: 'Kühlung', value: 'Passiv, ohne Lüfter' },
      { label: 'Verwaltung', value: 'FortiLink über die FortiGate' },
    ],
    serviceHint: 'Sinnvoll nur zusammen mit einer FortiGate, dann in der Managed Firewall mitbetreut.',
    tags: ['switch', 'fortinet', 'fortiswitch', 'poe', 'fortilink'],
  }),

  // ---------------------------------------------------------------- Sicherheit
  P({
    id: 'fortinet-fg-40f',
    slug: 'fortinet-fortigate-40f',
    name: 'FortiGate 40F',
    subtitle: 'Firewall für kleine Standorte',
    vendorId: 'fortinet',
    categoryId: 'sicherheit',
    mpn: 'FG-40F',
    art: 'firewall-desktop',
    price: 429,
    availability: 'lager',
    stock: 12,
    leadDays: 4,
    badges: [],
    text: 'Die kleinste FortiGate für Außenstellen und Praxen. Gleiche Oberfläche und gleiches Regelwerk wie die großen Modelle, deshalb lassen sich Standorte einheitlich betreiben.',
    highlights: ['Gleiche Verwaltung wie die größeren Modelle', 'VPN zur Zentrale und für Heimarbeit', 'Getrennte Netze für Gäste und Betrieb'],
    specs: [
      { label: 'Einsatz', value: 'Kleiner Standort, Außenstelle' },
      { label: 'Bauform', value: 'Desktop, lüfterlos' },
      { label: 'Reihe', value: 'FortiGate F-Serie' },
      { label: 'Abo', value: 'Sicherheitsabo separat, wir bieten 12 oder 36 Monate an' },
    ],
    serviceHint: 'Als Managed Firewall übernehmen wir Regelwerk, Updates und die Überwachung rund um die Uhr.',
    tags: ['firewall', 'fortinet', 'fortigate', 'vpn', 'aussenstelle'],
  }),
  P({
    id: 'fortinet-fg-60f',
    slug: 'fortinet-fortigate-60f',
    name: 'FortiGate 60F',
    subtitle: 'Firewall für den Standard-Standort',
    vendorId: 'fortinet',
    categoryId: 'sicherheit',
    mpn: 'FG-60F',
    art: 'firewall-desktop',
    price: 649,
    availability: 'lager',
    stock: 9,
    leadDays: 4,
    badges: ['bestseller'],
    text: 'Das Modell, das wir im Mittelstand am häufigsten setzen. Genug Reserve für Prüfung des verschlüsselten Verkehrs, VPN für Heimarbeit und ein getrenntes Produktionsnetz.',
    highlights: ['Meistgenutztes Modell in unseren Projekten', 'Reserve für die Prüfung verschlüsselter Verbindungen', 'Auswertungen für den Nachweis nach NIS2'],
    specs: [
      { label: 'Einsatz', value: 'Standort mit mehreren Netzen' },
      { label: 'Bauform', value: 'Desktop, lüfterlos' },
      { label: 'Reihe', value: 'FortiGate F-Serie' },
      { label: 'Abo', value: 'Sicherheitsabo separat, wir bieten 12 oder 36 Monate an' },
    ],
    serviceHint: 'Als Managed Firewall übernehmen wir Regelwerk, Updates und die Überwachung rund um die Uhr.',
    tags: ['firewall', 'fortinet', 'fortigate', 'nis2', 'vpn', 'security'],
  }),
  P({
    id: 'fortinet-fg-80f',
    slug: 'fortinet-fortigate-80f',
    name: 'FortiGate 80F',
    subtitle: 'Firewall für größere Häuser',
    vendorId: 'fortinet',
    categoryId: 'sicherheit',
    mpn: 'FG-80F',
    art: 'firewall-desktop',
    price: 1190,
    availability: 'bestellware',
    leadDays: 10,
    badges: [],
    text: 'Mehr Ports und mehr Durchsatz, wenn viele Netze getrennt geführt werden oder die Internetleitung schnell ist. Lässt sich zu zweit als Verbund betreiben, der ohne Unterbrechung umschaltet.',
    highlights: ['Als Paar ohne Unterbrechung umschaltbar', 'Mehr Ports für getrennte Netze', 'Auswertungen für den Nachweis nach NIS2'],
    specs: [
      { label: 'Einsatz', value: 'Zentrale, mehrere Netze' },
      { label: 'Bauform', value: 'Desktop' },
      { label: 'Reihe', value: 'FortiGate F-Serie' },
      { label: 'Abo', value: 'Sicherheitsabo separat, wir bieten 12 oder 36 Monate an' },
    ],
    serviceHint: 'Der Verbund gehört in die Managed Firewall mit Eskalation an Tier 3.',
    tags: ['firewall', 'fortinet', 'fortigate', 'cluster', 'zentrale'],
  }),
  P({
    id: 'sophos-xgs-107',
    slug: 'sophos-xgs-107',
    name: 'XGS 107',
    subtitle: 'Firewall · Desktop · EU-Netzkabel',
    vendorId: 'sophos',
    categoryId: 'sicherheit',
    mpn: 'XA1ZTCHEU',
    art: 'firewall-desktop',
    price: 599,
    availability: 'lager',
    stock: 5,
    leadDays: 5,
    badges: [],
    text: 'Die Alternative für Häuser, die bereits mit Sophos Central arbeiten: Firewall und Geräteschutz laufen dann in einer Oberfläche und tauschen Informationen aus. Einsteigermodell der XGS-Reihe für kleine Standorte und Filialen.',
    highlights: [
      'Gemeinsame Oberfläche mit Sophos Central',
      'Firewall und Geräteschutz tauschen Informationen aus',
      'Grundlizenz mit VPN ist im Kauf enthalten, Schutzpakete kommen dazu',
    ],
    specs: [
      { label: 'Einsatz', value: 'Kleiner Standort, Filiale' },
      { label: 'Bauform', value: 'Desktop' },
      { label: 'Netzkabel', value: 'EU' },
      { label: 'Reihe', value: 'Sophos XGS' },
    ],
    serviceHint: 'Auch Sophos-Firewalls betreiben wir als Managed Firewall.',
    tags: ['firewall', 'sophos', 'xgs', 'central', 'security'],
  }),
  P({
    id: 'fortinet-fg-100f',
    slug: 'fortinet-fortigate-100f',
    name: 'FortiGate 100F',
    subtitle: 'Firewall für das Rack · Projektgeschäft',
    vendorId: 'fortinet',
    categoryId: 'sicherheit',
    mpn: 'FG-100F',
    art: 'firewall-rack',
    price: 2890,
    availability: 'anfrage',
    leadDays: 20,
    badges: [],
    quoteOnly: true,
    text: 'Für Häuser, in denen ein Internetausfall die Produktion oder die Auftragsannahme stoppt. Weil Abos, Verbund und die passenden Optiken zusammenpassen müssen, planen wir dieses Gerät immer im Angebot, meist als Paar.',
    highlights: ['Rackmontage, üblicherweise als Paar', 'Abos und Verbund im Angebot abgestimmt', 'Auswertungen für den Nachweis nach NIS2'],
    specs: [
      { label: 'Einsatz', value: 'Zentrale mit hoher Verfügbarkeitsanforderung' },
      { label: 'Bauform', value: '19 Zoll' },
      { label: 'Reihe', value: 'FortiGate F-Serie' },
      { label: 'Bestellweg', value: 'Angebot mit Abo- und Verbundplanung' },
    ],
    serviceHint: 'Managed Firewall mit Eskalationsstufe Tier 3.',
    tags: ['firewall', 'fortinet', 'fortigate', 'rack', 'hochverfuegbar'],
  }),

  // ---------------------------------------------------------------- Server
  P({
    id: 'hpe-dl360-gen10plus',
    slug: 'hpe-proliant-dl360-gen10-plus',
    name: 'ProLiant DL360 Gen10 Plus',
    subtitle: 'Xeon Silver 4309Y · 32 GB · 8 × SFF · 800 W',
    vendorId: 'hpe',
    categoryId: 'server',
    mpn: 'P55240-B21',
    art: 'server-rack',
    price: 4290,
    availability: 'bestellware',
    leadDays: 18,
    badges: [],
    text: 'Der Einstieg im Rack: eine Höheneinheit, Fernwartung ab Werk, acht Laufwerksschächte. Gedacht für Häuser, die zwei bis drei Server betreiben und im Störungsfall nicht auf ein Ersatzgerät warten wollen. Speicher, Laufwerke und Netzteile erweitern wir passend zur Umgebung.',
    highlights: [
      'Fernwartung mit eigener Netzwerkbuchse (iLO)',
      'Zweiter Prozessor und weiterer Speicher später nachrüstbar',
      'Netzteil und Laufwerke im Betrieb tauschbar',
    ],
    specs: [
      { label: 'Prozessor', value: 'Intel Xeon Silver 4309Y, 2,8 GHz, 8 Kerne' },
      { label: 'Arbeitsspeicher', value: '32 GB (1 × 32 GB), erweiterbar' },
      { label: 'Laufwerksschächte', value: '8 × SFF' },
      { label: 'Controller', value: 'HPE MR416i-a, 4 GB Cache' },
      { label: 'Netzteil', value: '800 W, redundant erweiterbar' },
      { label: 'Bauform', value: '19 Zoll, 1 Höheneinheit' },
    ],
    serviceHint: 'Als Managed Server übernehmen wir Betriebssystem, Patchstand, Überwachung und Kapazitätsplanung.',
    tags: ['server', 'hpe', 'proliant', 'dl360', 'rack', 'virtualisierung'],
  }),
  P({
    id: 'apc-smt1500rmi2u',
    slug: 'apc-smart-ups-smt1500rmi2u',
    name: 'Smart-UPS SMT1500RMI2U',
    subtitle: '1500 VA / 1000 W · 19 Zoll · 2 Höheneinheiten',
    vendorId: 'apc',
    categoryId: 'server',
    mpn: 'SMT1500RMI2U',
    gtin: '0731304284758',
    art: 'ups',
    price: 849,
    availability: 'lager',
    stock: 7,
    leadDays: 4,
    badges: [],
    text: 'Überbrückt kurze Ausfälle und fährt Server bei längeren Ausfällen geordnet herunter. Ein Server, der hart ausgeschaltet wird, ist die häufigste Ursache für beschädigte Datenbanken.',
    highlights: ['Fährt Server bei längerem Ausfall geordnet herunter', 'Akkus im Betrieb tauschbar', 'Netzwerkkarte für die Überwachung nachrüstbar'],
    specs: [
      { label: 'Leistung', value: '1,5 kVA / 1000 W' },
      { label: 'Technik', value: 'Line-interaktiv mit Spannungsregelung' },
      { label: 'Ausgänge', value: '4 × AC' },
      { label: 'Bauform', value: '19 Zoll, 2 Höheneinheiten' },
    ],
    serviceHint: 'Ladezustand und Akkualter überwachen wir im Managed Server mit.',
    tags: ['usv', 'ups', 'apc', 'smart-ups', 'strom', 'notstrom'],
  }),
  P({
    id: 'apc-smt750rmi2u',
    slug: 'apc-smart-ups-smt750rmi2u',
    name: 'Smart-UPS SMT750RMI2U',
    subtitle: '750 VA / 500 W · 19 Zoll · 2 Höheneinheiten',
    vendorId: 'apc',
    categoryId: 'server',
    mpn: 'SMT750RMI2U',
    gtin: '0731304284765',
    art: 'ups',
    price: 549,
    availability: 'lager',
    stock: 10,
    leadDays: 4,
    badges: [],
    text: 'Die kleinere Ausführung für einen einzelnen Server oder den Netzwerkschrank einer Außenstelle. Gleiche Technik und gleiche Überwachung wie das größere Modell.',
    highlights: ['Passend für Netzwerkschrank und Außenstelle', 'Akkus im Betrieb tauschbar', 'Netzwerkkarte für die Überwachung nachrüstbar'],
    specs: [
      { label: 'Leistung', value: '0,75 kVA / 500 W' },
      { label: 'Technik', value: 'Line-interaktiv mit Spannungsregelung' },
      { label: 'Ausgänge', value: '4 × AC' },
      { label: 'Bauform', value: '19 Zoll, 2 Höheneinheiten' },
    ],
    tags: ['usv', 'ups', 'apc', 'smart-ups', 'aussenstelle'],
  }),
  P({
    id: 'apc-bx1600mi',
    slug: 'apc-back-ups-bx1600mi',
    name: 'Back-UPS BX1600MI',
    subtitle: '1600 VA · 230 V · für Arbeitsplatz und Kasse',
    vendorId: 'apc',
    categoryId: 'server',
    mpn: 'BX1600MI',
    gtin: '0731304410829',
    art: 'ups',
    price: 179,
    availability: 'lager',
    stock: 23,
    leadDays: 3,
    badges: [],
    text: 'Die günstige Absicherung für einzelne Arbeitsplätze, Kassen und Netzwerkschränke ohne Server. Überbrückt Spannungsschwankungen und kurze Ausfälle.',
    highlights: ['Spannungsregelung gegen Schwankungen', 'Aufstellgerät, keine Rackmontage nötig', 'Anschlüsse mit und ohne Akkuabsicherung'],
    specs: [
      { label: 'Leistung', value: '1600 VA' },
      { label: 'Spannung', value: '230 V' },
      { label: 'Ausgänge', value: 'IEC' },
      { label: 'Akku', value: '24 V (2 × 12 V, 7,0 Ah)' },
    ],
    tiers: [{ qty: 10, price: 169 }],
    tags: ['usv', 'ups', 'apc', 'back-ups', 'arbeitsplatz', 'kasse'],
  }),

  // ---------------------------------------------------------------- Speicher und Backup
  P({
    id: 'veeam-ess-vul',
    slug: 'veeam-data-platform-essentials-universal',
    name: 'Data Platform Essentials Universal',
    subtitle: 'Abonnement · 1 Jahr · inklusive Production Support',
    vendorId: 'veeam',
    categoryId: 'speicher',
    mpn: 'E-ESSVUL-0I-SU1AR-00',
    art: 'license-backup',
    price: 1290,
    availability: 'lager',
    leadDays: 2,
    badges: ['bestseller'],
    digital: true,
    unit: 'Paket / Jahr',
    text: 'Die Einstiegslizenz für kleinere Umgebungen, mit dem Funktionsumfang der Enterprise-Plus-Ausgabe. Die Universal-Lizenz lässt sich frei auf virtuelle Maschinen, physische Server und Cloud-Arbeitslasten verteilen, statt an eine Bauform gebunden zu sein.',
    highlights: [
      'Lizenzpunkte frei auf virtuell, physisch und Cloud verteilbar',
      'Funktionsumfang der Enterprise-Plus-Ausgabe',
      'Production Support des Herstellers enthalten',
    ],
    specs: [
      { label: 'Laufzeit', value: '1 Jahr, Abrechnung im Voraus' },
      { label: 'Umfang', value: 'Data Platform Essentials, Enterprise Plus Feature Set' },
      { label: 'Support', value: 'Production Support' },
      { label: 'Lizenzmodell', value: 'Veeam Universal License (VUL)' },
    ],
    serviceHint: 'Im Managed Backup ist die Lizenz im Monatspreis bereits berücksichtigt.',
    tags: ['backup', 'veeam', 'lizenz', 'vul', 'sicherung', 'essentials'],
  }),
  P({
    id: 'veeam-vbr-vul',
    slug: 'veeam-backup-replication-universal-license',
    name: 'Backup & Replication Universal License',
    subtitle: 'Abonnement · 1 Jahr · 10 Instanzen',
    vendorId: 'veeam',
    categoryId: 'speicher',
    mpn: 'V-VBRVUL-0I-SU1AR-00',
    art: 'license-backup',
    price: 2490,
    availability: 'lager',
    leadDays: 2,
    badges: [],
    digital: true,
    unit: 'Paket / Jahr',
    text: 'Die größere Lizenz für Umgebungen jenseits der Essentials-Grenze: Sicherung, Replikation und Wiederherstellung über virtuelle und physische Systeme hinweg, mit zentraler Verwaltung.',
    highlights: ['10 Instanzen, frei verteilbar', 'Sicherung und Replikation in einem Produkt', 'Production Support des Herstellers enthalten'],
    specs: [
      { label: 'Laufzeit', value: '1 Jahr, Abrechnung im Voraus' },
      { label: 'Umfang', value: 'Veeam Backup & Replication' },
      { label: 'Instanzen', value: '10' },
      { label: 'Lizenzmodell', value: 'Veeam Universal License (VUL)' },
    ],
    serviceHint: 'Kern des Managed Backup: Überwachung, Auslagerung und geprüfte Wiederherstellung.',
    tags: ['backup', 'veeam', 'replikation', 'lizenz', 'vul'],
  }),

  // ---------------------------------------------------------------- Software und Lizenzen
  P({
    id: 'ms-365-business-premium',
    slug: 'microsoft-365-business-premium',
    name: 'Microsoft 365 Business Premium',
    subtitle: 'Je Benutzer und Monat · inklusive Geräteverwaltung',
    vendorId: 'microsoft',
    categoryId: 'software',
    mpn: '',
    art: 'license-cloud',
    price: 22.6,
    availability: 'lager',
    leadDays: 1,
    badges: ['bestseller'],
    recurring: true,
    unit: 'Benutzer / Monat',
    text: 'Office, Mail, Teams und die Geräteverwaltung in einer Lizenz. Die Geräteverwaltung ist der Grund, warum wir dieses Paket empfehlen: damit lassen sich Notebooks automatisch einrichten und im Verlustfall sperren.',
    highlights: ['Geräteverwaltung und Verschlüsselung enthalten', 'Zweite Anmeldestufe ohne Zusatzlizenz', 'Auf der Sammelrechnung statt per Kreditkarte'],
    specs: [
      { label: 'Abrechnung', value: 'Monatlich je Benutzer, auf der Sammelrechnung' },
      { label: 'Enthalten', value: 'Office-Anwendungen, Exchange, Teams, SharePoint' },
      { label: 'Verwaltung', value: 'Intune, Entra ID Plan 1, Defender for Business' },
      { label: 'Postfach', value: '50 GB je Benutzer' },
    ],
    tiers: [
      { qty: 25, price: 21.4 },
      { qty: 100, price: 20.2 },
    ],
    serviceHint: 'In der Managed IT übernehmen wir Einrichtung, Benutzerpflege und Lizenzabgleich.',
    tags: ['microsoft 365', 'office', 'lizenz', 'intune', 'exchange', 'teams'],
  }),
  P({
    id: 'ms-365-business-standard',
    slug: 'microsoft-365-business-standard',
    name: 'Microsoft 365 Business Standard',
    subtitle: 'Je Benutzer und Monat · ohne Geräteverwaltung',
    vendorId: 'microsoft',
    categoryId: 'software',
    mpn: '',
    art: 'license-cloud',
    price: 12.9,
    availability: 'lager',
    leadDays: 1,
    badges: [],
    recurring: true,
    unit: 'Benutzer / Monat',
    text: 'Die kleinere Ausgabe für Rollen, die nur Office, Mail und Teams brauchen. Ohne Geräteverwaltung, deshalb für Arbeitsplätze mit betreuten Firmengeräten meist die falsche Wahl.',
    highlights: ['Office, Exchange, Teams und SharePoint', 'Gleiches Postfach wie Business Premium', 'Jederzeit auf Business Premium umstellbar'],
    specs: [
      { label: 'Abrechnung', value: 'Monatlich je Benutzer, auf der Sammelrechnung' },
      { label: 'Enthalten', value: 'Office-Anwendungen, Exchange, Teams, SharePoint' },
      { label: 'Nicht enthalten', value: 'Intune, Defender for Business' },
      { label: 'Postfach', value: '50 GB je Benutzer' },
    ],
    tiers: [{ qty: 50, price: 12.2 }],
    tags: ['microsoft 365', 'office', 'lizenz', 'standard', 'exchange'],
  }),
  P({
    id: '3cx-pro-4sc',
    slug: '3cx-phone-system-professional-4sc',
    name: 'Phone System Professional 4SC',
    subtitle: 'Telefonanlage · 4 gleichzeitige Gespräche · 1 Jahr',
    vendorId: '3cx',
    categoryId: 'software',
    mpn: '3CXPSPROF4',
    art: 'license-phone',
    price: 420,
    availability: 'lager',
    leadDays: 2,
    badges: [],
    digital: true,
    unit: 'Anlage / Jahr',
    text: 'Telefonanlage ohne Gerät im Haus: Nebenstellen, Warteschleifen und Ansagen laufen in der Anlage, Mitarbeitende telefonieren am Tischtelefon, am Rechner oder über die App mit derselben Nummer. Die Professional-Ausgabe bringt Warteschleifen, Auswertungen und CRM-Anbindung mit.',
    highlights: [
      'Nebenstellen sind nicht begrenzt, gezählt werden gleichzeitige Gespräche',
      'Warteschleifen, Auswertungen und CRM-Anbindung',
      'Tischtelefon, Rechner und App mit einer Nummer',
    ],
    specs: [
      { label: 'Gleichzeitige Gespräche', value: '4' },
      { label: 'Ausgabe', value: 'Professional' },
      { label: 'Laufzeit', value: '1 Jahr' },
      { label: 'Erweiterbar', value: 'Auf mehr gleichzeitige Gespräche umstellbar' },
    ],
    serviceHint: 'Als Managed Cloud-Telefonie inklusive Einrichtung, Änderungen und Störungsannahme.',
    tags: ['telefonie', '3cx', 'voip', 'anlage', 'lizenz', 'pbx'],
  }),
];

export const productBySlug = (slug: string): Product | undefined => PRODUCTS.find((p) => p.slug === slug);
export const productById = (id: string): Product | undefined => PRODUCTS.find((p) => p.id === id);

/** Manufacturer list for the catalogue filter, alphabetical. */
export const MANUFACTURERS: readonly string[] = [...new Set(PRODUCTS.map((p) => p.manufacturer))].sort((a, b) =>
  a.localeCompare(b, 'de'),
);

/** Lookup reference for Icecat; null when the article has no manufacturer part number (configured goods). */
export function icecatRef(product: Product): IcecatRef | null {
  const vendor = vendorById(product.vendorId);
  if (!vendor) return null;
  if (product.gtin) return { brand: vendor.icecatBrand, gtin: product.gtin };
  if (!product.mpn) return null;
  return { brand: vendor.icecatBrand, productCode: product.mpn };
}

/** Unit price for a quantity, honouring the volume tiers. */
export function unitPrice(product: Product, quantity: number): number {
  const tier = [...(product.tiers ?? [])].sort((a, b) => b.qty - a.qty).find((t) => quantity >= t.qty);
  return tier ? tier.price : product.price;
}

/** Licences and subscriptions are invoiced, not shipped. */
export const isPhysical = (product: Product): boolean => !product.recurring && !product.digital;

export interface AvailabilityLabel {
  label: string;
  tone: 'good' | 'info' | 'warning' | 'neutral';
  detail: string;
}

export function availabilityLabel(product: Product): AvailabilityLabel {
  if (!isPhysical(product)) {
    return { label: 'Sofort buchbar', tone: 'good', detail: 'Lizenz, wird bereitgestellt statt geliefert' };
  }
  switch (product.availability) {
    case 'lager':
      return {
        label: 'Auf Lager',
        tone: 'good',
        detail: product.stock
          ? `${product.stock} Stück verfügbar, Versand in ${product.leadDays} Arbeitstagen`
          : `Versand in ${product.leadDays} Arbeitstagen`,
      };
    case 'bestellware':
      return { label: 'Bestellware', tone: 'info', detail: `Lieferung in etwa ${product.leadDays} Arbeitstagen` };
    case 'lieferzeit':
      return { label: 'Längere Lieferzeit', tone: 'warning', detail: `Wird konfiguriert, etwa ${product.leadDays} Arbeitstage` };
    case 'anfrage':
      return { label: 'Nur auf Angebot', tone: 'neutral', detail: 'Wir melden uns innerhalb eines Arbeitstags' };
  }
}

/** Cross-sell: managed service lines on the website, keyed by the ids used in the categories. */
export const SERVICE_LINES: Record<string, { label: string; text: string; anchor: string }> = {
  workstation: {
    label: 'Managed Workstation',
    text: 'Einrichtung, Updates, Virenschutz und Support je Arbeitsplatz zum Monatspreis.',
    anchor: 'workstation',
  },
  firewall: {
    label: 'Managed Firewall',
    text: 'Regelwerk, Updates und Überwachung rund um die Uhr für den Übergang ins Internet.',
    anchor: 'firewall',
  },
  server: {
    label: 'Managed Server',
    text: 'Betriebssystem, Patchstand, Überwachung und Kapazitätsplanung Ihrer Server.',
    anchor: 'server',
  },
  backup: {
    label: 'Managed Backup',
    text: 'Sicherung, Auslagerung und monatlich geprüfte Wiederherstellung.',
    anchor: 'backup',
  },
  'managed-it': {
    label: 'Managed IT',
    text: 'Das Rundum-Bundle: alle Linien in einem Monatspreis je Arbeitsplatz.',
    anchor: 'managed-it',
  },
};
