export interface ReferenceCase {
  service: string;
  title: string;
  icon: string;
  meta: string;
  situation: string;
  solution: string;
  result: string;
}

// Beispielhafte, anonymisierte Projektszenarien. Durch freigegebene Kundenreferenzen ersetzen.
export const REFERENCE_CASES: readonly ReferenceCase[] = [
  {
    service: 'Managed IT',
    title: 'Maschinenbau und Fertigung',
    icon: 'phosphorFactory',
    meta: 'Produzierendes Gewerbe, ca. 60 Mitarbeitende, NRW',
    situation: 'Gewachsene Serverlandschaft, keine eigene IT-Abteilung, hohe Abhängigkeit von einem Einzeldienstleister.',
    solution: 'Server-Konsolidierung und Umstieg auf Managed IT Professional inklusive Backup und Managed Firewall.',
    result: 'Spürbar kürzere Reaktionszeiten und planbare Monatskosten statt Einzelrechnungen.',
  },
  {
    service: 'Managed Workstation',
    title: 'Kanzlei und Beratung',
    icon: 'phosphorScales',
    meta: 'Rechts- und Steuerberatung, 15 Arbeitsplätze, Münsterland',
    situation: 'Sensible Mandantendaten, hohe Compliance-Anforderungen und veraltete Endgeräte.',
    solution: 'Zero-Touch-Rollout neuer Notebooks aus unserem Produktsortiment, Managed Workstation Business mit erzwungener Verschlüsselung.',
    result: 'Vollständige Verschlüsselung und Patch-Compliance ohne internen Zusatzaufwand.',
  },
  {
    service: 'IT Consulting',
    title: 'Logistikdienstleister',
    icon: 'phosphorTruck',
    meta: 'Transport und Logistik, ca. 120 Mitarbeitende, Münster und Osnabrück',
    situation: 'Anstehende NIS2-Pflichten und unklare Verantwortlichkeiten für die IT-Sicherheit.',
    solution: 'Security-Assessment mit NIS2-Gap-Analyse, anschließende Umsetzungsbegleitung und Managed Firewall Enterprise.',
    result: 'Klarer Maßnahmenplan mit priorisierten Quick-Wins innerhalb von vier Wochen.',
  },
  {
    service: 'Managed Cloud-Telefonie',
    title: 'Handel mit mehreren Standorten',
    icon: 'phosphorStorefront',
    meta: 'Groß- und Einzelhandel, 4 Standorte, NRW und Niedersachsen',
    situation: 'Getrennte Telefonanlagen je Standort, keine einheitliche Erreichbarkeit.',
    solution: 'Zentrale Cloud-Telefonanlage mit standortübergreifenden Rufgruppen, Managed Cloud-Telefonie Business.',
    result: 'Eine Rufnummernstruktur für alle Standorte, Änderungen per Self-Service ohne Techniker.',
  },
];
