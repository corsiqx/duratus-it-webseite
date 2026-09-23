import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { LinkKind, NetworkLink, NetworkNode, NetworkNodeType, NetworkPlan } from '../../data/models';
import { LINK_KIND, NODE_TYPE } from '../../data/status';
import { CopyButton } from '../../shared/copy-button';
import { Dialog } from '../../shared/dialog';
import { EmptyState } from '../../shared/empty-state';
import { NetworkDiagram, NodePlacement } from '../../shared/network-diagram';
import { ToastService } from '../../shared/toast.service';

interface Draft {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

@Component({
  selector: 'app-network-detail',
  imports: [RouterLink, NgIcon, NetworkDiagram, CopyButton, EmptyState, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './network-detail.html',
})
export class NetworkDetail {
  private readonly store = inject(KbStore);
  private readonly toasts = inject(ToastService);

  protected readonly nodeType = NODE_TYPE;
  protected readonly linkKind = LINK_KIND;
  protected readonly nodeTypes = Object.keys(NODE_TYPE) as NetworkNodeType[];
  protected readonly linkKinds = Object.keys(LINK_KIND) as LinkKind[];

  readonly customerId = input.required<string>();
  readonly siteId = input.required<string>();

  protected readonly selectedNode = signal<string | null>(null);
  protected readonly selectedLink = signal<number | null>(null);
  protected readonly editing = signal(false);
  protected readonly confirmReset = signal(false);
  private readonly draft = signal<Draft | null>(null);
  private nextId = 1;

  private readonly stored = computed(() =>
    this.store.networks().find((plan) => plan.customerId === this.customerId() && plan.siteId === this.siteId()),
  );

  /** While editing, the draft is shown; otherwise the stored plan. */
  protected readonly plan = computed<NetworkPlan | undefined>(() => {
    const stored = this.stored();
    const draft = this.draft();
    return stored && draft ? { ...stored, nodes: draft.nodes, links: draft.links } : stored;
  });

  protected readonly edited = computed(() => this.store.isPlanEdited(this.customerId(), this.siteId()));

  protected readonly dirty = computed(() => {
    const draft = this.draft();
    const stored = this.stored();
    if (!draft || !stored) return false;
    return JSON.stringify({ nodes: stored.nodes, links: stored.links }) !== JSON.stringify(draft);
  });

  protected readonly node = computed(() => this.plan()?.nodes.find((entry) => entry.id === this.selectedNode()));
  protected readonly link = computed(() => {
    const index = this.selectedLink();
    return index === null ? undefined : this.plan()?.links[index];
  });

  protected readonly asset = computed(() => {
    const assetId = this.node()?.assetId;
    return assetId ? this.store.asset(assetId) : undefined;
  });

  /** Devices of this customer, offered when a node is linked to the inventory. */
  protected readonly assetOptions = computed(() => this.store.assetsOf(this.customerId()));

  protected siteName(): string {
    return this.store.site(this.siteId())?.name ?? '';
  }

  protected customerName(): string {
    return this.store.customer(this.customerId())?.name ?? '';
  }

  // ---------------------------------------------------------------- Bearbeiten

  protected startEditing(): void {
    const stored = this.stored();
    if (!stored) return;
    this.draft.set({ nodes: stored.nodes.map((node) => ({ ...node })), links: stored.links.map((link) => ({ ...link })) });
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    this.draft.set(null);
    this.editing.set(false);
    this.selectedLink.set(null);
  }

  protected save(): void {
    const draft = this.draft();
    if (!draft) return;
    this.store.savePlan(this.customerId(), this.siteId(), draft.nodes, draft.links);
    this.draft.set(null);
    this.editing.set(false);
    this.toasts.show('Netzwerkplan gespeichert.', 'phosphorCheckCircle');
  }

  protected resetToDelivered(): void {
    this.store.resetPlan(this.customerId(), this.siteId());
    this.draft.set(null);
    this.editing.set(false);
    this.confirmReset.set(false);
    this.toasts.show('Plan auf den ursprünglichen Stand zurückgesetzt.', 'phosphorArrowCounterClockwise');
  }

  // ---------------------------------------------------------------- Änderungen am Entwurf

  protected moveNode(change: { id: string; x: number; y: number }): void {
    this.updateDraft((draft) => ({
      ...draft,
      nodes: draft.nodes.map((node) => (node.id === change.id ? { ...node, x: change.x, y: change.y } : node)),
    }));
  }

  protected addNode(placement: NodePlacement): void {
    const id = `n-${Date.now()}-${this.nextId++}`;
    const node: NetworkNode = {
      id,
      label: 'Neuer Baustein',
      sublabel: NODE_TYPE[placement.type].label,
      type: placement.type,
      x: placement.x,
      y: placement.y,
      assetId: null,
      vlanId: null,
    };
    this.updateDraft((draft) => ({ ...draft, nodes: [...draft.nodes, node] }));
    this.selectedNode.set(id);
    this.selectedLink.set(null);
  }

  protected addLink(change: { from: string; to: string }): void {
    this.updateDraft((draft) => {
      const exists = draft.links.some(
        (link) =>
          (link.from === change.from && link.to === change.to) || (link.from === change.to && link.to === change.from),
      );
      if (exists) return draft;
      return { ...draft, links: [...draft.links, { from: change.from, to: change.to, kind: 'kupfer', label: '' }] };
    });
    this.selectedLink.set((this.plan()?.links.length ?? 1) - 1);
    this.selectedNode.set(null);
  }

  protected updateNode(changes: Partial<NetworkNode>): void {
    const id = this.selectedNode();
    if (!id) return;
    this.updateDraft((draft) => ({
      ...draft,
      nodes: draft.nodes.map((node) => (node.id === id ? { ...node, ...changes } : node)),
    }));
  }

  /** Empty selection means "no device linked"; the VLAN field accepts a number or nothing. */
  protected setAsset(value: string): void {
    this.updateNode({ assetId: value || null });
  }

  protected setVlan(value: string): void {
    const parsed = Number(value);
    this.updateNode({ vlanId: value.trim() === '' || Number.isNaN(parsed) ? null : parsed });
  }

  protected updateLink(changes: Partial<NetworkLink>): void {
    const index = this.selectedLink();
    if (index === null) return;
    this.updateDraft((draft) => ({
      ...draft,
      links: draft.links.map((link, position) => (position === index ? { ...link, ...changes } : link)),
    }));
  }

  protected deleteNode(): void {
    const id = this.selectedNode();
    if (!id) return;
    this.updateDraft((draft) => ({
      nodes: draft.nodes.filter((node) => node.id !== id),
      links: draft.links.filter((link) => link.from !== id && link.to !== id),
    }));
    this.selectedNode.set(null);
  }

  protected deleteLink(): void {
    const index = this.selectedLink();
    if (index === null) return;
    this.updateDraft((draft) => ({ ...draft, links: draft.links.filter((_, position) => position !== index) }));
    this.selectedLink.set(null);
  }

  protected nodeLabel(nodeId: string): string {
    return this.plan()?.nodes.find((node) => node.id === nodeId)?.label ?? nodeId;
  }

  private updateDraft(change: (draft: Draft) => Draft): void {
    const draft = this.draft();
    if (draft) this.draft.set(change(draft));
  }
}
