import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { VAT_RATE } from '../content/company';
import { ShopStore, priceIn } from '../data/shop-store';
import { euroCents } from './format';

/**
 * Price in the mode the visitor picked (net is the default for business customers).
 * The tax note is always spelled out, so no price can be misread.
 */
@Component({
  selector: 'app-price',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      @if (list()) {
        <span class="text-sm text-slate-400 line-through tabular-nums">{{ listText() }}</span>
      }
      <span class="font-bold tracking-tight text-ink tabular-nums" [class]="sizeClass()">{{ text() }}</span>
      @if (unit()) {
        <span class="text-sm font-medium text-muted">/ {{ unit() }}</span>
      }
    </p>
    @if (showNote()) {
      <p class="mt-0.5 text-xs text-muted">{{ note() }}</p>
    }
  `,
})
export class Price {
  /** Net price in euro. */
  readonly net = input.required<number>();
  /** Former net price, shown struck through. */
  readonly list = input(0);
  /** Unit such as "Benutzer / Monat"; empty for one-off articles. */
  readonly unit = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly showNote = input(true);

  private readonly store = inject(ShopStore);

  protected readonly text = computed(() => euroCents(priceIn(this.store.priceMode(), this.net())));
  protected readonly listText = computed(() => euroCents(priceIn(this.store.priceMode(), this.list())));
  protected readonly sizeClass = computed(
    () => ({ sm: 'text-base', md: 'text-xl', lg: 'text-3xl sm:text-4xl' })[this.size()],
  );
  protected readonly note = computed(() =>
    this.store.priceMode() === 'netto'
      ? `zzgl. ${Math.round(VAT_RATE * 100)} % MwSt.`
      : `inkl. ${Math.round(VAT_RATE * 100)} % MwSt.`,
  );
}
