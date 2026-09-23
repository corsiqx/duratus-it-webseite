import {
  AssetStatus,
  AssetType,
  AuditAction,
  ChangeRisk,
  ChangeStatus,
  ChangeType,
  DocCategory,
  LicenseKind,
  LinkKind,
  NetworkNodeType,
  SecretCategory,
  SecretScope,
  ServiceLevel,
} from './models';

/** Semantic badge tones. Status colors are reserved for state and always come with a text label. */
export type Tone = 'good' | 'info' | 'warning' | 'critical' | 'neutral';

export interface StatusLabel {
  label: string;
  tone: Tone;
}

export interface TypeLabel {
  label: string;
  icon: string;
}

export const SERVICE_LEVEL: Record<ServiceLevel, StatusLabel> = {
  basis: { label: 'Basis Monitoring', tone: 'neutral' },
  sorglos: { label: 'Sorglos', tone: 'info' },
  premium: { label: 'Premium', tone: 'good' },
};

export const SECRET_CATEGORY: Record<SecretCategory, TypeLabel> = {
  firewall: { label: 'Firewall', icon: 'phosphorShieldCheck' },
  server: { label: 'Server und Speicher', icon: 'phosphorHardDrives' },
  netzwerk: { label: 'Netzwerk', icon: 'phosphorTreeStructure' },
  cloud: { label: 'Cloud-Dienst', icon: 'phosphorCloud' },
  datenbank: { label: 'Datenbank', icon: 'phosphorDatabase' },
  anwendung: { label: 'Anwendung', icon: 'phosphorAppWindow' },
  wlan: { label: 'WLAN', icon: 'phosphorWifiHigh' },
  portal: { label: 'Hersteller-Portal', icon: 'phosphorGlobe' },
};

/** Who is allowed to open an entry. The label is shown next to every secret. */
export const SECRET_SCOPE: Record<SecretScope, StatusLabel & { hint: string }> = {
  team: {
    label: 'Team',
    tone: 'neutral',
    hint: 'Alle Technikerinnen und Techniker mit Zugriff auf diesen Kunden.',
  },
  admin: {
    label: 'Administration',
    tone: 'info',
    hint: 'Nur Personen mit Administratorrolle.',
  },
  'vier-augen': {
    label: 'Vier Augen',
    tone: 'warning',
    hint: 'Nur gemeinsam mit einer zweiten Person aus dem Team öffnen. Jede Nutzung wird protokolliert.',
  },
};

export const ASSET_TYPE: Record<AssetType, TypeLabel> = {
  firewall: { label: 'Firewall', icon: 'phosphorShieldCheck' },
  switch: { label: 'Switch', icon: 'phosphorTreeStructure' },
  accesspoint: { label: 'Accesspoint', icon: 'phosphorWifiHigh' },
  server: { label: 'Server', icon: 'phosphorHardDrives' },
  nas: { label: 'Speicher / NAS', icon: 'phosphorDatabase' },
  usv: { label: 'USV', icon: 'phosphorBatteryCharging' },
  drucker: { label: 'Drucker', icon: 'phosphorPrinter' },
  client: { label: 'Arbeitsplatz', icon: 'phosphorDesktop' },
  sonstiges: { label: 'Sonstiges', icon: 'phosphorPackage' },
};

export const ASSET_STATUS: Record<AssetStatus, StatusLabel> = {
  produktiv: { label: 'Produktiv', tone: 'good' },
  ersatz: { label: 'Ersatzgerät', tone: 'info' },
  ausgemustert: { label: 'Ausgemustert', tone: 'neutral' },
};

export const NODE_TYPE: Record<NetworkNodeType, TypeLabel> = {
  wan: { label: 'Internetanschluss', icon: 'phosphorGlobe' },
  firewall: { label: 'Firewall', icon: 'phosphorShieldCheck' },
  switch: { label: 'Switch', icon: 'phosphorTreeStructure' },
  accesspoint: { label: 'Accesspoint', icon: 'phosphorWifiHigh' },
  server: { label: 'Server', icon: 'phosphorHardDrives' },
  nas: { label: 'Speicher', icon: 'phosphorDatabase' },
  client: { label: 'Endgeräte', icon: 'phosphorDesktop' },
  cloud: { label: 'Externe Verbindung', icon: 'phosphorCloud' },
};

