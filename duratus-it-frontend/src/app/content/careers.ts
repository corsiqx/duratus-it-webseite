export const BENEFIT_GROUPS = [
  {
    title: 'Geld und Vorsorge',
    benefits: [
      { title: 'Attraktives Gehalt', text: 'Fair, transparent und regelmäßig überprüft.', icon: 'phosphorCurrencyEur' },
      { title: 'Betriebliche Altersvorsorge', text: 'Mit Arbeitgeberzuschuss.', icon: 'phosphorPiggyBank' },
      { title: 'Vermögenswirksame Leistungen', text: 'Obendrauf, ohne Kleingedrucktes.', icon: 'phosphorCoins' },
      { title: 'JobBike', text: 'Dein Wunschrad, geleast über uns. Auch fürs Wochenende.', icon: 'phosphorBicycle' },
      { title: 'Firmenwagen', text: 'Für Rollen mit Kundenterminen, auch privat nutzbar.', icon: 'phosphorCar' },
    ],
  },
  {
    title: 'Arbeiten, wie es passt',
    benefits: [
      { title: 'Homeoffice', text: 'Flexibel je nach Rolle. Vertrauen statt Anwesenheitspflicht.', icon: 'phosphorHouse' },
      { title: 'Workation', text: 'Ein paar Wochen im Jahr auch von woanders arbeiten.', icon: 'phosphorGlobeHemisphereWest' },
      { title: 'Dynamische Teams', text: 'Kurze Wege, schnelle Entscheidungen, viel Eigenverantwortung.', icon: 'phosphorUsersThree' },
    ],
  },
  {
    title: 'Kultur',
    benefits: [
      { title: 'Du-Kultur', text: 'Vom Azubi bis zur Geschäftsführung.', icon: 'phosphorChatsCircle' },
      { title: 'Offene Tür', text: 'Bei jeder Führungskraft, jederzeit.', icon: 'phosphorDoorOpen' },
      { title: 'Obst, Wasser und Kaffee', text: 'Aufs Haus, Fachsimpelei inklusive.', icon: 'phosphorCoffee' },
      { title: 'Duratus Merch', text: 'Hoodie, Sticker und Co.', icon: 'phosphorTShirt' },
    ],
  },
] as const;

/** What happens after an application is submitted. */
export const APPLICATION_STEPS = [
  { title: 'Eingangsbestätigung', text: 'Du bekommst innerhalb von zwei Werktagen eine Rückmeldung von uns, kein automatisches Standardschreiben.' },
  { title: 'Kennenlernen per Video', text: 'Ein kurzes Gespräch von etwa 30 Minuten, in dem beide Seiten ihre Fragen loswerden.' },
  { title: 'Gespräch vor Ort', text: 'Du lernst das Team im Airportpark Greven kennen und siehst, woran wir gerade arbeiten.' },
] as const;

export interface Job {
  id: string;
  title: string;
  icon: string;
  tags: string[];
  intro: string;
  tasks: string[];
  profile: string[];
  note: string;
}

export const JOBS: readonly Job[] = [
  {
    id: 'fisi',
    title: 'Ausbildung Fachinformatiker/-in Systemintegration',
    icon: 'phosphorGraduationCap',
    tags: ['Ausbildung', 'Airportpark Greven', 'Start nach Vereinbarung'],
    intro:
      'Du willst wissen, wie Server, Firewalls und Cloud-Systeme wirklich zusammenspielen? Bei uns lernst du Systemintegration von Tag eins an bei echten Kunden, mit Kolleginnen und Kollegen, die dir alles zeigen.',
    tasks: [
      'Aufbau und Betreuung von Kundennetzwerken, Servern und Workstations',
      'Einblicke in Managed Services, Automatisierung und unser RMM/PSA-System',
      'Unterstützung im Support bei Kundenanfragen (Tier 1 und 2)',
      'Mitwirkung an Hardware-Rollouts',
    ],
    profile: [
      'Guter Schulabschluss (Realschule oder Abitur) und echtes Interesse an IT',
      'Neugier, Technik nicht nur zu bedienen, sondern zu verstehen',
      'Teamfähigkeit und Lust, Fragen zu stellen',
      'Erste Erfahrungen mit PCs oder Netzwerken sind ein Plus, kein Muss',
    ],
    note: 'Bewerbung als PDF reicht, ein Anschreiben ist kein Muss.',
  },
  {
    id: 'security-consultant',
    title: 'IT Consultant Security',
    icon: 'phosphorBriefcase',
    tags: ['Vollzeit', 'Airportpark Greven oder remote', 'Berufserfahrung erwünscht'],
    intro:
      'Du brennst für IT-Security, aber Folien ohne Substanz sind nicht dein Ding? Du gestaltest Assessments, NIS2-Strategien und Sicherheitskonzepte und siehst durch unsere Managed Services, dass deine Empfehlungen umgesetzt werden.',
    tasks: [
      'IT-Security-Assessments und NIS2-Gap-Analysen bei Kunden',
      'Sicherheitskonzepte, Notfallpläne und ISMS-Strukturen entwickeln',
      'Umsetzung gemeinsam mit unseren Managed-Service-Teams begleiten',
      'Security-Awareness-Trainings beim Kunden vor Ort',
    ],
    profile: [
      'Berufserfahrung in IT-Security, Consulting oder einer vergleichbaren Rolle',
      'Fundiertes Wissen zu Frameworks wie ISO 27001 und NIS2',
      'Du kannst Technik auch Nicht-Technikern erklären',
      'Reisebereitschaft für Kundentermine in der Region',
    ],
    note: 'Quereinstieg aus verwandten IT-Rollen? Sprich uns an.',
  },
];
