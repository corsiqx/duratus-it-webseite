import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TRUST_POINTS } from '../../content/company';

@Component({
  selector: 'app-trust-strip',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="border-b border-line bg-canvas" aria-label="Was Sie bei uns erwarten können">
      <ul
        class="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-4 px-4 py-6 text-[13px] leading-snug font-semibold text-ink sm:gap-x-8 sm:py-8 sm:text-sm sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8"
      >
        @for (point of points; track point.label) {
          <li class="flex items-center gap-2.5 last:col-span-2 sm:gap-3">
            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary sm:size-9">
              <ng-icon [name]="point.icon" size="18" />
            </span>
            {{ point.label }}
          </li>
        }
      </ul>
    </section>
  `,
})
export class TrustStrip {
  protected readonly points = TRUST_POINTS;
}
