import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { REFERENCE_CASES } from '../../content/references';
import { AboutTeaser } from '../../sections/about-teaser/about-teaser';
import { Hero } from '../../sections/hero/hero';
import { Pillars } from '../../sections/pillars/pillars';
import { Process } from '../../sections/process/process';
import { TrustStrip } from '../../sections/trust-strip/trust-strip';
import { CtaBanner } from '../../shared/cta-banner';
import { ReferenceCard } from '../../shared/reference-card';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-home',
  imports: [Hero, TrustStrip, Pillars, Process, AboutTeaser, ReferenceCard, CtaBanner, RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero />
    <app-trust-strip />
    <app-pillars />
    <app-process />
    <app-about-teaser />

    <section class="border-t border-line bg-canvas-alt py-16 sm:py-24 lg:py-32" aria-labelledby="refs-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div appReveal class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div class="max-w-2xl">
            <h2 id="refs-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
              Typische Projekte bei Kunden wie Ihnen.
            </h2>
            <p class="mt-4 text-muted">Beispielhafte, anonymisierte Szenarien aus unserem Portfolio.</p>
          </div>
          <a
            routerLink="/referenzen"
            class="group inline-flex items-center gap-2 self-start font-semibold text-primary hover:text-primary-hover sm:self-auto"
          >
            Alle Szenarien
            <ng-icon name="phosphorArrowRight" size="18" class="transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
          </a>
        </div>
        <div class="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          @for (item of cases; track item.title; let i = $index) {
            <app-reference-card appReveal [revealDelay]="i" [case]="item" />
          }
        </div>
      </div>
    </section>

    <app-cta-banner
      title="Welches Paket passt zu Ihrer IT?"
      text="Wir empfehlen Ihnen anhand Ihrer aktuellen Infrastruktur die passende Lösung. Unverbindlich und transparent."
    />
  `,
})
export class Home {
  protected readonly cases = REFERENCE_CASES.slice(0, 2);
}
