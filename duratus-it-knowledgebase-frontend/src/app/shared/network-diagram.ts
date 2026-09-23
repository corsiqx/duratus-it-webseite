import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LinkKind, NetworkLink, NetworkNode, NetworkNodeType, NetworkPlan } from '../data/models';
import { LINK_KIND, NODE_TYPE } from '../data/status';

const NODE_WIDTH = 176;
const NODE_HEIGHT = 62;
const CANVAS_WIDTH = 1000;
/** Positions snap to this grid, so plans stay tidy without fiddling. */
const GRID = 10;

/** Accent colour per node type, so a plan can be read at a glance. */
const NODE_COLOR: Record<NetworkNodeType, string> = {
  wan: '#2563eb',
  firewall: '#dc2626',
  switch: '#0f172a',
  accesspoint: '#f59e0b',
  server: '#0d9488',
  nas: '#0d9488',
  client: '#64748b',
  cloud: '#7c3aed',
};

interface DrawnLink {
  key: string;
  index: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  label: string;
  kind: LinkKind;
  stroke: string;
  dash: string | null;
}

/** A drag in progress: moving a node, pulling a new connection, or dropping a new node from the palette. */
type Drag =
  | { mode: 'move'; nodeId: string; offsetX: number; offsetY: number }
  | { mode: 'link'; fromId: string; x: number; y: number }
  | { mode: 'new'; type: NetworkNodeType; x: number; y: number };

export interface NodePlacement {
  type: NetworkNodeType;
  x: number;
  y: number;
}

/**
 * Network plan as SVG. The plan is drawn on a fixed 1000 × height canvas and scaled to the available width;
 * below the diagram width it scrolls sideways instead of shrinking the text into unreadability.
 *
 * With `editable` it becomes an editor: nodes are dragged around, new ones are pulled in from the palette, and a
 * connection is drawn by dragging from the handle on the right edge of a node onto another node. Everything works
 * with a mouse as well as with a finger (pointer events), and every change is reported to the parent, which owns
 * the draft and decides when it is saved.
 */
