import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusLabel, Tone } from '../data/status';

const TONE_CLASSES: Record<Tone, { badge: string; dot: string }> = {
  good: { badge: 'bg-teal-50 text-teal-800 ring-teal-600/20', dot: 'bg-teal-600' },
  info: { badge: 'bg-blue-50 text-blue-800 ring-blue-600/20', dot: 'bg-blue-600' },
  warning: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/25', dot: 'bg-amber-500' },
  critical: { badge: 'bg-red-50 text-red-800 ring-red-600/20', dot: 'bg-red-600' },
  neutral: { badge: 'bg-slate-100 text-slate-700 ring-slate-500/20', dot: 'bg-slate-400' },
};

/** Status pill: tone colour plus text label, never colour alone. */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset"
      [class]="classes().badge"
    >
      <span class="size-1.5 rounded-full" [class]="classes().dot" aria-hidden="true"></span>
      {{ status().label }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<StatusLabel>();
  protected readonly classes = computed(() => TONE_CLASSES[this.status().tone]);
}