export const LINK_KIND: Record<LinkKind, { label: string; stroke: string; dash: string | null }> = {
  lwl: { label: 'Lichtwellenleiter', stroke: '#0d9488', dash: null },
  kupfer: { label: 'Kupfer', stroke: '#94a3b8', dash: null },
  wan: { label: 'Internetanschluss', stroke: '#2563eb', dash: null },
  vpn: { label: 'VPN-Tunnel', stroke: '#7c3aed', dash: '7 5' },
  wlan: { label: 'Funk', stroke: '#f59e0b', dash: '3 4' },
};

export const DOC_CATEGORY: Record<DocCategory, TypeLabel> = {
  runbook: { label: 'Runbook', icon: 'phosphorListChecks' },
  howto: { label: 'Anleitung', icon: 'phosphorBookOpen' },
  richtlinie: { label: 'Richtlinie', icon: 'phosphorScales' },
  checkliste: { label: 'Checkliste', icon: 'phosphorCheckSquare' },
  architektur: { label: 'Architektur', icon: 'phosphorBlueprint' },
};

export const CHANGE_TYPE: Record<ChangeType, TypeLabel> = {
  change: { label: 'Änderung', icon: 'phosphorGitBranch' },
  wartung: { label: 'Wartung', icon: 'phosphorWrench' },
  stoerung: { label: 'Störung', icon: 'phosphorWarningCircle' },
  projekt: { label: 'Projekt', icon: 'phosphorRocketLaunch' },
  onboarding: { label: 'Onboarding', icon: 'phosphorUserPlus' },
  offboarding: { label: 'Offboarding', icon: 'phosphorUserMinus' },
};

export const CHANGE_RISK: Record<ChangeRisk, StatusLabel> = {
  niedrig: { label: 'Risiko niedrig', tone: 'neutral' },
  mittel: { label: 'Risiko mittel', tone: 'warning' },
  hoch: { label: 'Risiko hoch', tone: 'critical' },
};

export const CHANGE_STATUS: Record<ChangeStatus, StatusLabel> = {
  geplant: { label: 'Geplant', tone: 'info' },
  umgesetzt: { label: 'Umgesetzt', tone: 'good' },
  zurueckgerollt: { label: 'Zurückgerollt', tone: 'warning' },
};

export const LICENSE_KIND: Record<LicenseKind, TypeLabel> = {
  abo: { label: 'Abonnement', icon: 'phosphorArrowsClockwise' },
  dauerlizenz: { label: 'Dauerlizenz', icon: 'phosphorSeal' },
  zertifikat: { label: 'Zertifikat', icon: 'phosphorCertificate' },
  domain: { label: 'Domain', icon: 'phosphorGlobe' },
  support: { label: 'Support und Wartung', icon: 'phosphorLifebuoy' },
};

export const AUDIT_ACTION: Record<AuditAction, TypeLabel> = {
  'zugang-angezeigt': { label: 'Zugang angezeigt', icon: 'phosphorEye' },
  'zugang-kopiert': { label: 'Zugang kopiert', icon: 'phosphorCopy' },
  'zugang-rotiert': { label: 'Passwort gewechselt', icon: 'phosphorArrowsClockwise' },
  'notiz-geaendert': { label: 'Notiz geändert', icon: 'phosphorPencilSimple' },
  'netzplan-geaendert': { label: 'Netzwerkplan geändert', icon: 'phosphorTreeStructure' },
  export: { label: 'Export erstellt', icon: 'phosphorFileArrowDown' },
};

/** Turns a number of days left into a badge: overdue, due soon, fine. */
export function dueLabel(daysLeft: number, soonDays = 60): StatusLabel {
  if (daysLeft < 0) return { label: `${Math.abs(daysLeft)} Tage überfällig`, tone: 'critical' };
  if (daysLeft === 0) return { label: 'Heute fällig', tone: 'critical' };
  if (daysLeft <= soonDays) return { label: `In ${daysLeft} Tagen fällig`, tone: 'warning' };
  return { label: `Noch ${daysLeft} Tage`, tone: 'good' };
}
