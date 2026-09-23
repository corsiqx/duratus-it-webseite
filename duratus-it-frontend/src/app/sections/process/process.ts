import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PROCESS_STEPS } from '../../content/company';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-process',
  imports: [NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="vorgehen" class="relative border-y border-line bg-canvas-alt py-16 sm:py-24 lg:py-32" aria-labelledby="process-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div appReveal class="max-w-2xl">
          <p class="text-sm font-semibold text-primary">So arbeiten wir</p>
          <h2 id="process-title" class="mt-4 text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Strukturiert, transparent, mit klaren Meilensteinen.
          </h2>
        </div>

        <div class="relative mt-12 sm:mt-16">
          <!-- Connector: vertical on mobile, horizontal on desktop. Draws in once visible. -->
          <div
            appReveal
            class="pointer-events-none absolute top-6 bottom-6 left-6 w-px bg-line lg:right-[10%] lg:bottom-auto lg:h-px lg:w-auto"
            aria-hidden="true"
          >
            <div
              class="size-full origin-top bg-linear-to-b from-primary to-primary/0 motion-safe:transition-transform motion-safe:duration-[1600ms] motion-safe:ease-out-expo in-data-[revealed=false]:scale-y-0 lg:origin-left lg:bg-linear-to-r lg:in-data-[revealed=false]:scale-x-0 lg:in-data-[revealed=false]:scale-y-100"
            ></div>
          </div>

          <ol class="relative grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-5 lg:gap-6">
            @for (step of steps; track step.title; let i = $index) {
              <li appReveal [revealDelay]="i + 1" class="relative flex gap-6 lg:flex-col lg:gap-0">
                <span
                  class="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-primary shadow-sm shadow-slate-900/5"
                >
                  <ng-icon [name]="step.icon" size="22" />
                </span>
                <div>
                  <h3 class="text-xl font-bold tracking-tight text-ink lg:mt-6">{{ step.title }}</h3>
                  <p class="mt-2 max-w-[36ch] leading-relaxed text-muted">{{ step.text }}</p>
                </div>
              </li>
            }
          </ol>
        </div>
      </div>
    </section>
  `,
})
export class Process {
  protected readonly steps = PROCESS_STEPS;
}
