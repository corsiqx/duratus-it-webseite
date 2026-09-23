/** Editorial content of the shop: promises, bundles, delivery and payment terms, questions. */

export const SHOP_BENEFITS = [
  {
    icon: 'phosphorReceipt',
    title: 'Kauf auf Rechnung',
    text: 'Als Firmenkunde zahlen Sie nach Lieferung, 14 Tage netto. Keine Kreditkarte, keine Vorkasse.',
  },
  {
    icon: 'phosphorTag',
    title: 'Nettopreise und Staffeln',
    text: 'Alle Preise ohne Umsatzsteuer, ab 5 Stück greifen Staffelpreise automatisch. Umschalten auf brutto jederzeit möglich.',
  },
  {
    icon: 'phosphorGearSix',
    title: 'Passender Betrieb dazu',
    text: 'Jeder Artikel zeigt die Managed-Service-Linie, die den Betrieb übernimmt. Beschaffung und Betrieb passen zusammen.',
  },
  {
    icon: 'phosphorTruck',
    title: 'Direktversand ab Lager',
    text: 'Lagerware verlässt das Haus in zwei Arbeitstagen, ab 750 € netto versandkostenfrei innerhalb Deutschlands.',
  },
] as const;

/** Prepared sets: a shopping cart in one click, with product ids from catalog.ts. */
export interface Bundle {
  id: string;
  name: string;
  text: string;
  icon: string;
  /** Marketing line under the title, e.g. who this is for. */
  audience: string;
  items: readonly { productId: string; quantity: number }[];
  /** Managed service line that fits the set. */
  serviceHint: string;
}

export const BUNDLES: readonly Bundle[] = [
  {
    id: 'arbeitsplatz-set',
    name: 'Arbeitsplatz-Set',
    audience: 'Für jeden neuen Büroarbeitsplatz',
    icon: 'phosphorArmchair',
    text: 'Notebook, Thunderbolt-Dock, zwei Monitore und ein Tastatur-Set. Genau die Zusammenstellung, die wir in Rollouts am häufigsten ausliefern.',
    items: [
      { productId: 'ms-surface-laptop-6', quantity: 1 },
      { productId: 'dell-wd22tb4', quantity: 1 },
      { productId: 'dell-p2425h', quantity: 2 },
      { productId: 'dell-km3322w', quantity: 1 },
    ],
    serviceHint: 'Managed Workstation',
  },
  {
    id: 'standort-set',
    name: 'Netzwerk-Set für einen Standort',
    audience: 'Für eine neue Filiale oder Außenstelle',
    icon: 'phosphorBuildings',
    text: 'FortiGate 60F, Etagen-Switch mit PoE und drei Access Points. Damit ist ein Standort mit bis zu 50 Arbeitsplätzen grundversorgt.',
    items: [
      { productId: 'fortinet-fg-60f', quantity: 1 },
      { productId: 'aruba-1930-24g-poe', quantity: 1 },
      { productId: 'aruba-ap22', quantity: 3 },
    ],
    serviceHint: 'Managed Firewall und Managed Wi-Fi',
  },
  {
    id: 'telefonie-set',
    name: 'Telefonie-Set',
    audience: 'Für den Umstieg auf IP-Telefonie',
    icon: 'phosphorPhoneCall',
    text: '3CX-Anlage für vier gleichzeitige Gespräche und fünf Tischtelefone. Nebenstellen sind nicht begrenzt, gezählt werden nur die gleichzeitigen Gespräche.',
    items: [
      { productId: '3cx-pro-4sc', quantity: 1 },
      { productId: 'yealink-t43u', quantity: 5 },
    ],
    serviceHint: 'Managed Cloud-Telefonie',
  },
  {
    id: 'serverraum-set',
    name: 'Serverraum-Set',
    audience: 'Für den Neuaufbau eines Serverraums',
    icon: 'phosphorShieldCheck',
    text: 'Rack-Server, unterbrechungsfreie Stromversorgung und die Sicherungslizenz. Damit läuft ein Serverraum vom ersten Tag an mit geprüfter Wiederherstellung.',
    items: [
      { productId: 'hpe-dl360-gen10plus', quantity: 1 },
      { productId: 'apc-smt1500rmi2u', quantity: 1 },
      { productId: 'veeam-ess-vul', quantity: 1 },
    ],
    serviceHint: 'Managed Server und Managed Backup',
  },
];

