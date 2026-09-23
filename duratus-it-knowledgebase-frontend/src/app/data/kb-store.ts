import { Injectable, computed, effect, signal } from '@angular/core';
import { dateTimeDe, parseDateDe, startOfDay } from '../shared/format';
import { readJson, removeKey, writeJson } from './browser-storage';
import { DEMO_ASSETS } from './demo/assets';
import { DEMO_CONTACTS, DEMO_CUSTOMERS, DEMO_SITES, DEMO_STAFF } from './demo/customers';
import { DEMO_DOCS } from './demo/docs';
import { DEMO_NETWORKS } from './demo/network';
import { DEMO_AUDIT, DEMO_CHANGES, DEMO_EMERGENCY, DEMO_LICENSES } from './demo/operations';
import { DEMO_SECRETS } from './demo/secrets';
import { AuditAction, AuditEntry, NetworkLink, NetworkNode, NetworkPlan, Secret, StaffAccount } from './models';
import { daysUntilRotation, rotationDue } from './secret-rules';

export const STORAGE_KEY = 'duratus-wissensdatenbank-demo-v1';

/** Drawing of a plan that was edited in the browser; everything else of the plan stays as delivered. */
export interface PlanDrawing {
  nodes: NetworkNode[];
  links: NetworkLink[];
  updated: string;
  author: string;
}

/** Everything a user changes in the demo. The read-only master data stays in the demo files. */
interface PersistedState {
  staff: StaffAccount;
  /** Secrets that were rotated in the demo, by id. */
  rotated: Record<string, { password: string; rotatedAt: string }>;
  /** Notes edited in the demo, by record id. */
  notes: Record<string, string>;
  /** Network plans drawn in the editor, keyed by "customerId|siteId". */
  drawings: Record<string, PlanDrawing>;
  audit: AuditEntry[];
  /** Ids of recently opened customer files, newest first. */
  recent: string[];
  /** Pinned customer files. */
  pinned: string[];
}

function initialState(): PersistedState {
  return {
    staff: { ...DEMO_STAFF },
    rotated: {},
    notes: {},
    drawings: {},
    audit: [...DEMO_AUDIT],
    recent: ['muster-gmbh', 'nordlicht-logistik'],
    pinned: ['nordlicht-logistik'],
  };
}

/** Key of a plan inside the drawings map. */
export const planKey = (customerId: string, siteId: string): string => `${customerId}|${siteId}`;

/** Days between today and a German date string; negative means the date has passed. */
export function daysUntil(dateDeString: string, today = new Date()): number {
  return Math.round((parseDateDe(dateDeString).getTime() - startOfDay(today).getTime()) / 86_400_000);
}

export interface ExpiryItem {
  id: string;
  customerId: string;
  title: string;
  detail: string;
  date: string;
  daysLeft: number;
  kind: 'lizenz' | 'garantie' | 'zertifikat' | 'domain' | 'rotation' | 'pruefung';
  link: readonly unknown[];
}

/**
 * Client-side state of the knowledge base. Master data comes from the demo files, everything the user changes is
 * mirrored to localStorage so it survives a reload. This is the single place to connect an API later
 * (RMM/PSA for the inventory, a real vault for the credentials).
 */
@Injectable({ providedIn: 'root' })
export class KbStore {
  readonly customers = signal(DEMO_CUSTOMERS).asReadonly();
  readonly sites = signal(DEMO_SITES).asReadonly();
  readonly contacts = signal(DEMO_CONTACTS).asReadonly();
  readonly assets = signal(DEMO_ASSETS).asReadonly();
  readonly docs = signal(DEMO_DOCS).asReadonly();
  readonly changes = signal(DEMO_CHANGES).asReadonly();
  readonly licenses = signal(DEMO_LICENSES).asReadonly();
  readonly emergencyPlans = signal(DEMO_EMERGENCY).asReadonly();

  private readonly state = signal<PersistedState>({
    ...initialState(),
    ...readJson<PersistedState>('local', STORAGE_KEY),
  });

  readonly staff = computed(() => this.state().staff);
  readonly audit = computed(() => [...this.state().audit].sort((a, b) => b.at.localeCompare(a.at)));
  readonly pinned = computed(() => this.state().pinned);

