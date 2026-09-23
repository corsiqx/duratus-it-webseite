import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Badge } from '../content/catalog';

const LABELS: Record<Badge, { text: string; class: string }> = {
  neu: { text: 'Neu', class: 'bg-blue-600 text-white' },
  aktion: { text: 'Aktion', class: 'bg-amber-500 text-slate-950' },
  bestseller: { text: 'Häufig gekauft', class: 'bg-teal-600 text-white' },
  auslauf: { text: 'Auslauf', class: 'bg-slate-600 text-white' },
};

/** Marketing markers on a product tile. Kept to at most two so the tile stays readable. */
@Component({
  selector: 'app-product-badges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @for (badge of badges().slice(0, 2); track badge) {
      <span class="rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" [class]="labels[badge].class">
        {{ labels[badge].text }}
      </span>
    }
  `,
})
export class ProductBadges {
  readonly badges = input.required<readonly Badge[]>();
  protected readonly labels = LABELS;
}
