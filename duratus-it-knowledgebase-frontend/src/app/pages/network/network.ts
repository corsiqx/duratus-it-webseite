import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { CustomerFilter } from '../../shared/customer-filter';
import { EmptyState } from '../../shared/empty-state';

@Component({
  selector: 'app-network',
  imports: [RouterLink, NgIcon, CustomerFilter, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Ein Plan je Standort: Aufbau, VLANs, Firewall-Regeln und VPN-Verbindungen.
    </p>

    <div class="mt-5 sm:max-w-xs">
      <app-customer-filter [(value)]="customerId" />
    </div>

    @if (visible().length === 0) {
      <div class="mt-5">
        <app-empty-state icon="phosphorTreeStructure" title="Kein Plan vorhanden" hint="Für diesen Kunden ist noch kein Netzwerkplan hinterlegt." />
      </div>
    } @else {
      <ul class="mt-5 grid gap-4 lg:grid-cols-2">
        @for (plan of visible(); track plan.customerId + plan.siteId) {
          <li>
            <a
              [routerLink]="['/netzwerk', plan.customerId, plan.siteId]"
              class="group flex h-full flex-col rounded-2xl bg-canvas p-5 ring-1 ring-line transition hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div class="flex items-start gap-3">
                <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-alt text-slate-500">
                  <ng-icon name="phosphorTreeStructure" size="20" />
                </span>
                <div class="min-w-0 flex-1">
                  <h2 class="font-bold text-ink group-hover:text-primary-hover">{{ siteName(plan.siteId) }}</h2>
                  <p class="text-sm text-muted">{{ customerName(plan.customerId) }}</p>
                </div>
              </div>
              <p class="mt-3 line-clamp-3 text-sm text-muted">{{ plan.summary }}</p>
              <dl class="mt-4 grid grid-cols-4 gap-2 border-t border-line pt-3 text-center">
                <div>
                  <dt class="text-xs text-muted">Geräte</dt>
                  <dd class="font-semibold text-ink tabular-nums">{{ plan.nodes.length }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">VLANs</dt>
                  <dd class="font-semibold text-ink tabular-nums">{{ plan.vlans.length }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">Regeln</dt>
                  <dd class="font-semibold text-ink tabular-nums">{{ plan.rules.length }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted">VPN</dt>
                  <dd class="font-semibold text-ink tabular-nums">{{ plan.vpn.length }}</dd>
                </div>
              </dl>
              <p class="mt-3 text-xs text-slate-500">Aktualisiert am {{ plan.updated }} von {{ plan.author }}</p>
            </a>
          </li>
        }
      </ul>
    }
  `,
})
export class Network {
  private readonly store = inject(KbStore);
  protected readonly customerId = signal('alle');

  protected readonly visible = computed(() =>
    this.customerId() === 'alle' ? this.store.networks() : this.store.networksOf(this.customerId()),
  );

  protected siteName(siteId: string): string {
    return this.store.site(siteId)?.name ?? '';
  }

  protected customerName(customerId: string): string {
    return this.store.customer(customerId)?.name ?? '';
  }
}
