import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HIT_TYPE, SearchIndex } from '../data/search';

/**
 * One search field for the whole knowledge base. Ctrl+K (or Cmd+K) focuses it from anywhere, arrow keys walk the
 * results, Enter opens the selected one. Enter without a selection opens the full result page.
 */
@Component({
  selector: 'app-global-search',
  imports: [NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block',
    '(document:keydown)': 'onShortcut($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <label class="relative block">
      <span class="sr-only">Wissensdatenbank durchsuchen</span>
      <ng-icon name="phosphorMagnifyingGlass" size="18" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
      <input
        #field
        type="search"
        autocomplete="off"
        placeholder="Kunde, Gerät, IP, Dokument …"
        class="min-h-11 w-full rounded-full border border-slate-300 bg-canvas py-2 pr-16 pl-10 text-base text-ink transition outline-none placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:text-sm"
        role="combobox"
        aria-expanded="true"
        aria-controls="global-search-results"
        [attr.aria-activedescendant]="active() >= 0 ? 'global-hit-' + active() : null"
        [value]="query()"
        (input)="onInput($any($event.target).value)"
        (focus)="open.set(true)"
        (keydown)="onKeydown($event)"
      />
      <kbd
        class="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-line bg-canvas-alt px-1.5 py-0.5 text-[0.6875rem] font-semibold text-slate-500 sm:block"
        aria-hidden="true"
      >
        Strg K
      </kbd>
    </label>

    @if (open() && query().trim().length > 0) {
      <div
        id="global-search-results"
        role="listbox"
        class="absolute top-full right-0 left-0 z-50 mt-2 max-h-[min(28rem,70dvh)] animate-fade-in overflow-y-auto overscroll-contain rounded-2xl bg-canvas p-1.5 shadow-2xl ring-1 shadow-slate-950/15 ring-slate-900/10 motion-reduce:animate-none sm:right-auto sm:w-[28rem]"
      >
        @if (hits().length === 0) {
          <p class="px-3 py-6 text-center text-sm text-muted">Nichts gefunden. Andere Schreibweise oder weniger Wörter probieren.</p>
        } @else {
          <ul class="flex flex-col">
            @for (hit of hits(); track hit.type + hit.id; let index = $index) {
              <li>
                <a
                  [id]="'global-hit-' + index"
                  role="option"
                  [attr.aria-selected]="active() === index"
                  [routerLink]="hit.link"
                  class="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors"
                  [class]="active() === index ? 'bg-primary-soft' : 'hover:bg-canvas-alt'"
                  (click)="close()"
                  (mouseenter)="active.set(index)"
                >
                  <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-canvas-alt text-slate-500">
                    <ng-icon [name]="hit.icon" size="17" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-semibold text-ink">{{ hit.title }}</span>
                    <span class="block truncate text-xs text-muted">
                      {{ typeLabel[hit.type].label }}@if (hit.customerName) { · {{ hit.customerName }} }
                    </span>
                    <span class="block truncate text-xs text-slate-500">{{ hit.subtitle }}</span>
                  </span>
                </a>
              </li>
            }
          </ul>
          <a
            [routerLink]="['/suche']"
            [queryParams]="{ q: query() }"
            class="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
            (click)="close()"
          >
            Alle Treffer anzeigen
            <ng-icon name="phosphorArrowRight" size="16" />
          </a>
        }
      </div>
    }
  `,
})
export class GlobalSearch {
  private readonly index = inject(SearchIndex);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected readonly typeLabel = HIT_TYPE;
  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly active = signal(-1);

  protected readonly hits = computed(() => this.index.search(this.query(), 7));

  protected onInput(value: string): void {
    this.query.set(value);
    this.active.set(-1);
    this.open.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.hits().length;
    if (event.key === 'Escape') {
      this.close();
      this.field().nativeElement.blur();
      return;
    }
    if (event.key === 'ArrowDown' && count > 0) {
      event.preventDefault();
      this.active.set((this.active() + 1) % count);
      return;
    }
    if (event.key === 'ArrowUp' && count > 0) {
      event.preventDefault();
      this.active.set(this.active() <= 0 ? count - 1 : this.active() - 1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const hit = this.hits()[this.active()];
      void this.router.navigate(hit ? [...hit.link] : ['/suche'], hit ? {} : { queryParams: { q: this.query() } });
      this.close();
    }
  }

  protected onShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.field().nativeElement.focus();
      this.field().nativeElement.select();
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  protected close(): void {
    this.open.set(false);
    this.active.set(-1);
  }
}
