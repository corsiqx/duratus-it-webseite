import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CATEGORIES } from '../../content/catalog';
import { COMPANY } from '../../content/company';
import { EMPTY_FILTER, SORT_OPTIONS, SortKey, countByCategory, filterProducts, sortProducts } from '../../data/catalog-query';
import { EmptyState } from '../../shared/empty-state';
import { Crumb, PageHero } from '../../shared/page-hero';
import { ProductCard } from '../../shared/product-card';

/** Suggestions shown when nothing was searched yet or nothing matched. */
const IDEAS = ['Notebook', 'Monitor 27', 'Backup', 'Firewall', 'NIS2', 'Microsoft 365', 'PoE', 'Telefon'];

@Component({
  selector: 'app-search-page',
  imports: [RouterLink, NgIcon, PageHero, EmptyState, ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-page-hero [crumbs]="crumbs" title="Suche" [lead]="lead()">
      <form class="flex w-full items-center gap-2 rounded-full bg-white/10 px-4 ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-primary-on-night sm:w-96" (submit)="submit($event)">
        <ng-icon name="phosphorMagnifyingGlass" size="18" class="shrink-0 text-slate-400" />
        <label for="s-query" class="sr-only">Suchbegriff</label>
        <input
          id="s-query"
          type="search"
          autocomplete="off"
          class="min-h-12 w-full min-w-0 border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
          placeholder="Artikel, Hersteller, Artikelnummer"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
        />
      </form>
    </app-page-hero>

    <div class="bg-canvas-alt py-8 sm:py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        @if (query()) {
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-muted">
              <span class="font-semibold text-ink tabular-nums">{{ results().length }}</span>
              {{ results().length === 1 ? 'Treffer' : 'Treffer' }} für „{{ query() }}“
            </p>
            <div
            class="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-canvas pr-9 pl-4 text-sm ring-1 ring-line focus-within:ring-2 focus-within:ring-primary"
          >
            <label for="suche-sortierung" class="shrink-0 text-muted">Sortierung</label>
            <select
              id="suche-sortierung"
              class="min-h-11 w-full cursor-pointer appearance-none bg-transparent pr-1 text-sm font-semibold text-ink outline-none"
              [value]="sort()"
              (change)="sort.set($any($event.target).value)"
            >
              @for (option of sortOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
            <ng-icon name="phosphorCaretDown" size="14" class="pointer-events-none absolute right-3.5 text-muted" />
          </div>
          </div>

          <!-- Hits per category, as a shortcut into the filtered catalogue. -->
          @if (results().length) {
            <ul class="mt-4 flex flex-wrap gap-2">
              @for (group of groups(); track group.slug) {
                <li>
                  <a
                    [routerLink]="['/katalog', group.slug]"
                    [queryParams]="{ q: query() }"
                    class="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-canvas px-3 text-sm font-medium text-ink ring-1 ring-line transition-colors hover:bg-canvas"
                  >
                    {{ group.name }}
                    <span class="text-xs text-muted tabular-nums">{{ group.count }}</span>
                  </a>
                </li>
              }
            </ul>

            <ul class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              @for (product of results(); track product.id) {
                <li><app-product-card [product]="product" /></li>
              }
            </ul>
          } @else {
            <app-empty-state
              class="mt-6"
              icon="phosphorMagnifyingGlass"
              title="Keine Treffer"
              [hint]="'Für „' + query() + '“ haben wir nichts im Katalog. Der Katalog zeigt einen Auszug, fragen Sie uns gern direkt.'"
            >
              <div class="mt-5 flex flex-col gap-2 sm:flex-row">
                <a
                  [href]="'mailto:' + company.shopEmail + '?subject=' + encodeURIComponent('Artikelanfrage: ' + query())"
                  class="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  <ng-icon name="phosphorEnvelopeSimple" size="16" />
                  Artikel anfragen
                </a>
                <a
                  routerLink="/katalog"
                  class="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-canvas px-5 text-sm font-semibold text-ink ring-1 ring-line transition hover:bg-canvas-alt"
                >
                  Katalog durchsehen
                </a>
              </div>
            </app-empty-state>
          }
        } @else {
          <p class="text-sm text-muted">Geben Sie einen Begriff ein, oder starten Sie mit einem dieser Vorschläge.</p>
        }

        <!-- Ideas: always visible, they also help after an empty result. -->
        <section class="mt-8" aria-labelledby="ideas-heading">
          <h2 id="ideas-heading" class="text-sm font-semibold text-ink">Häufig gesucht</h2>
          <ul class="mt-3 flex flex-wrap gap-2">
            @for (idea of ideas; track idea) {
              <li>
                <a
                  routerLink="/suche"
                  [queryParams]="{ q: idea }"
                  class="inline-flex min-h-10 items-center rounded-full bg-canvas px-3.5 text-sm font-medium text-muted ring-1 ring-line transition-colors hover:text-ink"
                >
                  {{ idea }}
                </a>
              </li>
            }
          </ul>
        </section>
      </div>
    </div>
  `,
})
export class SearchPage {
  /** ?q=… bound by withComponentInputBinding. */
  readonly q = input<string>();

  private readonly router = inject(Router);

  protected readonly crumbs: readonly Crumb[] = [{ label: 'Suche' }];
  protected readonly company = COMPANY;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly ideas = IDEAS;
  protected readonly encodeURIComponent = encodeURIComponent;

  protected readonly sort = signal<SortKey>('empfohlen');
  protected readonly draft = signal('');

  protected readonly query = computed(() => (this.q() ?? '').trim());

  protected readonly results = computed(() =>
    this.query().length < 2 ? [] : sortProducts(filterProducts({ ...EMPTY_FILTER, search: this.query() }), this.sort()),
  );

  protected readonly groups = computed(() => {
    const counts = countByCategory(this.results());
    return CATEGORIES.filter((category) => counts[category.id]).map((category) => ({
      slug: category.slug,
      name: category.name,
      count: counts[category.id],
    }));
  });

  protected readonly lead = computed(() =>
    this.query()
      ? `${this.results().length} Treffer im Katalog. Gesucht wird in Bezeichnung, Hersteller, Artikelnummer, Beschreibung und technischen Daten.`
      : 'Gesucht wird in Bezeichnung, Hersteller, Artikelnummer, Beschreibung und technischen Daten.',
  );

  constructor() {
    this.draft.set(this.q() ?? '');
  }

  protected submit(event: Event): void {
    event.preventDefault();
    void this.router.navigate(['/suche'], { queryParams: { q: this.draft().trim() || null } });
  }
}
