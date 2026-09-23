import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AvailabilityLabel, Product, availabilityLabel } from '../content/catalog';

const TONE: Record<AvailabilityLabel['tone'], { badge: string; dot: string }> = {
  good: { badge: 'bg-teal-50 text-teal-800 ring-teal-600/20', dot: 'bg-teal-600' },
  info: { badge: 'bg-blue-50 text-blue-800 ring-blue-600/20', dot: 'bg-blue-600' },
  warning: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/25', dot: 'bg-amber-500' },
  neutral: { badge: 'bg-slate-100 text-slate-700 ring-slate-500/20', dot: 'bg-slate-400' },
};

/** Availability as a pill: colour plus wording, never colour alone. */
@Component({
  selector: 'app-availability-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset"
      [class]="tone().badge"
    >
      <span class="size-1.5 rounded-full" [class]="tone().dot" aria-hidden="true"></span>
      {{ label().label }}
    </span>
    @if (withDetail()) {
      <span class="mt-1.5 block text-xs text-muted">{{ label().detail }}</span>
    }
  `,
})
export class AvailabilityPill {
  readonly product = input.required<Product>();
  readonly withDetail = input(false);

  protected readonly label = computed(() => availabilityLabel(this.product()));
  protected readonly tone = computed(() => TONE[this.label().tone]);
}
