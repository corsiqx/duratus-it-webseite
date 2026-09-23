import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore, daysUntil } from '../../data/kb-store';
import { Secret } from '../../data/models';
import { suggestPassword } from '../../data/secret-rules';
import {
  ASSET_STATUS,
  ASSET_TYPE,
  CHANGE_RISK,
  CHANGE_STATUS,
  CHANGE_TYPE,
  DOC_CATEGORY,
  LICENSE_KIND,
  SERVICE_LEVEL,
  dueLabel,
} from '../../data/status';
import { CopyButton } from '../../shared/copy-button';
import { EmptyState } from '../../shared/empty-state';
import { euro } from '../../shared/format';
import { NetworkDiagram } from '../../shared/network-diagram';
import { RotateDialog } from '../../shared/rotate-dialog';
import { SecretCard } from '../../shared/secret-card';
import { StatusBadge } from '../../shared/status-badge';

const TABS = [
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'kontakte', label: 'Ansprechpartner' },
  { id: 'zugaenge', label: 'Zugänge' },
  { id: 'inventar', label: 'Inventar' },
  { id: 'netzwerk', label: 'Netzwerk' },
  { id: 'dokumentation', label: 'Dokumentation' },
  { id: 'taetigkeiten', label: 'Tätigkeiten' },
  { id: 'notfall', label: 'Notfall' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** The customer file: everything about one customer, grouped into tabs that are linkable (/kunden/:id/:tab). */
@Component({
  selector: 'app-customer-detail',
  imports: [RouterLink, NgIcon, StatusBadge, SecretCard, RotateDialog, NetworkDiagram, CopyButton, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-detail.html',
  host: { class: 'block' },
})
export class CustomerDetail {
  private readonly router = inject(Router);
  protected readonly store = inject(KbStore);

  readonly customerId = input.required<string>();
  readonly tab = input<string>();

  protected readonly tabs = TABS;
  protected readonly level = SERVICE_LEVEL;
  protected readonly assetType = ASSET_TYPE;
  protected readonly assetStatus = ASSET_STATUS;
  protected readonly docCategory = DOC_CATEGORY;
  protected readonly changeType = CHANGE_TYPE;
  protected readonly changeRisk = CHANGE_RISK;
  protected readonly changeStatus = CHANGE_STATUS;
  protected readonly licenseKind = LICENSE_KIND;
  protected readonly euro = euro;

  protected readonly rotating = signal<Secret | null>(null);
  protected readonly suggestion = signal('');
  protected readonly selectedNode = signal<string | null>(null);

  protected readonly customer = computed(() => this.store.customer(this.customerId()));
  protected readonly activeTab = computed<TabId>(() => {
    const value = this.tab();
    return TABS.some((tab) => tab.id === value) ? (value as TabId) : 'uebersicht';
  });

  protected readonly sites = computed(() => this.store.sitesOf(this.customerId()));
  protected readonly contacts = computed(() => this.store.contactsOf(this.customerId()));
  protected readonly secrets = computed(() => this.store.secretsOf(this.customerId()));
  protected readonly assets = computed(() => this.store.assetsOf(this.customerId()));
  protected readonly plans = computed(() => this.store.networksOf(this.customerId()));
  protected readonly docs = computed(() => this.store.docsOf(this.customerId()));
  protected readonly changes = computed(() => this.store.changesOf(this.customerId()));
  protected readonly licenses = computed(() => this.store.licensesOf(this.customerId()));
  protected readonly emergency = computed(() => this.store.emergencyOf(this.customerId()));

  /** First plan of the customer, shown right inside the file; further plans are linked. */
  protected readonly firstPlan = computed(() => this.plans()[0]);
  protected readonly selectedNodeData = computed(() => {
    const plan = this.firstPlan();
    return plan?.nodes.find((node) => node.id === this.selectedNode());
  });

  protected readonly counts = computed(() => ({
    kontakte: this.contacts().length,
    zugaenge: this.secrets().length,
    inventar: this.assets().length,
    netzwerk: this.plans().length,
    dokumentation: this.docs().length,
    taetigkeiten: this.changes().length,
    notfall: this.emergency() ? 1 : 0,
    uebersicht: 0,
  }));

  /** Deadlines of this customer that are due within 60 days. */
  protected readonly openItems = computed(() =>
    this.store.openExpiries().filter((item) => item.customerId === this.customerId()),
  );

  constructor() {
    effect(() => {
      const id = this.customerId();
      if (this.store.customer(id)) this.store.touchCustomer(id);
    });
  }

  protected tabLink(tab: TabId): readonly string[] {
    return tab === 'uebersicht' ? ['/kunden', this.customerId()] : ['/kunden', this.customerId(), tab];
  }

  protected pinned(): boolean {
    return this.store.pinned().includes(this.customerId());
  }

  protected openRotate(secret: Secret): void {
    this.suggestion.set(suggestPassword());
    this.rotating.set(secret);
  }

  protected saveRotation(password: string): void {
    const secret = this.rotating();
    if (secret) this.store.rotateSecret(secret, password);
    this.rotating.set(null);
  }

  protected warrantyStatus(until: string) {
    return dueLabel(daysUntil(until), 90);
  }

  protected renewStatus(on: string) {
    return dueLabel(daysUntil(on), 60);
  }

  /** "0251 998840" -> "tel:0251998840" */
  protected tel(phone: string): string {
    return `tel:${phone.split(' ').join('')}`;
  }

  protected siteName(siteId: string): string {
    return this.store.site(siteId)?.name ?? '';
  }

  protected assetName(assetId: string): string {
    return this.store.asset(assetId)?.name ?? assetId;
  }

  protected back(): void {
    void this.router.navigate(['/kunden']);
  }
}