export const PAYMENT_METHODS = [
  {
    id: 'rechnung',
    label: 'Rechnung, 14 Tage netto',
    icon: 'phosphorReceipt',
    text: 'Standard für Firmenkunden. Die Rechnung liegt der Lieferung bei und erscheint im Kundenportal.',
  },
  {
    id: 'vorkasse',
    label: 'Vorkasse per Überweisung',
    icon: 'phosphorBank',
    text: 'Wir versenden, sobald der Betrag eingegangen ist. 2 % Abzug bei Zahlung innerhalb von 5 Tagen.',
  },
  {
    id: 'leasing',
    label: 'Leasing über unseren Partner',
    icon: 'phosphorCalendarCheck',
    text: 'Ab 2.500 € netto. Wir reichen die Anfrage ein, der Leasinggeber entscheidet und meldet sich direkt bei Ihnen.',
  },
] as const;

export type PaymentId = (typeof PAYMENT_METHODS)[number]['id'];

export const DELIVERY_OPTIONS = [
  {
    id: 'standard',
    label: 'Standardversand',
    icon: 'phosphorTruck',
    text: 'Lagerware verlässt das Haus in zwei Arbeitstagen. Ab 750 € netto versandkostenfrei.',
  },
  {
    id: 'express',
    label: 'Expressversand',
    icon: 'phosphorLightning',
    text: 'Lagerware geht am selben Arbeitstag raus, wenn die Bestellung bis 14:00 Uhr eingeht.',
  },
  {
    id: 'sammel',
    label: 'Gesammelt liefern',
    icon: 'phosphorPackage',
    text: 'Wir warten, bis alle Artikel da sind, und liefern in einer Sendung. Spart Wege und Verpackung.',
  },
] as const;

export type DeliveryId = (typeof DELIVERY_OPTIONS)[number]['id'];

export const SHOP_FAQ = [
  {
    question: 'Kann ich als Privatperson bestellen?',
    answer:
      'Nein. Der Shop richtet sich an Unternehmen, Vereine und öffentliche Einrichtungen. Deshalb sind alle Preise Nettopreise und es gibt kein Widerrufsrecht wie im Verbrauchergeschäft.',
  },
  {
    question: 'Wie komme ich an ein schriftliches Angebot?',
    answer:
      'Legen Sie die Artikel in den Warenkorb und wählen Sie „Angebot anfordern“ statt „Bestellen“. Sie erhalten das Angebot sofort als PDF und zusätzlich per Mail. Angebote sind 14 Tage gültig.',
  },
  {
    question: 'Warum sind manche Artikel nur auf Anfrage erhältlich?',
    answer:
      'Bei Core-Switches, großen Servern und Beratungsleistungen hängt der Preis an Ihrer bestehenden Umgebung. Diese Artikel kommen deshalb als Position in ein Angebot statt in eine Bestellung.',
  },
  {
    question: 'Gilt der Staffelpreis auch über mehrere Bestellungen?',
    answer:
      'Im Shop rechnen die Staffeln je Bestellung. Wenn Sie über das Jahr größere Mengen abnehmen, hinterlegen wir Ihnen feste Konditionen. Sprechen Sie uns dazu einmal an.',
  },
  {
    question: 'Was passiert nach der Bestellung?',
    answer:
      'Sie erhalten eine Bestellbestätigung als PDF. Jedes bestellte Gerät wird als Onboarding-Vorgang im Service-System angelegt, damit es nach der Lieferung nicht ungepflegt im Netz landet.',
  },
  {
    question: 'Können bestehende Rahmenverträge genutzt werden?',
    answer:
      'Ja. Kundennummer und Kostenstelle lassen sich bei der Bestellung angeben, die Positionen landen dann auf der vereinbarten Sammelrechnung.',
  },
] as const;

/** Buying process, shown on the delivery and payment page. */
export const ORDER_STEPS = [
  { title: 'Warenkorb', text: 'Artikel auswählen, Mengen setzen. Staffelpreise greifen automatisch.', icon: 'phosphorShoppingCart' },
  { title: 'Bestellen oder anfragen', text: 'Direkt bestellen oder ein Angebot als PDF erzeugen.', icon: 'phosphorFilePdf' },
  { title: 'Bestätigung', text: 'Bestellbestätigung mit Liefertermin je Position, sofort als PDF.', icon: 'phosphorCheckCircle' },
  { title: 'Lieferung', text: 'Direktversand ab Lager oder gesammelt, je nach Wunsch.', icon: 'phosphorTruck' },
  { title: 'Übergang in den Betrieb', text: 'Jedes Gerät wird als Onboarding-Vorgang angelegt.', icon: 'phosphorArrowsClockwise' },
] as const;
