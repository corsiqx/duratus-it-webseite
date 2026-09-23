import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore, daysUntil } from '../../data/kb-store';
import { DOC_CATEGORY, dueLabel } from '../../data/status';
import { EmptyState } from '../../shared/empty-state';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-doc-detail',
  imports: [RouterLink, NgIcon, StatusBadge, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (doc(); as page) {
      <a routerLink="/dokumentation" class="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink">
        <ng-icon name="phosphorArrowLeft" size="16" />
        Alle Dokumente
      </a>

      <div class="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article class="min-w-0">
          <header>
            <p class="flex items-center gap-2 text-sm font-semibold text-primary">
              <ng-icon [name]="category[page.category].icon" size="18" />
              {{ category[page.category].label }}
            </p>
            <h2 class="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{{ page.title }}</h2>
            <p class="mt-2 max-w-2xl text-base text-muted">{{ page.summary }}</p>
          </header>

          <div class="mt-8 flex flex-col gap-8">
            @for (section of page.sections; track section.heading) {
              <section>
                <h3 class="text-lg font-bold tracking-tight text-ink">{{ section.heading }}</h3>
                @if (section.body) {
                  <p class="mt-2 leading-relaxed text-ink">{{ section.body }}</p>
                }
                @if (section.steps) {
                  <ol class="mt-4 flex flex-col gap-3">
                    @for (step of section.steps; track step; let index = $index) {
                      <li class="flex items-start gap-3">
                        <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-bold text-muted ring-1 ring-line tabular-nums">
                          {{ index + 1 }}
                        </span>
                        <span class="pt-0.5 leading-relaxed text-ink">{{ step }}</span>
                      </li>
                    }
                  </ol>
                }
                @if (section.code) {
                  <pre class="mt-4 overflow-x-auto rounded-2xl bg-night p-4 font-mono text-xs leading-relaxed text-slate-200"><code>{{ section.code }}</code></pre>
                }
                @if (section.warning) {
                  <p class="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-600/20">
                    <ng-icon name="phosphorWarningCircle" size="18" class="mt-0.5 shrink-0" />
                    {{ section.warning }}
                  </p>
                }
              </section>
            }
          </div>
        </article>

        <!-- Angaben zum Dokument -->
        <aside class="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div class="rounded-2xl bg-canvas p-5 ring-1 ring-line">
            <h3 class="font-bold text-ink">Zum Dokument</h3>
            <dl class="mt-3 flex flex-col gap-3 text-sm">
              <div>
                <dt class="text-xs text-muted">Gilt für</dt>
                <dd class="mt-0.5">
                  @if (page.customerId) {
                    <a [routerLink]="['/kunden', page.customerId]" class="font-medium text-primary hover:underline">{{ customerName() }}</a>
                  } @else {
                    <span class="font-medium text-ink">Alle Kunden</span>
                  }
                </dd>
              </div>
              <div>
                <dt class="text-xs text-muted">Zuletzt aktualisiert</dt>
                <dd class="mt-0.5 font-medium text-ink">{{ page.updated }}, {{ page.author }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">Nächste Prüfung</dt>
                <dd class="mt-0.5 flex flex-wrap items-center gap-2">
                  <span class="font-medium text-ink tabular-nums">{{ page.reviewDue }}</span>
                  <app-status-badge [status]="reviewStatus()" />
                </dd>
              </div>
            </dl>
          </div>

          @if (page.tags.length > 0) {
            <div class="rounded-2xl bg-canvas p-5 ring-1 ring-line">
              <h3 class="font-bold text-ink">Schlagwörter</h3>
              <ul class="mt-3 flex flex-wrap gap-1.5">
                @for (tag of page.tags; track tag) {
                  <li class="rounded-full bg-canvas-alt px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-line">{{ tag }}</li>
                }
              </ul>
            </div>
          }

          @if (relatedAssets().length > 0 || relatedSecrets().length > 0) {
            <div class="rounded-2xl bg-canvas p-5 ring-1 ring-line">
              <h3 class="font-bold text-ink">Gehört dazu</h3>
              <ul class="mt-3 flex flex-col gap-2 text-sm">
                @for (asset of relatedAssets(); track asset.id) {
                  <li class="flex items-start gap-2">
                    <ng-icon name="phosphorHardDrives" size="16" class="mt-0.5 shrink-0 text-slate-400" />
                    <span class="text-ink">{{ asset.name }} <span class="text-muted">({{ asset.vendor }} {{ asset.model }})</span></span>
                  </li>
                }
                @for (secret of relatedSecrets(); track secret.id) {
                  <li class="flex items-start gap-2">
                    <ng-icon name="phosphorKey" size="16" class="mt-0.5 shrink-0 text-slate-400" />
                    <a routerLink="/zugaenge" class="text-primary hover:underline">{{ secret.name }}</a>
                  </li>
                }
              </ul>
            </div>
          }
        </aside>
      </div>
    } @else {
      <app-empty-state icon="phosphorBookOpen" title="Dokument nicht gefunden" hint="Der Link zeigt auf ein Dokument, das es nicht mehr gibt.">
        <a routerLink="/dokumentation" class="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover">
          Alle Dokumente
        </a>
      </app-empty-state>
    }
  `,
})
export class DocDetail {
  private readonly store = inject(KbStore);
  protected readonly category = DOC_CATEGORY;

  readonly docId = input.required<string>();

  protected readonly doc = computed(() => this.store.docs().find((doc) => doc.id === this.docId()));
  protected readonly reviewStatus = computed(() => dueLabel(daysUntil(this.doc()?.reviewDue ?? '01.01.2030'), 30));

  protected readonly relatedAssets = computed(() =>
    (this.doc()?.relatedAssets ?? []).map((id) => this.store.asset(id)).filter((asset) => asset !== undefined),
  );

  protected readonly relatedSecrets = computed(() => {
    const ids = this.doc()?.relatedSecrets ?? [];
    return this.store.secrets().filter((secret) => ids.includes(secret.id));
  });

  protected customerName(): string {
    const customerId = this.doc()?.customerId;
    return customerId ? (this.store.customer(customerId)?.name ?? '') : '';
  }
}
