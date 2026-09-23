import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { DarkSurfaceDirective } from './dark-surface.directive';

/** Navy intro block for subpages: breadcrumb, two-part headline and lead. */
@Component({
  selector: 'app-page-hero',
  imports: [RouterLink, NgIcon, DarkSurfaceDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section appDarkSurface class="relative isolate overflow-hidden bg-night pt-28 pb-14 sm:pt-40 sm:pb-24" [attr.aria-labelledby]="headingId">
      <!-- Faint grid and brand glow give the navy surface depth. -->
      <div
        class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-size-[64px_64px] mask-radial-at-top-right mask-radial-from-0% mask-radial-to-75%"
        aria-hidden="true"
      ></div>
      <!-- Radial gradient instead of a blur filter: same glow, no costly repaint while scrolling. -->
      <div
        class="absolute -top-80 -right-40 -z-10 size-[56rem] rounded-full bg-radial from-primary/30 to-transparent to-70%"
        aria-hidden="true"
      ></div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Brotkrumen" class="motion-safe:animate-fade-up">
          <ol class="flex items-center gap-2 text-sm text-slate-400">
            <li><a routerLink="/" class="rounded transition-colors hover:text-white">Start</a></li>
            <li aria-hidden="true"><ng-icon name="phosphorCaretDown" size="12" class="-rotate-90" /></li>
            <li aria-current="page" class="text-slate-200">{{ crumb() }}</li>
          </ol>
        </nav>
        <h1
          [id]="headingId"
          class="mt-6 max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight text-balance text-white motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-5xl lg:text-6xl"
        >
          {{ title() }} <span class="text-primary-on-night">{{ highlight() }}</span>
        </h1>
        <p
          class="mt-6 max-w-[62ch] text-lg leading-relaxed text-pretty text-slate-300 motion-safe:animate-fade-up motion-safe:[animation-delay:160ms]"
        >
          {{ lead() }}
        </p>
        <ng-content />
      </div>
    </section>
  `,
})
export class PageHero {
  readonly crumb = input.required<string>();
  readonly title = input.required<string>();
  readonly highlight = input('');
  readonly lead = input.required<string>();

  protected readonly headingId = `page-hero-${Math.random().toString(36).slice(2, 8)}`;
}
