import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { REFERENCE_CASES } from '../../content/references';
import { CtaBanner } from '../../shared/cta-banner';
import { PageHero } from '../../shared/page-hero';
import { ReferenceCard } from '../../shared/reference-card';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-references',
  imports: [PageHero, CtaBanner, ReferenceCard, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      crumb="Referenzen"
      title="Typische Projekte"
      highlight="bei Kunden wie Ihnen."
      lead="Ein Einblick, wie unsere Pakete in der Praxis aussehen. Von der kleinen Kanzlei bis zum mittelständischen Produktionsbetrieb."
    />

    <section class="bg-canvas-alt py-12 sm:py-20 lg:py-24" aria-label="Projektszenarien">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p appReveal class="flex items-start gap-3 rounded-xl bg-canvas p-4 text-sm text-muted ring-1 ring-line">
          <ng-icon name="phosphorInfo" size="20" class="shrink-0 text-primary" />
          Beispielhafte, anonymisierte Projektszenarien. Freigegebene Kundenreferenzen folgen.
        </p>
        <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          @for (item of cases; track item.title; let i = $index) {
            <app-reference-card appReveal [revealDelay]="i % 2" [case]="item" />
          }
        </div>
      </div>
    </section>

    <app-cta-banner
      title="Ihr Projekt könnte das nächste sein."
      text="Erzählen Sie uns von Ihrer aktuellen IT-Situation. Wir zeigen Ihnen, welches Paket passt."
    />
  `,
})
export class References {
  protected readonly cases = REFERENCE_CASES;
}