  /** Secrets with the rotations made in the demo applied. */
  readonly secrets = computed(() => {
    const rotated = this.state().rotated;
    const notes = this.state().notes;
    return DEMO_SECRETS.map((secret): Secret => {
      const change = rotated[secret.id];
      return {
        ...secret,
        ...(change ? { password: change.password, rotatedAt: change.rotatedAt } : {}),
        note: notes[secret.id] ?? secret.note,
      };
    });
  });

  /** Plans with the drawings made in the editor applied. Everything except nodes and links stays as delivered. */
  readonly networks = computed(() => {
    const drawings = this.state().drawings;
    return DEMO_NETWORKS.map((plan): NetworkPlan => {
      const drawing = drawings[planKey(plan.customerId, plan.siteId)];
      return drawing ? { ...plan, nodes: drawing.nodes, links: drawing.links, updated: drawing.updated, author: drawing.author } : plan;
    });
  });

  readonly recentCustomers = computed(() =>
    this.state()
      .recent.map((id) => this.customers().find((customer) => customer.id === id))
      .filter((customer) => customer !== undefined),
  );

  readonly pinnedCustomers = computed(() =>
    this.state()
      .pinned.map((id) => this.customers().find((customer) => customer.id === id))
      .filter((customer) => customer !== undefined),
  );

  constructor() {
    effect(() => writeJson('local', STORAGE_KEY, this.state()));
  }

  // ---------------------------------------------------------------- Zugriff auf einen Kunden

  customer(id: string) {
    return this.customers().find((customer) => customer.id === id);
  }

  site(id: string) {
    return this.sites().find((site) => site.id === id);
  }

  asset(id: string) {
    return this.assets().find((asset) => asset.id === id);
  }

  sitesOf(customerId: string) {
    return this.sites().filter((site) => site.customerId === customerId);
  }

  contactsOf(customerId: string) {
    return this.contacts().filter((contact) => contact.customerId === customerId);
  }

  assetsOf(customerId: string) {
    return this.assets().filter((asset) => asset.customerId === customerId);
  }

  secretsOf(customerId: string) {
    return this.secrets().filter((secret) => secret.customerId === customerId);
  }

  networksOf(customerId: string) {
    return this.networks().filter((plan) => plan.customerId === customerId);
  }

  /** Customer documents plus the company-wide ones, which apply everywhere. */
  docsOf(customerId: string) {
    return this.docs().filter((doc) => doc.customerId === customerId);
  }

  changesOf(customerId: string) {
    return this.changes().filter((change) => change.customerId === customerId);
  }

  licensesOf(customerId: string) {
    return this.licenses().filter((license) => license.customerId === customerId);
  }

  emergencyOf(customerId: string) {
    return this.emergencyPlans().find((plan) => plan.customerId === customerId);
  }

  // ---------------------------------------------------------------- Fristen

  /** Everything that runs out soon or is already overdue, newest deadline first. */
  readonly expiries = computed<readonly ExpiryItem[]>(() => {
    const items: ExpiryItem[] = [];

    for (const license of this.licenses()) {
      items.push({
        id: license.id,
        customerId: license.customerId,
        title: license.name,
        detail: license.autoRenew ? `${license.vendor}, verlängert sich automatisch` : `${license.vendor}, keine automatische Verlängerung`,
        date: license.renewsOn,
        daysLeft: daysUntil(license.renewsOn),
        kind: license.kind === 'zertifikat' ? 'zertifikat' : license.kind === 'domain' ? 'domain' : 'lizenz',
        link: ['/lizenzen'],
      });
    }

    for (const asset of this.assets()) {
      if (asset.status === 'ausgemustert') continue;
      items.push({
        id: `${asset.id}-garantie`,
        customerId: asset.customerId,
        title: `Garantie ${asset.name}`,
        detail: `${asset.vendor} ${asset.model}`,
        date: asset.warrantyUntil,
        daysLeft: daysUntil(asset.warrantyUntil),
        kind: 'garantie',
        link: ['/inventar'],
      });
    }

    for (const secret of this.secrets()) {
      items.push({
        id: `${secret.id}-rotation`,
        customerId: secret.customerId,
        title: `Passwortwechsel: ${secret.name}`,
        detail: `Alle ${secret.rotateEveryDays} Tage, zuletzt am ${secret.rotatedAt}`,
        date: rotationDue(secret),
        daysLeft: daysUntilRotation(secret),
        kind: 'rotation',
        link: ['/zugaenge'],
      });
    }

    for (const doc of this.docs()) {
      items.push({
        id: `${doc.id}-pruefung`,
        customerId: doc.customerId ?? 'allgemein',
        title: `Prüfung fällig: ${doc.title}`,
        detail: `Zuletzt aktualisiert am ${doc.updated} von ${doc.author}`,
        date: doc.reviewDue,
        daysLeft: daysUntil(doc.reviewDue),
        kind: 'pruefung',
        link: ['/dokumentation', doc.id],
      });
    }

    return items.sort((a, b) => a.daysLeft - b.daysLeft);
  });

