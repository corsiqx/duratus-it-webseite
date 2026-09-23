export const VALUES = [
  { title: 'Stabilität', text: 'Systeme, die laufen', icon: 'phosphorAnchor' },
  { title: 'Sicherheit', text: 'Schutz ohne Kompromisse', icon: 'phosphorShieldCheck' },
  { title: 'Automatisierung', text: 'Schnell statt bürokratisch', icon: 'phosphorRobot' },
  { title: 'Vertrauen', text: 'Persönlich und transparent', icon: 'phosphorHandshake' },
] as const;

/** Structural facts about the offering (not performance claims). */
export const FACTS = [
  { value: '3', label: 'Bereiche aus einer Hand: Produkte, Managed Services, Consulting' },
  { value: '6', label: 'Managed-Service-Linien, monatlich abgerechnet' },
  { value: '3', label: 'Paketstufen je Linie, von Basic bis Enterprise' },
  { value: '24/7', label: 'Automatisiertes Monitoring' },
] as const;

export const PROCESS_STEPS = [
  { title: 'Analyse', text: 'Ist-Aufnahme Ihrer IT-Landschaft und Identifikation der Handlungsfelder.', icon: 'phosphorMagnifyingGlass' },
  { title: 'Konzept', text: 'Maßgeschneiderter Lösungsvorschlag mit transparenter Kostenkalkulation.', icon: 'phosphorCompass' },
  { title: 'Beschaffung', text: 'Passende Hardware aus unserem Produktsortiment, optional mit Leasing.', icon: 'phosphorPackage' },
  { title: 'Go-Live', text: 'Automatisierte Inbetriebnahme, Schulung und Übergabe der Dokumentation.', icon: 'phosphorRocket' },
  { title: 'Betrieb', text: 'Laufender Managed Service mit Monitoring und Self-Service.', icon: 'phosphorPulse' },
] as const;

export const TRUST_POINTS = [
  { label: 'Rund um die Uhr überwacht', icon: 'phosphorPulse' },
  { label: 'Planbare Monatspreise', icon: 'phosphorCalendarCheck' },
  { label: 'DSGVO-konform', icon: 'phosphorLockKey' },
  { label: 'Zertifizierte Einkaufswege', icon: 'phosphorSealCheck' },
  { label: 'Hardware, Betrieb und Beratung aus einer Hand', icon: 'phosphorStack' },
] as const;

export interface TeamMember {
  name: string;
  role: string;
  quote: string;
  initials: string;
}

// TODO: Platzhalter-Team durch echte Namen und Fotos ersetzen.
export const TEAM: readonly TeamMember[] = [
  { name: 'Max Mustermann', initials: 'MM', role: 'Geschäftsführung und Vertrieb', quote: 'Ich will, dass Kunden mich anrufen, nicht ein Ticketsystem.' },
  { name: 'Julia Beispiel', initials: 'JB', role: 'Managed Services und Automatisierung', quote: 'Wenn ich zweimal dasselbe Ticket sehe, baue ich ein Skript dafür.' },
  { name: 'Tom Fischer', initials: 'TF', role: 'Senior IT-Consultant', quote: 'Strategie, die niemand versteht, ist keine Strategie.' },
  { name: 'Lena Weber', initials: 'LW', role: 'IT-Security und Compliance', quote: 'Awareness-Training macht mehr Spaß, als der Name klingt.' },
  { name: 'David Klein', initials: 'DK', role: 'Support und Remote-Technik', quote: 'Tier 2 heißt: Ich bin dran, wenn die Automation es nicht schafft.' },
  { name: 'Nina Schröder', initials: 'NS', role: 'Einkauf und Backoffice', quote: 'Ich weiß meistens früher als der Hersteller, wann Ihre Hardware kommt.' },
];

export const CONTACT_PEOPLE = [
  {
    name: 'Max Mustermann',
    initials: 'MM',
    role: 'Vertrieb und Neukundenberatung',
    text: 'Erster Kontakt für Angebote, Bundles aus Hardware und Managed Service sowie Fragen zum Portfolio.',
    phone: '+49 2351 123 456',
    phoneHref: 'tel:+492351123456',
    email: 'max.mustermann@duratus-it.de',
  },
  {
    name: 'Lena Weber',
    initials: 'LW',
    role: 'IT-Security und Consulting',
    text: 'Ansprechpartnerin für Security-Assessments, NIS2-Fragen, Strategieberatung und Consulting-Projekte.',
    phone: '+49 2351 123 457',
    phoneHref: 'tel:+492351123457',
    email: 'lena.weber@duratus-it.de',
  },
] as const;
