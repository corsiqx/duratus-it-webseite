export interface OpenDeskFeature {
  title: string;
  icon: string;
  text: string;
}

/** Kernfunktionen von OpenDesk, kurz erklärt. */
export const OPENDESK_FEATURES: readonly OpenDeskFeature[] = [
  {
    title: 'Portal & Single Sign-On',
    icon: 'phosphorSquaresFour',
    text: 'Zentraler Startpunkt für alle Anwendungen mit einer einzigen Anmeldung.',
  },
  {
    title: 'Mail & Kalender',
    icon: 'phosphorEnvelopeSimple',
    text: 'E-Mail-Postfächer, Terminplanung und Ressourcenbuchung für die ganze Behörde.',
  },
  {
    title: 'Chat',
    icon: 'phosphorChatCenteredText',
    text: 'Direktnachrichten und Gruppen-Channels für die schnelle Abstimmung im Team.',
  },
  {
    title: 'Videokonferenz',
    icon: 'phosphorVideoConference',
    text: 'Verschlüsselte Video-Meetings für interne Abstimmungen und Bürgertermine.',
  },
  {
    title: 'Dateien & Cloud-Speicher',
    icon: 'phosphorCloud',
    text: 'Gemeinsame Ablage mit Freigaben, Versionierung und Synchronisation.',
  },
  {
    title: 'Text, Tabellen & Präsentationen',
    icon: 'phosphorFileText',
    text: 'Gemeinsames Bearbeiten von Dokumenten direkt im Browser, ohne Installation.',
  },
  {
    title: 'Projekt- & Aufgabenmanagement',
    icon: 'phosphorKanban',
    text: 'Aufgaben, Fristen und Projekte planen und im Team nachverfolgen.',
  },
  {
    title: 'Wissensmanagement',
    icon: 'phosphorNotebook',
    text: 'Wiki für Dienstanweisungen, Prozesse und Wissen, das im Haus bleiben soll.',
  },
] as const;

export interface OpenDeskPackage {
  name: string;
  audience: string;
  features: string[];
  support: string;
}

/** Drei Paketstufen für OpenDesk als monatlich abgerechneten Managed Service. */
export const OPENDESK_PACKAGES: readonly [OpenDeskPackage, OpenDeskPackage, OpenDeskPackage] = [
  {
    name: 'Starter',
    audience: 'Kleine Gemeinde oder Behörde',
    features: [
      'Portal, Mail & Kalender, Dateien und Chat',
      'Automatisiertes Nutzer-Onboarding',
      'Betrieb in einem deutschen Rechenzentrum',
    ],
    support: 'E-Mail-Support in den Geschäftszeiten',
  },
  {
    name: 'Professional',
    audience: 'Mittlere Kommune oder Verwaltung',
    features: [
      'Alles aus Starter',
      'Videokonferenz, Projekt- und Aufgabenmanagement, Wiki',
      'Anbindung an bestehendes Identitätsmanagement',
    ],
    support: 'Priorisierter Support und Quartalsgespräch',
  },
  {
    name: 'Enterprise',
    audience: 'Landkreis oder Standortverbund',
    features: [
      'Alles aus Professional',
      'Mandantentrennung für mehrere Ämter oder Standorte',
      'Individuelle Anbindung an Fachverfahren',
    ],
    support: 'Persönlicher Ansprechpartner mit garantierten Reaktionszeiten',
  },
];

/** Fester Ansprechpartner für unverbindliche Vorstellungstermine zu OpenDesk. */
export const OPENDESK_CONTACT = {
  name: 'Fabian Kersten',
  initials: 'FK',
  role: 'Ansprechpartner OpenDesk',
  email: 'fabian.kersten@duratus-it.de',
  mailHref: 'mailto:fabian.kersten@duratus-it.de?subject=Vorstellungstermin%20OpenDesk',
} as const;
