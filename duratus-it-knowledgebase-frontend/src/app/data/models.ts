/*
 * Data model of the internal knowledge base. One customer file ("Kundenakte") ties everything together:
 * every record below carries a customerId, except documents and templates that may be company-wide (customerId: null).
 * Dates are German strings ("17.09.2026") so they can be shown as-is; parseDateDe() turns them into Date objects.
 */

// ---------------------------------------------------------------- Kunden, Standorte, Kontakte

export type ServiceLevel = 'basis' | 'sorglos' | 'premium';

export interface Customer {
  id: string;
  name: string;
  shortName: string;
  branch: string;
  employees: number;
  workplaces: number;
  since: string;
  serviceLevel: ServiceLevel;
  /** Named technician who owns this customer file. */
  responsible: string;
  substitute: string;
  /** Reaction time promised in the contract. */
  reactionTime: string;
  serviceWindow: string;
  /** Monthly net volume in EUR. */
  monthlyVolume: number;
  /** Relevant for NIS2 / KRITIS assessments. */
  nis2: 'betroffen' | 'nicht betroffen' | 'in Prüfung';
  notes: string;
  tags: readonly string[];
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
  street: string;
  city: string;
  /** Headquarter or branch office. */
  main: boolean;
  wanProvider: string;
  wanBandwidth: string;
  backupWan: string | null;
  accessNote: string;
  users: number;
}

export interface Contact {
  id: string;
  customerId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  siteId: string;
  /** Is allowed to approve changes and order services. */
  decisionMaker: boolean;
  /** Part of the emergency call chain. */
  emergency: boolean;
  note: string;
}

// ---------------------------------------------------------------- Zugänge (Passwort-Tresor)

export type SecretCategory =
  | 'firewall'
  | 'server'
  | 'netzwerk'
  | 'cloud'
  | 'datenbank'
  | 'anwendung'
  | 'wlan'
  | 'portal';

/** Who may open the entry. The demo only shows the level, a real vault enforces it server-side. */
export type SecretScope = 'team' | 'admin' | 'vier-augen';

export interface Secret {
  id: string;
  customerId: string;
  name: string;
  category: SecretCategory;
  username: string;
  /** Demo value only. A real vault never sends the plain text to the browser. */
  password: string;
  url: string | null;
  /** Second factor stored separately (in the demo only a flag). */
  mfa: boolean;
  scope: SecretScope;
  /** Date of the last rotation and the interval it has to follow. */
  rotatedAt: string;
  rotateEveryDays: number;
  assetId: string | null;
  note: string;
  tags: readonly string[];
}

// ---------------------------------------------------------------- Infrastruktur

export type AssetType =
  | 'firewall'
  | 'switch'
  | 'accesspoint'
  | 'server'
  | 'nas'
  | 'usv'
  | 'drucker'
  | 'client'
  | 'sonstiges';

export type AssetStatus = 'produktiv' | 'ersatz' | 'ausgemustert';

export interface Asset {
  id: string;
  customerId: string;
  siteId: string;
  name: string;
  type: AssetType;
  vendor: string;
  model: string;
  serial: string;
  ip: string | null;
  os: string | null;
  purchased: string;
  warrantyUntil: string;
  /** End of manufacturer support, if known. */
  eolUntil: string | null;
  status: AssetStatus;
  location: string;
  note: string;
}

// ---------------------------------------------------------------- Netzwerk

export type NetworkNodeType = 'wan' | 'firewall' | 'switch' | 'accesspoint' | 'server' | 'nas' | 'client' | 'cloud';

export interface NetworkNode {
  id: string;
  label: string;
  sublabel: string;
  type: NetworkNodeType;
  /** Position on the 1000 × 620 diagram canvas. */
  x: number;
  y: number;
  assetId: string | null;
  vlanId: number | null;
}

export type LinkKind = 'lwl' | 'kupfer' | 'wan' | 'vpn' | 'wlan';

export interface NetworkLink {
  from: string;
  to: string;
  kind: LinkKind;
  label: string;
}

export interface Vlan {
  id: number;
  name: string;
  subnet: string;
  gateway: string;
  dhcpRange: string | null;
  purpose: string;
  /** VLANs this one may reach (firewall policy in short form). */
  reaches: readonly string[];
}

