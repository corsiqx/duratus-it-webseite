import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ShopStore } from '../data/shop-store';

/**
 * Strip above the sticky header: says that the catalogue is a demo, who the shop is for, and switches
 * the price display. It scrolls away, so the sticky bar stays as flat as possible on phones.
 */
@Component({
  selector: 'app-shop-notice',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block bg-night text-slate-300' },
  template: `
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-4 py-2 text-xs sm:px-6 lg:px-8">
      <p class="flex items-center gap-2">
        <ng-icon name="phosphorInfo" size="14" class="shrink-0 text-primary-on-night" />
        <span>Beispielkatalog: Artikel, Preise und Bestände sind Demodaten.</span>
      </p>
      <div class="flex items-center gap-4">
        <span class="hidden sm:inline">Nur für Unternehmen und Einrichtungen</span>
        <fieldset class="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
          <legend class="sr-only">Preisanzeige</legend>
          @for (mode of priceModes; track mode.value) {
            <label
              class="cursor-pointer rounded-full px-2.5 py-1 font-semibold transition-colors has-checked:bg-white has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-primary-on-night"
              [class.text-slate-300]="store.priceMode() !== mode.value"
            >
              <input
                type="radio"
                name="preisanzeige"
                class="sr-only"
                [value]="mode.value"
                [checked]="store.priceMode() === mode.value"
                (change)="store.setPriceMode(mode.value)"
              />
              {{ mode.label }}
            </label>
          }
        </fieldset>
      </div>
    </div>
  `,
})
export class ShopNotice {
  protected readonly store = inject(ShopStore);
  protected readonly priceModes = [
    { value: 'netto' as const, label: 'netto' },
    { value: 'brutto' as const, label: 'brutto' },
  ];
}
