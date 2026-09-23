import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { COMPANY } from '../../content/company';
import { SHOP_FAQ } from '../../content/shop';
import { Crumb, PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-faq-page',
  imports: [RouterLink, NgIcon, PageHero, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-page-hero
      [crumbs]="crumbs"
      title="Fragen und"
      highlight="Antworten"
      lead="Die Punkte, die im Shop am häufigsten aufkommen. Wenn etwas fehlt, fragen Sie einfach."
    />

    <section class="bg-canvas py-12 sm:py-16" aria-labelledby="faq-heading">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="faq-heading" class="sr-only">Häufige Fragen</h2>
        <ul class="flex flex-col gap-3">
          @for (entry of faq; track entry.question; let i = $index) {
            <li appReveal [revealDelay]="i % 4">
              <details class="group rounded-2xl bg-canvas-alt px-5 py-1 open:bg-canvas open:ring-1 open:ring-line">
                <summary class="flex min-h-14 list-none items-center justify-between gap-4 py-2 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {{ entry.question }}
                  <ng-icon
                    name="phosphorCaretDown"
                    size="18"
                    class="shrink-0 text-muted transition-transform duration-300 ease-out-expo group-open:rotate-180"
                  />
                </summary>
                <p class="pb-5 leading-relaxed text-muted">{{ entry.answer }}</p>
              </details>
            </li>
          }
        </ul>

        <div class="mt-10 rounded-2xl bg-night p-6 text-slate-300 sm:p-8">
          <h2 class="text-xl font-bold text-white">Frage nicht dabei?</h2>
          <p class="mt-2 leading-relaxed">
            Schreiben Sie uns. Zu Bestellungen antworten wir am selben Arbeitstag, zu Angeboten innerhalb eines
            Arbeitstags.
          </p>
          <div class="mt-5 flex flex-col gap-2 sm:flex-row">
            <a
              [href]="'mailto:' + company.shopEmail"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <ng-icon name="phosphorEnvelopeSimple" size="16" />
              {{ company.shopEmail }}
            </a>
            <a
              routerLink="/versand-und-zahlung"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              Versand und Zahlung
              <ng-icon name="phosphorArrowRight" size="16" />
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FaqPage {
  protected readonly crumbs: readonly Crumb[] = [{ label: 'Fragen und Antworten' }];
  protected readonly faq = SHOP_FAQ;
  protected readonly company = COMPANY;
}
