import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

/** Shown when a list has no entries, always with a hint what to do next. */
@Component({
  selector: 'app-empty-state',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col items-center rounded-2xl bg-canvas px-6 py-14 text-center ring-1 ring-line">
      <span class="flex size-12 items-center justify-center rounded-full bg-canvas-alt text-slate-400">
        <ng-icon [name]="icon()" size="24" />
      </span>
      <p class="mt-4 font-semibold text-ink">{{ title() }}</p>
      <p class="mt-1 max-w-md text-sm text-muted">{{ hint() }}</p>
      <ng-content />
    </div>
  `,
})
export class EmptyState {
  readonly icon = input('phosphorMagnifyingGlass');
  readonly title = input.required<string>();
  readonly hint = input('');
}
