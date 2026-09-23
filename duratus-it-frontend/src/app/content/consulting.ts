export interface ConsultingModule {
  title: string;
  icon: string;
  text: string;
  format: string;
}

export const CONSULTING_GROUPS: readonly { title: string; modules: ConsultingModule[] }[] = [
  {
    title: 'Strategie und Projekte',
    modules: [
      {
        title: 'IT-Strategieberatung',
        icon: 'phosphorCompass',
        text: 'IT-Roadmap, Digitalisierungsstrategie und Make-or-Buy-Entscheidungen, passend zu Budget und Zielen.',
        format: 'Workshop mit schriftlichem Bericht',
      },
      {
        title: 'IT-Projektberatung',
        icon: 'phosphorKanban',
        text: 'Planung und Begleitung konkreter Vorhaben wie Server-Migration, Cloud-Umzug oder Standortvernetzung.',
        format: 'Abrechnung nach Tagessatz',
      },
      {
        title: 'Umsetzungsbegleitung',
        icon: 'phosphorPath',
        text: 'Projektleitung und Steuerung bei der Umsetzung der empfohlenen Maßnahmen.',
        format: 'Projektbasiert oder als Retainer',
      },
    ],
  },
  {
    title: 'IT-Security',
    modules: [
      {
        title: 'IT-Security-Assessment',
        icon: 'phosphorMagnifyingGlass',
        text: 'Schwachstellen-Scan, Reifegrad-Assessment und NIS2-Gap-Analyse.',
        format: 'Standardisierter Report als Ergebnis',
      },
      {
        title: 'Security-Strategie und ISMS',
        icon: 'phosphorLockKey',
        text: 'Sicherheitskonzept, Notfallplanung, Awareness-Programm und Aufbau eines ISMS, etwa in Richtung ISO 27001.',
        format: 'Projektbasiert',
      },
    ],
  },
];

export const CONSULTING_APPROACH = [
  {
    title: 'Automatisierte Vorarbeit',
    text: 'Assessments starten mit Scan-Tools statt mit tagelanger manueller Bestandsaufnahme. Das senkt Ihren Beratungsaufwand.',
  },
  {
    title: 'Klare Handlungsempfehlung',
    text: 'Ergebnisse münden in konkrete Maßnahmen, auf Wunsch direkt mit passenden Produkten und Managed-Service-Paketen.',
  },
  {
    title: 'Erfahrenes Kernteam',
    text: 'Senior-Consultants als feste Ansprechpartner, ergänzt um ein Netzwerk spezialisierter Expertinnen und Experten.',
  },
] as const;