  /** Overdue or due within 60 days. */
  readonly openExpiries = computed(() => this.expiries().filter((item) => item.daysLeft <= 60));
  readonly overdueExpiries = computed(() => this.expiries().filter((item) => item.daysLeft < 0));
  readonly dueSecrets = computed(() => this.secrets().filter((secret) => daysUntilRotation(secret) <= 0));
  readonly plannedChanges = computed(() => this.changes().filter((change) => change.status === 'geplant'));

  // ---------------------------------------------------------------- Aktionen

  /** Every access to a credential is logged. In the demo the entry stays in this browser. */
  log(action: AuditAction, target: string, customerId: string | null): void {
    const entry: AuditEntry = {
      id: `au-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      at: new Date().toISOString().slice(0, 19),
      user: this.staff().name,
      action,
      target,
      customerId,
    };
    this.state.update((state) => ({ ...state, audit: [entry, ...state.audit].slice(0, 200) }));
  }

  /** Stores a new password for the demo and writes the rotation to the log. */
  rotateSecret(secret: Secret, password: string): void {
    const rotatedAt = new Date().toLocaleDateString('de-DE');
    this.state.update((state) => ({
      ...state,
      rotated: { ...state.rotated, [secret.id]: { password, rotatedAt } },
    }));
    this.log('zugang-rotiert', `${secret.name} (${this.customer(secret.customerId)?.name ?? ''})`, secret.customerId);
  }

  /** Stores a plan drawn in the editor and notes the change in the log. */
  savePlan(customerId: string, siteId: string, nodes: readonly NetworkNode[], links: readonly NetworkLink[]): void {
    const drawing: PlanDrawing = {
      nodes: nodes.map((node) => ({ ...node })),
      links: links.map((link) => ({ ...link })),
      updated: new Date().toLocaleDateString('de-DE'),
      author: this.staff().name,
    };
    this.state.update((state) => ({ ...state, drawings: { ...state.drawings, [planKey(customerId, siteId)]: drawing } }));
    const site = this.site(siteId);
    this.log('netzplan-geaendert', `${site?.name ?? siteId} (${this.customer(customerId)?.name ?? ''})`, customerId);
  }

  /** Throws the drawing away; the plan falls back to the delivered state. */
  resetPlan(customerId: string, siteId: string): void {
    this.state.update((state) => {
      const drawings = { ...state.drawings };
      delete drawings[planKey(customerId, siteId)];
      return { ...state, drawings };
    });
  }

  /** True when this plan was edited in the browser. */
  isPlanEdited(customerId: string, siteId: string): boolean {
    return planKey(customerId, siteId) in this.state().drawings;
  }

  setNote(recordId: string, note: string): void {
    this.state.update((state) => ({ ...state, notes: { ...state.notes, [recordId]: note } }));
  }

  note(recordId: string, fallback: string): string {
    return this.state().notes[recordId] ?? fallback;
  }

  /** Remembers which customer file was opened last, for the start page. */
  touchCustomer(customerId: string): void {
    this.state.update((state) => ({
      ...state,
      recent: [customerId, ...state.recent.filter((id) => id !== customerId)].slice(0, 6),
    }));
  }

  togglePin(customerId: string): void {
    this.state.update((state) => ({
      ...state,
      pinned: state.pinned.includes(customerId)
        ? state.pinned.filter((id) => id !== customerId)
        : [...state.pinned, customerId],
    }));
  }

  updateStaff(staff: StaffAccount): void {
    this.state.update((state) => ({ ...state, staff }));
  }

  /** Back to the delivered demo state. */
  reset(): void {
    removeKey('local', STORAGE_KEY);
    this.state.set(initialState());
  }

  /** "2026-09-17T14:05:00" -> "17.09.2026, 14:05" */
  formatAuditTime(at: string): string {
    return dateTimeDe(new Date(at));
  }
}
