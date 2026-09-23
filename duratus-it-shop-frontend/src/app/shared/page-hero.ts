import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

export interface Crumb {
  label: string;
  path?: string;
}

/** Navy intro block for subpages: breadcrumb, headline, lead and room for actions. */
@Component({
  selector: 'app-page-hero',
  imports: [RouterLink, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="relative isolate overflow-hidden bg-night py-10 sm:py-14" [attr.aria-labelledby]="headingId">
      <!-- Faint grid and brand glow give the navy surface depth. -->
      <div
        class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-size-[64px_64px] mask-radial-at-top-right mask-radial-from-0% mask-radial-to-75%"
        aria-hidden="true"
      ></div>
      <div class="absolute -top-72 -right-40 -z-10 size-[48rem] rounded-full bg-radial from-primary/25 to-transparent to-70%" aria-hidden="true"></div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Brotkrumen">
          <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
            <li><a routerLink="/" class="rounded transition-colors hover:text-white">Shop</a></li>
            @for (crumb of crumbs(); track crumb.label; let last = $last) {
              <li aria-hidden="true"><ng-icon name="phosphorCaretRight" size="12" /></li>
              <li [attr.aria-current]="last ? 'page' : null" [class]="last ? 'text-slate-200' : ''">
                @if (crumb.path && !last) {
                  <a [routerLink]="crumb.path" class="rounded transition-colors hover:text-white">{{ crumb.label }}</a>
                } @else {
                  {{ crumb.label }}
                }
              </li>
            }
          </ol>
        </nav>

        <div class="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="min-w-0">
            <h1 [id]="headingId" class="max-w-3xl text-3xl leading-tight font-bold tracking-tight text-balance text-white sm:text-4xl">
              {{ title() }}@if (highlight()) {<span class="text-primary-on-night"> {{ highlight() }}</span>}
            </h1>
            @if (lead()) {
              <p class="mt-3 max-w-[62ch] text-base leading-relaxed text-pretty text-slate-300">{{ lead() }}</p>
            }
          </div>
          <div class="shrink-0">
            <ng-content />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PageHero {
  readonly crumbs = input.required<readonly Crumb[]>();
  readonly title = input.required<string>();
  readonly highlight = input('');
  readonly lead = input('');

  protected readonly headingId = `page-hero-${Math.random().toString(36).slice(2, 8)}`;
}
