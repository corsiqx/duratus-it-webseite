import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Duratus IT logo (shield with pulse line, taken from the existing brand files) plus wordmark. */
@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-2.5' },
  template: `
    <svg viewBox="0 0 72 72" class="size-8 shrink-0" aria-hidden="true">
      @if (tone() === 'onDark') {
        <path d="M36 4 L62 14 L62 36 C62 52 50 63 36 68 C22 63 10 52 10 36 L10 14 Z" class="fill-white/8 stroke-white/20" stroke-width="1.5" />
        <polyline
          points="14,36 20,36 24,26 28,46 32,20 36,42 40,30 44,36 50,36 58,36"
          fill="none"
          class="stroke-sky-300"
          stroke-width="2.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="32" cy="20" r="2.5" class="fill-teal-400" />
      } @else {
        <path d="M36 4 L62 14 L62 36 C62 52 50 63 36 68 C22 63 10 52 10 36 L10 14 Z" class="fill-brand-navy" />
        <path d="M36 9 L57 18 L57 36 C57 49 47 59 36 64 C25 59 15 49 15 36 L15 18 Z" fill="none" class="stroke-blue-800" stroke-width="1.5" />
        <polyline
          points="14,36 20,36 24,26 28,46 32,20 36,42 40,30 44,36 50,36 58,36"
          fill="none"
          class="stroke-blue-500"
          stroke-width="2.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="32" cy="20" r="2.5" class="fill-brand-teal" />
      }
    </svg>
    <span class="text-base leading-none font-bold tracking-tight transition-colors" [class]="tone() === 'onDark' ? 'text-white' : 'text-ink'">
      Duratus <span class="font-semibold" [class]="tone() === 'onDark' ? 'text-sky-300' : 'text-primary'">IT</span>
    </span>
  `,
})
export class BrandMark {
  readonly tone = input<'onLight' | 'onDark'>('onLight');
}
