import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { BENEFIT_GROUPS, JOBS } from '../../content/careers';
import { CtaBanner } from '../../shared/cta-banner';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-careers',
  imports: [PageHero, CtaBanner, RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      crumb="Karriere"
      title="Bock auf IT,"
      highlight="die wirklich was bewegt?"
      lead="Wir suchen Menschen, die lieber automatisieren als dreimal dasselbe Ticket abzutippen. Und die mit uns direkt am FMO durchstarten wollen."
    >
      <a
        routerLink="/karriere"
        fragment="stellen"
        class="group mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary py-3.5 pr-5 pl-6 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-on-night active:scale-[0.98]"
      >
        Offene Stellen ansehen
        <ng-icon name="phosphorCaretDown" size="18" class="transition-transform duration-300 ease-out-expo group-hover:translate-y-0.5" />
      </a>
    </app-page-hero>

    <section class="bg-canvas py-16 sm:py-24 lg:py-28" aria-labelledby="culture-title">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div appReveal class="lg:col-span-7">
          <h2 id="culture-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Kein Konzern. Kurze Wege, offene Türen.
          </h2>
          <p class="mt-6 text-lg leading-relaxed text-muted">
            Bei uns duzt du vom ersten Tag an alle, auch die Geschäftsführung. Gute Ideen hängen nicht an Hierarchien, sondern
            an einer Frage: Macht es die IT unserer Kunden besser?
          </p>
          <p class="mt-4 leading-relaxed text-muted">
            Wir bauen IT-Services, die sich selbst überwachen, patchen und heilen. So bleibt Zeit für gute Beratung, spannende
            Projekte und ab und zu ein Feierabendgetränk mit dem Team.
          </p>
        </div>
        <div appReveal [revealDelay]="1" class="lg:col-span-5">
          <div class="aspect-[4/3] max-w-full overflow-hidden rounded-2xl bg-slate-200 shadow-xl shadow-slate-900/10 lg:aspect-[4/5]">
            <!-- TODO: echtes Teamfoto einsetzen -->
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=70"
              alt="Zwei Kolleginnen und Kollegen freuen sich über einen Projekterfolg"
              class="size-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-line bg-canvas-alt py-16 sm:py-24 lg:py-28" aria-labelledby="benefits-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div appReveal class="max-w-2xl">
          <h2 id="benefits-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Benefits, die wir selbst nutzen.
          </h2>
        </div>
        <div class="mt-10 sm:mt-14 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          @for (group of benefitGroups; track group.title; let g = $index) {
            <div appReveal [revealDelay]="g" class="rounded-2xl bg-canvas p-6 sm:p-7 ring-1 ring-line">
              <h3 class="text-sm font-semibold text-primary">{{ group.title }}</h3>
              <ul class="mt-6 flex flex-col gap-5">
                @for (benefit of group.benefits; track benefit.title) {
                  <li class="flex gap-4">
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <ng-icon [name]="benefit.icon" size="20" />
                    </span>
                    <span>
                      <span class="block font-bold text-ink">{{ benefit.title }}</span>
                      <span class="block text-[15px] leading-relaxed text-muted">{{ benefit.text }}</span>
                    </span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </section>

    <section id="stellen" class="bg-canvas py-16 sm:py-24 lg:py-28" aria-labelledby="jobs-title">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div appReveal>
          <h2 id="jobs-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Aktuell suchen wir.
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-muted">Nichts Passendes dabei? Initiativbewerbungen lesen wir immer persönlich.</p>
        </div>

        <div class="mt-12 flex flex-col gap-4">
          @for (job of jobs; track job.id; let i = $index) {
            <details appReveal [revealDelay]="i" class="group rounded-2xl bg-canvas ring-1 ring-line transition-shadow open:shadow-xl open:shadow-slate-900/5 open:ring-primary/40">
              <summary class="flex list-none items-start gap-4 rounded-2xl p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:items-center sm:gap-5 sm:p-8 [&::-webkit-details-marker]:hidden">
                <!-- Icon only from sm: on phones the title and tags need the full width. -->
                <span class="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary sm:flex">
                  <ng-icon [name]="job.icon" size="24" />
                </span>
                <span class="flex-1">
                  <span class="block text-lg font-bold tracking-tight text-ink sm:text-xl">{{ job.title }}</span>
                  <span class="mt-2 flex flex-wrap gap-2">
                    @for (tag of job.tags; track tag) {
                      <span class="rounded-full bg-canvas-alt px-2.5 py-1 text-xs font-semibold text-muted ring-1 ring-line">{{ tag }}</span>
                    }
                  </span>
                </span>
                <ng-icon
                  name="phosphorCaretDown"
                  size="22"
                  class="mt-1 shrink-0 text-muted transition-transform duration-300 ease-out-expo group-open:rotate-180 sm:mt-0"
                />
              </summary>

              <div class="border-t border-line px-5 pt-5 pb-6 motion-safe:animate-fade-in sm:px-8 sm:pt-6 sm:pb-8">
                <p class="max-w-[70ch] leading-relaxed text-muted">{{ job.intro }}</p>
                <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <h3 class="font-bold text-ink">Deine Aufgaben</h3>
                    <ul class="mt-3 flex flex-col gap-2.5">
                      @for (task of job.tasks; track task) {
                        <li class="flex gap-3 text-[15px] leading-relaxed text-muted">
                          <ng-icon name="phosphorCheckCircle" size="20" class="mt-0.5 shrink-0 text-primary" />
                          {{ task }}
                        </li>
                      }
                    </ul>
                  </div>
                  <div>
                    <h3 class="font-bold text-ink">Dein Profil</h3>
                    <ul class="mt-3 flex flex-col gap-2.5">
                      @for (item of job.profile; track item) {
                        <li class="flex gap-3 text-[15px] leading-relaxed text-muted">
                          <ng-icon name="phosphorCheckCircle" size="20" class="mt-0.5 shrink-0 text-primary" />
                          {{ item }}
                        </li>
                      }
                    </ul>
                  </div>
                </div>
                <div class="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-sm text-muted">{{ job.note }}</p>
                  <a
                    routerLink="/bewerbung"
                    [queryParams]="{ stelle: job.id }"
                    class="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover active:scale-[0.98]"
                  >
                    Jetzt bewerben
                    <ng-icon name="phosphorArrowRight" size="16" class="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </details>
          }
        </div>
      </div>
    </section>

    <app-cta-banner
      title="Nichts Passendes gefunden?"
      text="Schick uns trotzdem deine Unterlagen. Wir freuen uns über Initiativbewerbungen aus dem gesamten IT-Bereich."
      label="Initiativ bewerben"
      path="/bewerbung"
      topic="initiativ"
      topicParam="stelle"
    />
  `,
})
export class Careers {
  protected readonly benefitGroups = BENEFIT_GROUPS;
  protected readonly jobs = JOBS;
}
