import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TEAM, VALUES } from '../../content/company';
import { COMPANY } from '../../content/site';
import { CtaBanner } from '../../shared/cta-banner';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-about',
  imports: [PageHero, CtaBanner, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      crumb="Über uns"
      title="Die Menschen"
      highlight="hinter Duratus IT."
      lead="Kein anonymes Callcenter, sondern ein festes Team, das Ihre Systeme kennt. Mit Sitz im Airportpark Greven, direkt am Flughafen Münster/Osnabrück."
    />

    <section class="bg-canvas py-16 sm:py-24 lg:py-28" aria-labelledby="intro-title">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div appReveal class="flex flex-col justify-center lg:col-span-6">
          <h2 id="intro-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Ein kleines Team, das große Verantwortung ernst nimmt.
          </h2>
          <p class="mt-6 text-lg leading-relaxed text-muted">
            Bei uns bekommen Sie feste Gesichter, die Ihre Infrastruktur über Jahre begleiten. Ein hoher
            Automatisierungsgrad schafft den Freiraum für das, was Automatisierung nicht kann: zuhören, mitdenken, erklären.
          </p>
          <p class="mt-4 leading-relaxed text-muted">
            Deshalb bleibt unser Kernteam bewusst klein und erfahren, ergänzt um ein Netzwerk aus Spezialistinnen und
            Spezialisten für alles, was darüber hinausgeht.
          </p>
        </div>
        <div appReveal [revealDelay]="1" class="lg:col-span-6">
          <div class="aspect-[4/3] max-w-full overflow-hidden rounded-2xl bg-slate-200 shadow-xl shadow-slate-900/10">
            <!-- TODO: Teamfoto aus dem eigenen Büro einsetzen -->
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=70"
              alt="Team bespricht ein Projekt am Laptop"
              class="size-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <ul class="mx-auto mt-12 grid max-w-7xl sm:mt-20 grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8" aria-label="Unsere Werte">
        @for (value of values; track value.title; let i = $index) {
          <li appReveal [revealDelay]="i" class="flex items-center gap-4 rounded-2xl border border-line bg-canvas-alt p-5">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <ng-icon [name]="value.icon" size="22" />
            </span>
            <span>
              <span class="block font-bold text-ink">{{ value.title }}</span>
              <span class="block text-sm text-muted">{{ value.text }}</span>
            </span>
          </li>
        }
      </ul>
    </section>

    <section class="border-y border-line bg-canvas-alt py-16 sm:py-24 lg:py-28" aria-labelledby="team-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div appReveal class="max-w-2xl">
          <h2 id="team-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Feste Ansprechpartner statt Ticket-Roulette.
          </h2>
        </div>
        <ul class="mt-10 sm:mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (member of team; track member.name; let i = $index) {
            <li appReveal [revealDelay]="i % 3">
              <figure class="flex h-full flex-col rounded-2xl bg-canvas p-6 sm:p-7 ring-1 ring-line">
                <div class="flex items-center gap-4">
                  <span
                    class="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-blue-800 text-lg font-bold text-white"
                    aria-hidden="true"
                  >
                    {{ member.initials }}
                  </span>
                  <figcaption>
                    <span class="block font-bold text-ink">{{ member.name }}</span>
                    <span class="block text-sm text-muted">{{ member.role }}</span>
                  </figcaption>
                </div>
                <blockquote class="mt-6 flex-1 border-l-2 border-primary pl-4 leading-relaxed text-ink">
                  <p>„{{ member.quote }}“</p>
                </blockquote>
              </figure>
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="bg-canvas py-16 sm:py-24 lg:py-28" aria-labelledby="location-title">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div appReveal class="lg:col-span-7">
          <p class="text-sm font-semibold text-primary">Unser Standort</p>
          <h2 id="location-title" class="mt-4 text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Airportpark Greven, direkt am FMO.
          </h2>
          <p class="mt-6 max-w-[60ch] text-lg leading-relaxed text-muted">
            Kurze Wege für uns und für Sie: ob Termin vor Ort oder Rückflug direkt im Anschluss. Kundinnen und Kunden aus dem
            gesamten Bundesgebiet erreichen uns unkompliziert, und wir sie. Vor-Ort-Termine sind bei uns die Regel.
          </p>
          <ul class="mt-8 flex flex-wrap gap-2">
            @for (badge of badges; track badge.label) {
              <li class="inline-flex items-center gap-2 rounded-full bg-canvas-alt px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line">
                <ng-icon [name]="badge.icon" size="18" class="text-primary" />
                {{ badge.label }}
              </li>
            }
          </ul>
        </div>

        <div appReveal [revealDelay]="1" class="lg:col-span-5">
          <div class="relative isolate flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-night p-8 text-white">
            <div
              class="absolute inset-0 -z-10 bg-[radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)] bg-size-[20px_20px] mask-radial-at-center mask-radial-from-10% mask-radial-to-80%"
              aria-hidden="true"
            ></div>
            <span class="flex size-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-blue-600/40">
              <ng-icon name="phosphorMapPin" size="28" />
            </span>
            <address class="mt-10 text-lg leading-relaxed not-italic">
              <span class="block font-bold">{{ company.name }}</span>
              {{ company.street }}<br />
              {{ company.city }}
            </address>
            <a
              [href]="company.mapsUrl"
              target="_blank"
              rel="noopener"
              class="group mt-8 inline-flex items-center gap-2 self-start font-semibold text-blue-200 hover:text-white"
            >
              Route planen
              <ng-icon name="phosphorArrowUpRight" size="18" class="transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <app-cta-banner
      title="Lernen Sie uns persönlich kennen."
      text="Ob im Airportpark Greven oder remote: Wir freuen uns auf das Gespräch."
    />
  `,
})
export class About {
  protected readonly company = COMPANY;
  protected readonly values = VALUES;
  protected readonly team = TEAM;
  protected readonly badges = [
    { label: 'Wenige Minuten zum Flughafenterminal', icon: 'phosphorAirplaneTilt' },
    { label: 'Direkter A1-Anschluss', icon: 'phosphorRoadHorizon' },
    { label: 'Kostenlose Parkplätze', icon: 'phosphorLetterCircleP' },
  ];
}
