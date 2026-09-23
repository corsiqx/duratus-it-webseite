import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore, daysUntil } from '../../data/kb-store';
import { DocCategory } from '../../data/models';
import { DOC_CATEGORY } from '../../data/status';
import { EmptyState } from '../../shared/empty-state';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';

type Filter = 'alle' | DocCategory;

@Component({
  selector: 'app-docs',
  imports: [RouterLink, NgIcon, FilterTabs, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Runbooks, Anleitungen, Richtlinien und Checklisten. Maßstab ist der Vertretungstest: Wer den Kunden nicht kennt,
      muss die Arbeit hiermit allein erledigen können.
    </p>

    <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <app-filter-tabs label="Dokumente filtern" [options]="filterOptions()" [(value)]="filter" />
      <label class="relative block lg:w-72">
        <span class="sr-only">Dokumente durchsuchen</span>
        <ng-icon name="phosphorMagnifyingGlass" size="18" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Titel, Inhalt oder Schlagwort"
          class="min-h-11 w-full rounded-full border border-slate-300 bg-canvas py-2 pr-4 pl-10 text-base text-ink transition outline-none placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:text-sm"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
      </label>
    </div>

    @if (visible().length === 0) {
      <div class="mt-5">
        <app-empty-state icon="phosphorBookOpen" title="Kein Dokument gefunden" hint="Anderen Filter wählen oder anders suchen." />
      </div>
    } @else {
      <ul class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        @for (doc of visible(); track doc.id) {
          <li>
            <a
              [routerLink]="['/dokumentation', doc.id]"
              class="group flex h-full flex-col rounded-2xl bg-canvas p-5 ring-1 ring-line transition hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div class="flex items-start gap-3">
                <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas-alt text-slate-500">
                  <ng-icon [name]="category[doc.category].icon" size="20" />
                </span>
                <div class="min-w-0 flex-1">
                  <h2 class="font-bold text-ink group-hover:text-primary-hover">{{ doc.title }}</h2>
                  <p class="mt-0.5 text-xs text-muted">
                    {{ category[doc.category].label }} ·
                    <span [class.font-semibold]="!doc.customerId">{{ scopeName(doc.customerId) }}</span>
                  </p>
                </div>
              </div>

              <p class="mt-3 flex-1 text-sm text-muted">{{ doc.summary }}</p>

              @if (doc.tags.length > 0) {
                <ul class="mt-3 flex flex-wrap gap-1.5">
                  @for (tag of doc.tags; track tag) {
                    <li class="rounded-full bg-canvas-alt px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-line">{{ tag }}</li>
                  }
                </ul>
              }

              <div class="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs">
                <span class="text-slate-500">{{ doc.updated }}, {{ doc.author }}</span>
                @if (reviewOverdue(doc.reviewDue)) {
                  <span class="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">Prüfung fällig</span>
                }
              </div>
            </a>
          </li>
        }
      </ul>
    }
  `,
})
export class Docs {
  private readonly store = inject(KbStore);
  protected readonly category = DOC_CATEGORY;
  protected readonly filter = signal<Filter>('alle');
  protected readonly query = signal('');

  protected readonly filterOptions = computed<readonly FilterOption<Filter>[]>(() => {
    const docs = this.store.docs();
    const count = (category: DocCategory) => docs.filter((doc) => doc.category === category).length;
    return [
      { value: 'alle', label: 'Alle', count: docs.length },
      { value: 'runbook', label: 'Runbooks', count: count('runbook') },
      { value: 'howto', label: 'Anleitungen', count: count('howto') },
      { value: 'richtlinie', label: 'Richtlinien', count: count('richtlinie') },
      { value: 'checkliste', label: 'Checklisten', count: count('checkliste') },
      { value: 'architektur', label: 'Architektur', count: count('architektur') },
    ];
  });

  protected readonly visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    return this.store
      .docs()
      .filter((doc) => this.filter() === 'alle' || doc.category === this.filter())
      .filter(
        (doc) =>
          !needle ||
          [doc.title, doc.summary, ...doc.tags, ...doc.sections.map((section) => `${section.heading} ${section.body}`)]
            .join(' ')
            .toLowerCase()
            .includes(needle),
      )
      .sort((a, b) => Number(Boolean(a.customerId)) - Number(Boolean(b.customerId)) || a.title.localeCompare(b.title, 'de'));
  });

  protected scopeName(customerId: string | null): string {
    return customerId ? (this.store.customer(customerId)?.name ?? '') : 'Gilt für alle Kunden';
  }

  protected reviewOverdue(reviewDue: string): boolean {
    return daysUntil(reviewDue) <= 0;
  }
}
