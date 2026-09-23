export interface ServicePackage {
  name: string;
  audience: string;
  features: string[];
  /** When a person gets involved; everything else runs automated. */
  humanTouch: string;
}

export interface ServiceLine {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  packages: [ServicePackage, ServicePackage, ServicePackage];
  tools: string[];
}

export const SERVICE_LINES: readonly ServiceLine[] = [
  {
    id: 'managed-it',
    title: 'Managed IT, das Rundum-Bundle',
    shortTitle: 'Managed IT',
    icon: 'phosphorStack',
    description:
      'Bündelt Firewall, Workstation, Server und Backup zu IT als Service. Gedacht für Unternehmen ohne eigene IT-Abteilung.',
    packages: [
      {
        name: 'Starter',
        audience: 'Kleinunternehmen ohne IT',
        features: ['Firewall, Workstation und Backup Basic', 'Zentrales Self-Service-Portal', 'Automatisches Mitarbeiter-Onboarding'],
        humanTouch: 'Nur für Freigaben',
      },
      {
        name: 'Professional',
        audience: 'Wachsende KMU',
        features: ['Alles aus Starter', 'Server Business', 'Automatisches Lizenz- und Kostenmanagement, Quartalsbericht'],
        humanTouch: 'Quartalsgespräch',
      },
      {
        name: 'Enterprise',
        audience: 'Standortverbund',
        features: ['Alles aus Professional', 'Virtueller IT-Verantwortlicher', 'Automatisches Compliance-Scoring, SLA-Dashboard'],
        humanTouch: 'Strategische Reviews',
      },
    ],
    tools: ['NinjaOne', 'Atera', 'Autotask, SuperOps oder Halo PSA', 'Microsoft 365 und Entra ID'],
  },
  {
    id: 'firewall',
    title: 'Managed Firewall',
    shortTitle: 'Firewall',
    icon: 'phosphorShieldCheck',
    description: 'Standardisierte Absicherung Ihres Netzwerks, von der kleinen Filiale bis zum Standortverbund.',
    packages: [
      {
        name: 'Basic',
        audience: 'Kleine Standorte',
        features: ['Standard-Ruleset', 'Automatische Firmware- und Signatur-Updates', 'Monitoring und monatlicher Compliance-Report'],
        humanTouch: 'Nur bei Alarm',
      },
      {
        name: 'Business',
        audience: 'KMU mit mehreren Standorten',
        features: ['Alles aus Basic', 'Self-Service-Änderungen mit Freigabe', 'Automatisches Regel-Audit, IDS/IPS'],
        humanTouch: 'Quartals-Review',
      },
      {
        name: 'Enterprise',
        audience: 'Standortverbund',
        features: ['Alles aus Business', 'SD-WAN-Orchestrierung', 'Change-Management mit Rollback, SIEM'],
        humanTouch: 'Nur bei kritischem Incident',
      },
    ],
    tools: ['Fortinet FortiManager', 'Sophos Central', 'WatchGuard Cloud', 'Wazuh oder Microsoft Sentinel'],
  },
  {
    id: 'workstation',
    title: 'Managed Workstation',
    shortTitle: 'Workstation',
    icon: 'phosphorLaptop',
    description: 'Automatisierter Arbeitsplatz-Betrieb, vom Zero-Touch-Rollout bis zum Zero-Trust-Setup.',
    packages: [
      {
        name: 'Basic',
        audience: 'Standard-Arbeitsplatz',
        features: ['Zero-Touch-Deployment', 'Patch-Management für Betriebssystem und Apps', 'AV/EDR mit automatischer Reaktion'],
        humanTouch: 'Nur bei EDR-Eskalation',
      },
      {
        name: 'Business',
        audience: 'Mit Compliance-Anforderungen',
        features: ['Alles aus Basic', 'Erzwungene Verschlüsselung und Policies', 'App-Self-Service, Health-Score-Report'],
        humanTouch: 'Stichproben-Review',
      },
      {
        name: 'Enterprise',
        audience: 'Hybride und Remote-Teams',
        features: ['Alles aus Business', 'Conditional Access und Zero Trust', 'Automatisches Lifecycle-Management, Self-Service-Reset'],
        humanTouch: 'Nur in Ausnahmefällen',
      },
    ],
    tools: ['Microsoft Intune', 'NinjaOne', 'Windows Autopilot', 'Apple Business Manager', 'Microsoft Defender oder SentinelOne'],
  },
  {
    id: 'server',
    title: 'Managed Server',
    shortTitle: 'Server',
    icon: 'phosphorHardDrives',
    description: 'Vom Einzelserver bis zur hochverfügbaren, kritischen Systemlandschaft.',
    packages: [
      {
        name: 'Basic',
        audience: 'Einzelserver',
        features: ['Monitoring von Ressourcen und Diensten', 'Automatische Patch-Fenster', 'Automatisches Alerting'],
        humanTouch: 'Nur bei Alarm',
      },
      {
        name: 'Business',
        audience: 'Mehrere Server, Virtualisierung',
        features: ['Alles aus Basic', 'Kapazitäts- und Trend-Reporting', 'Self-Healing, automatisches Snapshot-Management'],
        humanTouch: 'Planung der Wartungsfenster',
      },
      {
        name: 'Enterprise',
        audience: 'Kritische Systeme, Hochverfügbarkeit',
        features: ['Alles aus Business', 'Failover-Monitoring', 'Runbook-Automation, Security-Baseline-Scan'],
        humanTouch: 'Nur bei kritischem Incident',
      },
    ],
    tools: ['Zabbix', 'PRTG', 'Checkmk', 'Ansible', 'PowerShell DSC'],
  },
  {
    id: 'backup',
    title: 'Managed Backup',
    shortTitle: 'Backup',
    icon: 'phosphorCloudArrowUp',
    description: 'Automatisierte Sicherung mit Erfolgskontrolle, von der Standardsicherung bis zum Disaster-Recovery-Runbook.',
    packages: [
      {
        name: 'Basic',
        audience: 'Einzelserver und Workstations',
        features: ['Tägliches automatisches Backup', 'Automatische Erfolgskontrolle mit Alarm', 'Standard-Aufbewahrung'],
        humanTouch: 'Nur bei fehlgeschlagener Sicherung',
      },
      {
        name: 'Business',
        audience: 'Mit RTO/RPO-Anforderungen',
        features: ['Alles aus Basic', 'Automatische monatliche Restore-Tests', '3-2-1-Strategie inklusive Cloud-Kopie'],
        humanTouch: 'Review der Restore-Tests',
      },
      {
        name: 'Enterprise',
        audience: 'Kritische Systeme, Disaster Recovery',
        features: ['Alles aus Business', 'Automatisches DR-Runbook', 'Immutable oder Air-Gapped Storage, Anomalieerkennung'],
        humanTouch: 'Nur im DR-Fall',
      },
    ],
    tools: ['Veeam mit Cloud Connect', 'Acronis Cyber Protect Cloud', 'Datto BCDR', 'Synology Active Backup'],
  },
  {
    id: 'telefonie',
    title: 'Managed Cloud-Telefonie',
    shortTitle: 'Cloud-Telefonie',
    icon: 'phosphorPhone',
    description: 'Cloud-Telefonanlage mit Self-Service-Onboarding, vom Einzelplatz bis zum CRM-integrierten Call-Center.',
    packages: [
      {
        name: 'Basic',
        audience: 'Einzelplatz oder kleines Büro',
        features: ['Cloud-PBX-Nebenstelle', 'Standard-IVR aus Vorlage', 'Automatisches Self-Service-Onboarding'],
        humanTouch: 'Nicht nötig, Self-Service',
      },
      {
        name: 'Business',
        audience: 'KMU mit Call-Routing',
        features: ['Alles aus Basic', 'Call-Center-Queues, No-Code-IVR', 'Automatisches Call-Reporting'],
        humanTouch: 'Nur bei Störung',
      },
      {
        name: 'Enterprise',
        audience: 'Standortverbund, CRM-Anbindung',
        features: ['Alles aus Business', 'CTI- und CRM-Anbindung per API', 'SLA- und QoS-Monitoring'],
        humanTouch: 'Begleitung beim Rollout',
      },
    ],
    tools: ['3CX', 'Placetel', 'NFON', 'sipgate team', 'Microsoft Teams Phone'],
  },
];

