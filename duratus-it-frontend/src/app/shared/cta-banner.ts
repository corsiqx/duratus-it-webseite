import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CONTACT_CTA } from '../content/site';
import { RevealDirective } from './reveal.directive';

/** Closing call to action on a brand-blue panel. Links to the contact page, optionally with a preselected topic. */
@Component({
  selector: 'app-cta-banner',
  imports: [RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-canvas py-12 sm:py-20 lg:py-24" [attr.aria-label]="title()">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          appReveal
          class="relative isolate flex flex-col gap-7 overflow-hidden rounded-2xl bg-primary px-6 py-10 sm:px-12 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:py-14"
        >
          <div
            class="pointer-events-none absolute -right-24 -bottom-40 -z-10 size-96 rounded-full border-[48px] border-white/10"
            aria-hidden="true"
          ></div>
          <div class="max-w-2xl">
            <h2 class="text-[1.75rem] leading-tight font-bold tracking-tight text-balance text-white sm:text-4xl">{{ title() }}</h2>
            <p class="mt-4 text-lg leading-relaxed text-blue-50">{{ text() }}</p>
          </div>
          <a
            [routerLink]="path()"
            [queryParams]="queryParams()"
            class="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-stretch rounded-full bg-white sm:self-start px-6 py-3.5 text-[15px] font-semibold whitespace-nowrap text-primary shadow-lg shadow-blue-950/20 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] lg:self-center"
          >
            {{ label() }}
            <ng-icon
              name="phosphorArrowRight"
              size="18"
              class="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  `,
})
export class CtaBanner {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly label = input(CONTACT_CTA);
  /** Target route; defaults to the contact page. */
  readonly path = input('/kontakt');
  /** Preselects a subject on the target page (?thema= for contact, ?stelle= for applications). */
  readonly topic = input<string>();
  readonly topicParam = input<'thema' | 'stelle'>('thema');

  protected readonly queryParams = computed(() => {
    const topic = this.topic();
    return topic ? { [this.topicParam()]: topic } : null;
  });
}
