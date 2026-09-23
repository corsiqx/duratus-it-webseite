import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { COMPANY } from '../../content/company';
import { Crumb, PageHero } from '../../shared/page-hero';

const HEADINGS: Record<string, string> = {
  impressum: 'Impressum',
  datenschutz: 'Datenschutz',
  agb: 'AGB',
};

/** Placeholder for Impressum, Datenschutz and AGB until the legal texts are provided. */
@Component({
  selector: 'app-legal-page',
  imports: [NgIcon, PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-page-hero
      [crumbs]="crumbs()"
      [title]="heading()"
      lead="Die rechtlichen Angaben werden vor der Veröffentlichung vollständig ergänzt."
    />

    <section class="bg-canvas py-12 sm:py-16">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p class="flex items-start gap-2.5 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-600/20">
          <ng-icon name="phosphorWarningCircle" size="18" class="mt-0.5 shrink-0" />
          <span>
            Platzhalter. Ein Webshop braucht geprüfte Texte: Impressum, Datenschutzhinweise mit Auftragsverarbeitung und
            AGB für das Geschäft zwischen Unternehmen, inklusive Eigentumsvorbehalt, Lieferfristen und
            Gewährleistungsfristen. Das gehört vor dem Livegang zu einer Anwältin oder einem Anwalt.
          </span>
        </p>

        @if (legal() === 'impressum') {
          <h2 class="mt-10 text-xl font-bold text-ink">Angaben gemäß § 5 DDG</h2>
          <address class="mt-4 leading-relaxed text-muted not-italic">
            {{ company.name }}<br />
            {{ company.street }}<br />
            {{ company.city }}<br /><br />
            Telefon: {{ company.phone }}<br />
            E-Mail: {{ company.email }}<br /><br />
            {{ company.register }}<br />
            USt-IdNr.: {{ company.vatId }}
          </address>
          <p class="mt-6 text-sm text-muted">
            <!-- TODO: Geschäftsführung, Registerdaten und Aufsichtsbehörden ergänzen. -->
            Geschäftsführung, Registerdaten und zuständige Aufsichtsbehörden werden ergänzt.
          </p>
        } @else if (legal() === 'datenschutz') {
          <h2 class="mt-10 text-xl font-bold text-ink">Was der Shop verarbeitet</h2>
          <p class="mt-4 leading-relaxed text-muted">
            Diese Demo speichert Warenkorb, Merkliste, Stammdaten und erzeugte Vorgänge ausschließlich im lokalen
            Speicher Ihres Browsers. Es gibt keinen Server, keine Anmeldung und keine Übertragung an Dritte. Auch die
            PDF-Dateien entstehen im Browser.
          </p>
          <p class="mt-4 leading-relaxed text-muted">
            Im echten Betrieb kommen Bestelldaten, Adressen und Rechnungsdaten in das Warenwirtschaftssystem, dazu
            braucht es die vollständigen Datenschutzhinweise mit Rechtsgrundlagen, Speicherfristen und den beteiligten
            Auftragsverarbeitern (Distributoren, Versanddienstleister, Zahlungsabwicklung).
          </p>
        } @else {
          <h2 class="mt-10 text-xl font-bold text-ink">Geschäft zwischen Unternehmen</h2>
          <p class="mt-4 leading-relaxed text-muted">
            Der Shop richtet sich ausschließlich an Unternehmen, Vereine und öffentliche Einrichtungen. Alle Preise sind
            Nettopreise zuzüglich Umsatzsteuer. Ein Widerrufsrecht wie im Verbrauchergeschäft besteht nicht.
          </p>
          <p class="mt-4 leading-relaxed text-muted">
            Die vollständigen Bedingungen zu Lieferung, Gefahrübergang, Eigentumsvorbehalt, Mängelansprüchen und
            Haftung werden vor der Veröffentlichung ergänzt.
          </p>
        }
      </div>
    </section>
  `,
})
export class LegalPage {
  /** Bound from the route data. */
  readonly legal = input.required<string>();

  protected readonly company = COMPANY;
  protected readonly heading = computed(() => HEADINGS[this.legal()] ?? 'Rechtliches');
  protected readonly crumbs = computed<readonly Crumb[]>(() => [{ label: this.heading() }]);
}
