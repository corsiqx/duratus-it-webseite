import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { COMPANY } from '../../content/site';
import { PageHero } from '../../shared/page-hero';

/** Placeholder for Impressum, Datenschutz and AGB until the legal texts are provided. */
@Component({
  selector: 'app-legal',
  imports: [PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero [crumb]="heading()" [title]="heading()" lead="Die rechtlichen Angaben werden vor der Veröffentlichung vollständig ergänzt." />

    <section class="bg-canvas py-20">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        @if (heading() === 'Impressum') {
          <h2 class="text-xl font-bold text-ink">Angaben gemäß § 5 DDG</h2>
          <address class="mt-4 leading-relaxed text-muted not-italic">
            {{ company.name }}<br />
            {{ company.street }}<br />
            {{ company.city }}<br /><br />
            Telefon: {{ company.phone }}<br />
            E-Mail: {{ company.email }}<br /><br />
            {{ company.register }}<br />
            USt-IdNr.: {{ company.vatId }}
          </address>
        } @else {
          <p class="leading-relaxed text-muted">Der Text für diese Seite folgt.</p>
        }
      </div>
    </section>
  `,
})
export class Legal {
  readonly heading = input.required<string>();
  protected readonly company = COMPANY;
}
