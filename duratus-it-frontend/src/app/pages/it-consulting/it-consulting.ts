import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CONSULTING_APPROACH, CONSULTING_GROUPS } from '../../content/consulting';
import { CtaBanner } from '../../shared/cta-banner';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-it-consulting',
  imports: [PageHero, CtaBanner, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      crumb="IT Consulting"
      title="Strategie, Projekte"
      highlight="und IT-Security."
      lead="Wo unsere Managed Services bewusst standardisiert sind, deckt IT Consulting den individuellen Bedarf ab. Von der Roadmap bis zum Sicherheitskonzept."
    />

    <section class="bg-canvas py-16 sm:py-24 lg:py-28" aria-labelledby="modules-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div appReveal class="max-w-2xl">
          <h2 id="modules-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Was wir beraten und umsetzen.
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-muted">
            Projektbasiert nach Aufwand statt Pauschale. Mit automatisierter Vorarbeit, wo immer möglich.
          </p>
        </div>

        <div class="mt-10 sm:mt-14 grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          @for (group of groups; track group.title; let g = $index) {
            <div>
              <h3 appReveal class="flex items-center gap-3 text-sm font-semibold text-primary">
                <span class="h-px w-8 bg-primary" aria-hidden="true"></span>
                {{ group.title }}
              </h3>
              <ul class="mt-6 flex flex-col gap-4">
                @for (module of group.modules; track module.title; let i = $index) {
                  <li
                    appReveal
                    [revealDelay]="i + g"
                    class="group flex gap-4 rounded-2xl border border-line p-5 transition sm:gap-5 sm:p-6 duration-300 ease-out-expo hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5"
                    [class]="g === 1 ? 'bg-canvas-alt' : 'bg-canvas'"
                  >
                    <span
                      class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white sm:size-12"
                    >
                      <ng-icon [name]="module.icon" size="24" />
                    </span>
                    <div>
                      <h4 class="text-lg font-bold tracking-tight text-ink">{{ module.title }}</h4>
                      <p class="mt-1.5 leading-relaxed text-muted">{{ module.text }}</p>
                      <p class="mt-3 text-sm font-semibold text-ink">{{ module.format }}</p>
                    </div>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="bg-night py-24 text-white sm:py-28" aria-labelledby="approach-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div appReveal class="max-w-2xl">
          <h2 id="approach-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance">
            Beratung, die in Umsetzung mündet.
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-300">
            Kein Bericht für die Schublade: Ergebnisse werden zu konkreten, priorisierten Handlungsempfehlungen.
          </p>
        </div>
        <ol class="mt-10 sm:mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          @for (step of approach; track step.title; let i = $index) {
            <li appReveal [revealDelay]="i" class="rounded-2xl bg-white/5 p-6 sm:p-7 ring-1 ring-white/10">
              <span class="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold" aria-hidden="true">
                {{ i + 1 }}
              </span>
              <h3 class="mt-6 text-xl font-bold tracking-tight">{{ step.title }}</h3>
              <p class="mt-2 leading-relaxed text-slate-300">{{ step.text }}</p>
            </li>
          }
        </ol>
      </div>
    </section>

    <app-cta-banner
      title="Unsicher, wo Ihre IT heute steht?"
      text="Wir starten mit einem strukturierten Assessment und zeigen Ihnen konkrete Handlungsfelder auf."
      label="Assessment anfragen"
      topic="security"
    />
  `,
})
export class ItConsulting {
  protected readonly groups = CONSULTING_GROUPS;
  protected readonly approach = CONSULTING_APPROACH;
}