export const SERVICE_PRINCIPLES = [
  {
    title: 'Standardisierung vor Individualisierung',
    text: 'Feste Leistungsumfänge statt Einzelvereinbarungen. Klar bepreist und schnell bereitgestellt.',
    icon: 'phosphorSquaresFour',
  },
  {
    title: 'Self-Service statt Ticket',
    text: 'Freigaben, Reports und Standardaufgaben erledigen Sie direkt im Kundenportal.',
    icon: 'phosphorCursorClick',
  },
  {
    title: 'Automatisierte Provisionierung',
    text: 'Onboarding und Setup laufen über Skripte und RMM-Profile, nicht über Handarbeit.',
    icon: 'phosphorRobot',
  },
  {
    title: 'Monitoring vor Reaktion',
    text: 'Probleme werden erkannt und wo möglich automatisch behoben, bevor sie Sie erreichen.',
    icon: 'phosphorPulse',
  },
] as const;

export const ESCALATION_TIERS = [
  { tier: 'Tier 1', title: 'Automation', text: 'Monitoring, Self-Healing und Self-Service lösen den Großteil der Anliegen sofort.' },
  { tier: 'Tier 2', title: 'Remote-Techniker', text: 'Greift ein, wenn die Automation ein Problem nicht selbst beheben kann.' },
  { tier: 'Tier 3', title: 'Spezialist', text: 'Übernimmt komplexe Störungen und kritische Incidents.' },
] as const;