export interface FirewallRule {
  id: string;
  name: string;
  source: string;
  destination: string;
  service: string;
  action: 'erlauben' | 'blockieren';
  note: string;
}

export interface VpnTunnel {
  id: string;
  name: string;
  kind: 'site-to-site' | 'client';
  peer: string;
  networks: string;
  note: string;
}

export interface NetworkPlan {
  customerId: string;
  siteId: string;
  updated: string;
  author: string;
  summary: string;
  nodes: readonly NetworkNode[];
  links: readonly NetworkLink[];
  vlans: readonly Vlan[];
  rules: readonly FirewallRule[];
  vpn: readonly VpnTunnel[];
}

// ---------------------------------------------------------------- Dokumentation

export type DocCategory = 'runbook' | 'howto' | 'richtlinie' | 'checkliste' | 'architektur';

export interface DocSection {
  heading: string;
  body: string;
  /** Numbered work steps. */
  steps?: readonly string[];
  /** Highlighted warning below the section. */
  warning?: string;
  /** Commands or configuration shown in a monospace block. */
  code?: string;
}

export interface DocPage {
  id: string;
  /** null = company-wide document, valid for every customer. */
  customerId: string | null;
  title: string;
  category: DocCategory;
  summary: string;
  updated: string;
  author: string;
  /** Documents have to be reviewed regularly; this is the next due date. */
  reviewDue: string;
  tags: readonly string[];
  sections: readonly DocSection[];
  relatedAssets: readonly string[];
  relatedSecrets: readonly string[];
}

// ---------------------------------------------------------------- Tätigkeiten an der Infrastruktur

export type ChangeType = 'change' | 'wartung' | 'stoerung' | 'projekt' | 'onboarding' | 'offboarding';
export type ChangeRisk = 'niedrig' | 'mittel' | 'hoch';
export type ChangeStatus = 'geplant' | 'umgesetzt' | 'zurueckgerollt';

export interface ChangeEntry {
  id: string;
  customerId: string;
  title: string;
  date: string;
  type: ChangeType;
  risk: ChangeRisk;
  status: ChangeStatus;
  technician: string;
  /** Working time in hours. */
  duration: number;
  summary: string;
  steps: readonly string[];
  rollback: string;
  affectedAssets: readonly string[];
  /** Ticket in the customer portal, if the work came from one. */
  ticketRef: string | null;
  approvedBy: string | null;
}

// ---------------------------------------------------------------- Lizenzen, Zertifikate, Domains

export type LicenseKind = 'abo' | 'dauerlizenz' | 'zertifikat' | 'domain' | 'support';

export interface License {
  id: string;
  customerId: string;
  name: string;
  vendor: string;
  kind: LicenseKind;
  quantity: number;
  unit: string;
  renewsOn: string;
  /** Net cost per year in EUR. */
  costPerYear: number;
  autoRenew: boolean;
  owner: string;
  note: string;
}

// ---------------------------------------------------------------- Notfall

export interface EscalationStep {
  level: number;
  role: string;
  name: string;
  phone: string;
  reachable: string;
}

export interface EmergencyScenario {
  id: string;
  title: string;
  impact: string;
  steps: readonly string[];
  lastTested: string | null;
}

export interface EmergencyPlan {
  customerId: string;
  updated: string;
  /** Recovery time / recovery point objective agreed with the customer. */
  rto: string;
  rpo: string;
  backupChain: readonly string[];
  offlineCopy: string;
  /** Order in which systems come back up. */
  restoreOrder: readonly string[];
  escalation: readonly EscalationStep[];
  scenarios: readonly EmergencyScenario[];
  insurance: string;
}

// ---------------------------------------------------------------- Audit

export type AuditAction =
  | 'zugang-angezeigt'
  | 'zugang-kopiert'
  | 'zugang-rotiert'
  | 'notiz-geaendert'
  | 'netzplan-geaendert'
  | 'export';

export interface AuditEntry {
  id: string;
  /** ISO timestamp, formatted for display only. */
  at: string;
  user: string;
  action: AuditAction;
  target: string;
  customerId: string | null;
}

// ---------------------------------------------------------------- Angemeldeter Mitarbeiter

export type StaffRole = 'techniker' | 'administrator' | 'geschaeftsfuehrung';

export interface StaffAccount {
  name: string;
  email: string;
  role: StaffRole;
  team: string;
  phone: string;
}
