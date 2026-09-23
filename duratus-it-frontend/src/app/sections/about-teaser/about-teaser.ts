import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FACTS, VALUES } from '../../content/company';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-about-teaser',
  imports: [RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-canvas py-16 sm:py-24 lg:py-32" aria-labelledby="about-teaser-title">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div appReveal class="lg:col-span-5">
          <div class="relative aspect-[4/3] max-w-full overflow-hidden rounded-2xl sm:aspect-[16/10] lg:aspect-[4/5] bg-slate-900 shadow-xl shadow-slate-900/10">
            <img
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1100&q=70"
              alt="Technikerin mit Laptop im Gang eines Rechenzentrums"
              class="size-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div class="flex flex-col justify-center lg:col-span-7">
          <div appReveal>
            <h2 id="about-teaser-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
              IT-Partner, der versteht.
            </h2>
            <p class="mt-6 max-w-[60ch] text-lg leading-relaxed text-muted">
              Mittelständische Unternehmen sollen die gleiche IT-Qualität bekommen wie Konzerne: zu planbaren Monatspreisen
              und mit einem persönlichen Ansprechpartner statt anonymer Warteschlange.
            </p>
            <p class="mt-4 max-w-[60ch] leading-relaxed text-muted">
              Duratus heißt auf Latein beständig, gehärtet. Genau das bauen wir: IT-Infrastrukturen, die langfristig tragen.
            </p>
          </div>

          <ul class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Unsere Werte">
            @for (value of values; track value.title; let i = $index) {
              <li appReveal [revealDelay]="i + 1" class="rounded-2xl border border-line bg-canvas-alt p-4">
                <ng-icon [name]="value.icon" size="22" class="text-primary" />
                <p class="mt-3 font-bold text-ink">{{ value.title }}</p>
                <p class="mt-1 text-sm leading-snug text-muted">{{ value.text }}</p>
              </li>
            }
          </ul>

          <a
            appReveal
            routerLink="/ueber-uns"
            class="group mt-10 inline-flex items-center gap-2 self-start font-semibold text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Team und Standort kennenlernen
            <ng-icon name="phosphorArrowRight" size="18" class="transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      <dl class="mx-auto mt-14 grid max-w-7xl sm:mt-20 grid-cols-2 gap-x-6 gap-y-10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        @for (fact of facts; track fact.label; let i = $index) {
          <div appReveal [revealDelay]="i" class="border-t-2 border-primary pt-5">
            <dt class="sr-only">{{ fact.label }}</dt>
            <dd class="text-4xl font-bold tracking-tight text-ink sm:text-5xl" aria-hidden="true">{{ fact.value }}</dd>
            <dd class="mt-3 max-w-[28ch] text-sm leading-relaxed text-muted">{{ fact.label }}</dd>
          </div>
        }
      </dl>
    </section>
  `,
})
export class AboutTeaser {
  protected readonly values = VALUES;
  protected readonly facts = FACTS;
}
