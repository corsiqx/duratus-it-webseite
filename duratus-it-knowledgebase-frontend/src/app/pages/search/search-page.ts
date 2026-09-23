import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HIT_TYPE, HitType, SearchIndex } from '../../data/search';
import { EmptyState } from '../../shared/empty-state';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';

type Filter = 'alle' | HitType;

@Component({
  selector: 'app-search-page',
  imports: [RouterLink, NgIcon, FilterTabs, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Sucht in Kunden, Ansprechpartnern, Zugängen, Geräten, Netzwerkplänen, Dokumenten, Tätigkeiten und Lizenzen.
      Passwörter selbst sind bewusst nicht durchsuchbar.
    </p>

    <label class="relative mt-5 block lg:w-[32rem]">
      <span class="sr-only">Wissensdatenbank durchsuchen</span>
      <ng-icon name="phosphorMagnifyingGlass" size="20" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        autofocus
        placeholder="Kunde, Gerät, IP-Adresse, Dokument …"
        class="min-h-12 w-full rounded-full border border-slate-300 bg-canvas py-2 pr-4 pl-11 text-base text-ink transition outline-none placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15"
        [value]="query()"
        (input)="onInput($any($event.target).value)"
      />
    </label>

    @if (query().trim().length === 0) {
      <div class="mt-6">
        <p class="text-sm font-semibold text-ink">Beispiele</p>
        <ul class="mt-2 flex flex-wrap gap-2">
          @for (example of examples; track example) {
            <li>
              <button
                type="button"
                class="min-h-11 rounded-full bg-canvas px-4 text-sm font-medium text-ink ring-1 ring-line transition hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                (click)="onInput(example)"
              >
                {{ example }}
              </button>
            </li>
          }
        </ul>
      </div>
    } @else if (hits().length === 0) {
      <div class="mt-6">
        <app-empty-state
          title="Nichts gefunden"
          hint="Weniger Wörter oder eine andere Schreibweise probieren. Es werden nur Treffer gezeigt, die alle Wörter enthalten."
        />
      </div>
    } @else {
      <div class="mt-5">
        <app-filter-tabs label="Treffer filtern" [options]="filterOptions()" [(value)]="filter" />
      </div>

      <ul class="mt-4 flex flex-col divide-y divide-line overflow-hidden rounded-2xl bg-canvas ring-1 ring-line" aria-live="polite">
        @for (hit of visible(); track hit.type + hit.id) {
          <li>
            <a
              [routerLink]="hit.link"
              class="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-canvas-alt/70 focus-visible:bg-canvas-alt focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-5"
            >
              <span class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-canvas-alt text-slate-500">
                <ng-icon [name]="hit.icon" size="17" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-semibold text-ink group-hover:text-primary-hover">{{ hit.title }}</span>
                <span class="mt-0.5 block text-sm text-muted">{{ hit.subtitle }}</span>
                <span class="mt-1 block text-xs text-slate-500">
                  {{ typeLabel[hit.type].label }}@if (hit.customerName) { · {{ hit.customerName }} }
                </span>
              </span>
              <ng-icon name="phosphorCaretRight" size="16" class="mt-2 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </a>
          </li>
        }
      </ul>
    }
  `,
})
export class SearchPage {
  private readonly index = inject(SearchIndex);
  private readonly router = inject(Router);

  protected readonly typeLabel = HIT_TYPE;
  protected readonly examples = ['10.20.10.1', 'Firewall', 'Ransomware', 'NIS2', 'Scanner', 'Backup testen'];

  /** Query from the URL (?q=…), so a search can be shared as a link. */
  readonly q = input<string>();
  protected readonly typed = signal<string | null>(null);
  protected readonly query = computed(() => this.typed() ?? this.q() ?? '');
  protected readonly filter = signal<Filter>('alle');

  protected readonly hits = computed(() => this.index.search(this.query(), 80));

  protected readonly filterOptions = computed<readonly FilterOption<Filter>[]>(() => {
    const hits = this.hits();
    const types = [...new Set(hits.map((hit) => hit.type))];
    return [
      { value: 'alle' as Filter, label: 'Alle', count: hits.length },
      ...types.map((type) => ({
        value: type as Filter,
        label: HIT_TYPE[type].label,
        count: hits.filter((hit) => hit.type === type).length,
      })),
    ];
  });

  protected readonly visible = computed(() =>
    this.filter() === 'alle' ? this.hits() : this.hits().filter((hit) => hit.type === this.filter()),
  );

  protected onInput(value: string): void {
    this.typed.set(value);
    this.filter.set('alle');
    // Keep the URL in sync so the result page stays linkable and reload-safe.
    void this.router.navigate(['/suche'], { queryParams: { q: value || null }, replaceUrl: true });
  }
}