@Component({
  selector: 'app-network-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (editable()) {
      <!-- Palette: ein Baustein wird auf die Fläche gezogen. -->
      <div class="mb-3 rounded-2xl bg-canvas p-3 ring-1 ring-line">
        <p class="px-1 text-xs font-semibold text-muted">Bausteine auf die Fläche ziehen</p>
        <ul class="mt-2 flex flex-wrap gap-2">
          @for (item of palette; track item.type) {
            <li>
              <button
                type="button"
                class="flex min-h-11 touch-none items-center gap-2 rounded-full bg-canvas-alt px-3.5 text-sm font-medium text-ink ring-1 ring-line transition select-none hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                [class.ring-primary]="drag()?.mode === 'new' && $any(drag()).type === item.type"
                (pointerdown)="startNew($event, item.type)"
              >
                <span class="size-2.5 rounded-full" [style.background]="color(item.type)"></span>
                {{ item.label }}
              </button>
            </li>
          }
          <li class="ml-auto flex items-center px-2 text-xs text-muted">
            Verbinden: vom Punkt am rechten Rand eines Bausteins auf einen anderen ziehen.
          </li>
        </ul>
      </div>
    }

    <div class="overflow-x-auto overscroll-x-contain rounded-2xl bg-canvas ring-1" [class]="editable() ? 'ring-primary/40' : 'ring-line'">
      <svg
        #canvas
        [attr.viewBox]="'0 0 1000 ' + height()"
        class="block h-auto w-full min-w-[54rem]"
        [class.touch-none]="editable()"
        [class.cursor-grabbing]="drag()?.mode === 'move'"
        role="img"
        [attr.aria-label]="'Netzwerkplan: ' + plan().summary"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="drag.set(null)"
      >
        @if (editable()) {
          <defs>
            <pattern id="kb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#e2e8f0" />
            </pattern>
          </defs>
          <rect width="1000" [attr.height]="height()" fill="url(#kb-grid)" (pointerdown)="clearSelection()" />
        }

        <!-- Verbindungen -->
        @for (link of links(); track link.key) {
          <g [class.cursor-pointer]="editable()" (pointerdown)="selectLink($event, link.index)">
            <!-- Unsichtbare, dicke Linie darunter: leichter zu treffen. -->
            @if (editable()) {
              <line [attr.x1]="link.x1" [attr.y1]="link.y1" [attr.x2]="link.x2" [attr.y2]="link.y2" stroke="transparent" stroke-width="16" />
            }
            <line
              [attr.x1]="link.x1"
              [attr.y1]="link.y1"
              [attr.x2]="link.x2"
              [attr.y2]="link.y2"
              [attr.stroke]="link.stroke"
              [attr.stroke-dasharray]="link.dash"
              [attr.stroke-width]="selectedLink() === link.index ? 4 : 2"
              stroke-linecap="round"
            />
            @if (link.label) {
              <rect
                [attr.x]="link.midX - link.label.length * 3.4 - 6"
                [attr.y]="link.midY - 10"
                [attr.width]="link.label.length * 6.8 + 12"
                height="20"
                rx="10"
                fill="#ffffff"
                [attr.stroke]="selectedLink() === link.index ? link.stroke : '#e2e8f0'"
              />
              <text [attr.x]="link.midX" [attr.y]="link.midY + 4" text-anchor="middle" font-size="11" fill="#475569">{{ link.label }}</text>
            }
          </g>
        }

        <!-- Gummiband beim Verbinden -->
        @if (rubberBand(); as band) {
          <line
            [attr.x1]="band.x1"
            [attr.y1]="band.y1"
            [attr.x2]="band.x2"
            [attr.y2]="band.y2"
            stroke="#2563eb"
            stroke-width="2"
            stroke-dasharray="6 4"
            stroke-linecap="round"
          />
        }

        <!-- Knoten -->
        @for (node of plan().nodes; track node.id) {
          <g
            [attr.transform]="'translate(' + (node.x - halfWidth) + ',' + (node.y - halfHeight) + ')'"
            [class]="editable() ? 'cursor-grab' : 'cursor-pointer'"
            tabindex="0"
            role="button"
            [attr.aria-label]="node.label + ', ' + node.sublabel"
            (pointerdown)="startMove($event, node)"
            (keydown.enter)="toggleSelect(node.id)"
            (keydown.space)="toggleSelect(node.id)"
            (keydown.arrowleft)="nudge($event, node, -grid, 0)"
            (keydown.arrowright)="nudge($event, node, grid, 0)"
            (keydown.arrowup)="nudge($event, node, 0, -grid)"
            (keydown.arrowdown)="nudge($event, node, 0, grid)"
          >
            <rect
              [attr.width]="nodeWidth"
              [attr.height]="nodeHeight"
              rx="14"
              fill="#ffffff"
              [attr.stroke]="selected() === node.id ? color(node.type) : '#e2e8f0'"
              [attr.stroke-width]="selected() === node.id ? 2.5 : 1.5"
            />
            <rect [attr.height]="nodeHeight - 20" width="4" x="0" y="10" rx="2" [attr.fill]="color(node.type)" />
            <text x="16" y="26" font-size="13" font-weight="600" fill="#020617">{{ clip(node.label, node.vlanId !== null ? 17 : 24) }}</text>
            <text x="16" y="44" font-size="11" fill="#64748b">{{ clip(node.sublabel, node.vlanId !== null ? 20 : 28) }}</text>
            @if (node.vlanId !== null) {
              <text [attr.x]="nodeWidth - 12" y="26" text-anchor="end" font-size="10" font-weight="600" fill="#94a3b8">VLAN {{ node.vlanId }}</text>
            }

            @if (editable()) {
              <!-- Griff zum Verbinden -->
              <circle
                [attr.cx]="nodeWidth"
                [attr.cy]="halfHeight"
                r="9"
                fill="#ffffff"
                stroke="#2563eb"
                stroke-width="2"
                class="cursor-crosshair"
                (pointerdown)="startLink($event, node)"
              />
              <circle [attr.cx]="nodeWidth" [attr.cy]="halfHeight" r="3" fill="#2563eb" class="pointer-events-none" />
            }
          </g>
        }
      </svg>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
      @for (kind of legend(); track kind.label) {
        <span class="inline-flex items-center gap-1.5">
          <svg width="22" height="8" aria-hidden="true">
            <line x1="1" y1="4" x2="21" y2="4" [attr.stroke]="kind.stroke" [attr.stroke-dasharray]="kind.dash" stroke-width="2" stroke-linecap="round" />
          </svg>
          {{ kind.label }}
        </span>
      }
      @if (editable()) {
        <span class="ml-auto">Mit den Pfeiltasten lässt sich ein ausgewählter Baustein fein verschieben.</span>
      } @else {
        <span class="ml-auto hidden sm:inline">Knoten anklicken zeigt die Details.</span>
        <span class="sm:hidden">Zum Ansehen seitlich wischen.</span>
      }
    </div>

    <!-- Vorschau am Zeiger, solange ein Baustein aus der Palette gezogen wird. -->
    @if (ghost(); as position) {
      <div
        class="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-full bg-night px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
        [style.left.px]="position.x"
        [style.top.px]="position.y"
      >
        {{ position.label }}
      </div>
    }
  `,
})
export class NetworkDiagram {
  readonly plan = input.required<NetworkPlan>();
  readonly editable = input(false);
  readonly selected = model<string | null>(null);
  readonly selectedLink = model<number | null>(null);

  /** A node was dragged to a new position (fires continuously while dragging). */
  readonly nodeMoved = output<{ id: string; x: number; y: number }>();
  /** A palette item was dropped on the canvas. */
  readonly nodeAdded = output<NodePlacement>();
  /** A connection was drawn from one node onto another. */
  readonly linkAdded = output<{ from: string; to: string }>();

  protected readonly nodeWidth = NODE_WIDTH;
  protected readonly nodeHeight = NODE_HEIGHT;
  protected readonly halfWidth = NODE_WIDTH / 2;
  protected readonly halfHeight = NODE_HEIGHT / 2;
  protected readonly grid = GRID;

  protected readonly palette: readonly { type: NetworkNodeType; label: string }[] = (
    Object.keys(NODE_TYPE) as NetworkNodeType[]
  ).map((type) => ({ type, label: NODE_TYPE[type].label }));

  protected readonly drag = signal<Drag | null>(null);
  /** Screen position of the palette preview while dragging. */
  protected readonly ghost = signal<{ x: number; y: number; label: string } | null>(null);

  private readonly canvas = viewChild.required<ElementRef<SVGSVGElement>>('canvas');

  /** Canvas height follows the lowest node, with room to drop something below it while editing. */
  protected readonly height = computed(() => {
    const lowest = Math.max(...this.plan().nodes.map((node) => node.y), 200);
    return lowest + (this.editable() ? 130 : 70);
  });

  protected readonly links = computed<readonly DrawnLink[]>(() => {
    const nodes = new Map(this.plan().nodes.map((node) => [node.id, node]));
    return this.plan()
      .links.map((link: NetworkLink, index): DrawnLink | null => {
        const from = nodes.get(link.from);
        const to = nodes.get(link.to);
        if (!from || !to) return null;
        const style = LINK_KIND[link.kind];
        return {
          key: `${link.from}-${link.to}-${index}`,
          index,
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          midX: (from.x + to.x) / 2,
          midY: (from.y + to.y) / 2,
          label: link.label,
          kind: link.kind,
          stroke: style.stroke,
          dash: style.dash,
        };
      })
      .filter((link) => link !== null);
  });

  /** Only the connection types that actually appear in this plan. */
  protected readonly legend = computed(() => {
    const kinds = new Set(this.plan().links.map((link) => link.kind));
    return [...kinds].map((kind) => LINK_KIND[kind]);
  });

  protected readonly rubberBand = computed(() => {
    const current = this.drag();
    if (current?.mode !== 'link') return null;
    const from = this.plan().nodes.find((node) => node.id === current.fromId);
    return from ? { x1: from.x + this.halfWidth, y1: from.y, x2: current.x, y2: current.y } : null;
  });

  // ---------------------------------------------------------------- Ziehen

  protected startMove(event: PointerEvent, node: NetworkNode): void {
    this.selected.set(node.id);
    this.selectedLink.set(null);
    if (!this.editable()) return;
    event.preventDefault();
    const point = this.toCanvas(event);
    this.drag.set({ mode: 'move', nodeId: node.id, offsetX: point.x - node.x, offsetY: point.y - node.y });
    this.capture(event);
  }

  protected startLink(event: PointerEvent, node: NetworkNode): void {
    event.preventDefault();
    event.stopPropagation();
    const point = this.toCanvas(event);
    this.drag.set({ mode: 'link', fromId: node.id, x: point.x, y: point.y });
    this.capture(event);
  }

  /** Starts on the palette button, so the pointer has to be followed on the document until it is released. */
  protected startNew(event: PointerEvent, type: NetworkNodeType): void {
    event.preventDefault();
    this.drag.set({ mode: 'new', type, x: 0, y: 0 });
    this.ghost.set({ x: event.clientX, y: event.clientY, label: NODE_TYPE[type].label });

    const move = (moveEvent: PointerEvent) => this.ghost.set({ x: moveEvent.clientX, y: moveEvent.clientY, label: NODE_TYPE[type].label });
    const up = (upEvent: PointerEvent) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      this.ghost.set(null);
      this.drag.set(null);
      this.dropNew(upEvent, type);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  protected onPointerMove(event: PointerEvent): void {
    const current = this.drag();
    if (!current) return;
    const point = this.toCanvas(event);

    if (current.mode === 'move') {
      this.nodeMoved.emit({
        id: current.nodeId,
        x: this.snapX(point.x - current.offsetX),
        y: this.snapY(point.y - current.offsetY),
      });
    } else if (current.mode === 'link') {
      this.drag.set({ ...current, x: point.x, y: point.y });
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const current = this.drag();
    if (current?.mode === 'link') {
      const target = this.nodeAt(this.toCanvas(event));
      if (target && target.id !== current.fromId) this.linkAdded.emit({ from: current.fromId, to: target.id });
    }
    this.drag.set(null);
  }

  /** Was the palette item released over the canvas? Then a node is created there. */
  private dropNew(event: PointerEvent, type: NetworkNodeType): void {
    const svg = this.canvas().nativeElement;
    const box = svg.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) return;
    const point = this.toCanvas(event);
    this.nodeAdded.emit({ type, x: this.snapX(point.x), y: this.snapY(point.y) });
  }

  // ---------------------------------------------------------------- Auswahl und Tastatur

  protected toggleSelect(nodeId: string): void {
    this.selected.set(this.selected() === nodeId ? null : nodeId);
    this.selectedLink.set(null);
  }

  protected selectLink(event: PointerEvent, index: number): void {
    if (!this.editable()) return;
    event.stopPropagation();
    this.selectedLink.set(this.selectedLink() === index ? null : index);
    this.selected.set(null);
  }

  protected clearSelection(): void {
    this.selected.set(null);
    this.selectedLink.set(null);
  }

  protected nudge(event: Event, node: NetworkNode, dx: number, dy: number): void {
    if (!this.editable() || this.selected() !== node.id) return;
    event.preventDefault();
    this.nodeMoved.emit({ id: node.id, x: this.snapX(node.x + dx), y: this.snapY(node.y + dy) });
  }

  // ---------------------------------------------------------------- Hilfen

  /** Keeps the pointer with the element even when it leaves it. Not every environment allows it, so failures are ignored. */
  private capture(event: PointerEvent): void {
    try {
      (event.target as Element).setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer already released or not capturable: dragging still works via the SVG handlers.
    }
  }

  /** Screen coordinates to canvas coordinates, independent of the current scaling. */
  private toCanvas(event: PointerEvent): { x: number; y: number } {
    const svg = this.canvas().nativeElement;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y };
  }

  private nodeAt(point: { x: number; y: number }): NetworkNode | undefined {
    return this.plan().nodes.find(
      (node) =>
        Math.abs(node.x - point.x) <= this.halfWidth + 10 && Math.abs(node.y - point.y) <= this.halfHeight + 10,
    );
  }

  private snapX(value: number): number {
    const snapped = Math.round(value / GRID) * GRID;
    return Math.min(Math.max(snapped, this.halfWidth + 10), CANVAS_WIDTH - this.halfWidth - 10);
  }

  private snapY(value: number): number {
    const snapped = Math.round(value / GRID) * GRID;
    return Math.min(Math.max(snapped, this.halfHeight + 10), this.height() - this.halfHeight - 10);
  }

  protected color(type: NetworkNodeType): string {
    return NODE_COLOR[type];
  }

  /** SVG has no text overflow, so long labels are shortened here. */
  protected clip(value: string, max: number): string {
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
  }
}

export type { NetworkNode };
