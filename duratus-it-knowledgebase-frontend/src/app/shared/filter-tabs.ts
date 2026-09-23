import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

let nextId = 0;

/**
 * Segmented filter built on native radio buttons (arrow keys work out of the box).
 * On phones it scrolls sideways: soft edges show that more options follow, the active option is scrolled into view.
 */
@Component({
  selector: 'app-filter-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0', '(window:resize)': 'measure()' },
  template: `
    <fieldset
      #scroller
      class="-mx-4 min-w-0 snap-x overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      [style.mask-image]="mask()"
      (scroll)="measure()"
    >
      <legend class="sr-only">{{ label() }}</legend>
      <div class="inline-flex gap-1 rounded-full bg-slate-200/60 p-1">
        @for (option of options(); track option.value) {
          <label
            class="relative flex min-h-10 cursor-pointer snap-start items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap text-slate-600 transition-colors hover:text-ink has-checked:bg-canvas has-checked:text-ink has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-primary"
            [attr.data-active]="value() === option.value ? '' : null"
          >
            <input type="radio" class="sr-only" [name]="name" [value]="option.value" [checked]="value() === option.value" (change)="value.set(option.value)" />
            {{ option.label }}
            @if (option.count !== undefined) {
              <span class="rounded-full bg-slate-900/[0.06] px-1.5 text-xs leading-5 text-muted tabular-nums">{{ option.count }}</span>
            }
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class FilterTabs<T extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly FilterOption<T>[]>();
  readonly value = model.required<T>();
  protected readonly name = `filter-tabs-${nextId++}`;

  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly fadeStart = signal(false);
  private readonly fadeEnd = signal(false);

  protected readonly mask = computed(() => {
    if (!this.fadeStart() && !this.fadeEnd()) return null;
    const start = this.fadeStart() ? 'transparent 0, black 2.5rem' : 'black 0';
    const end = this.fadeEnd() ? 'black calc(100% - 2.5rem), transparent 100%' : 'black 100%';
    return `linear-gradient(to right, ${start}, ${end})`;
  });

  constructor() {
    afterRenderEffect(() => {
      this.value();
      this.options();
      const scroller = this.scroller().nativeElement;
      const active = scroller.querySelector<HTMLElement>('[data-active]');
      if (active && scroller.scrollWidth > scroller.clientWidth) {
        const left = active.offsetLeft - scroller.offsetLeft;
        if (left < scroller.scrollLeft + 16 || left + active.offsetWidth > scroller.scrollLeft + scroller.clientWidth - 16) {
          scroller.scrollTo({ left: left - 16, behavior: 'instant' });
        }
      }
      this.measure();
    });
  }

  protected measure(): void {
    const scroller = this.scroller().nativeElement;
    const overflow = scroller.scrollWidth - scroller.clientWidth;
    this.fadeStart.set(overflow > 1 && scroller.scrollLeft > 4);
    this.fadeEnd.set(overflow > 1 && scroller.scrollLeft < overflow - 4);
  }
}
