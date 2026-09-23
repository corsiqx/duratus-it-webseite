import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { COMPANY } from '../content/site';
import { BrandMark } from '../shared/brand-mark';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, NgIcon, BrandMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-night text-slate-400">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 md:grid-cols-12 lg:px-8 lg:py-20">
        <div class="md:col-span-5">
          <app-brand-mark tone="onDark" />
          <p class="mt-5 max-w-[34ch] text-lg leading-relaxed font-semibold text-white">{{ company.claim }}</p>
          <address class="mt-4 text-sm leading-relaxed not-italic">
            {{ company.name }}<br />
            {{ company.street }}, {{ company.city }}
          </address>
          <p class="mt-6 flex flex-col gap-1 text-sm">
            <a [href]="company.phoneHref" class="transition-colors hover:text-white">{{ company.phone }}</a>
            <span>{{ company.serviceHours }}</span>
          </p>
        </div>

        <nav class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7" aria-label="Fußnavigation">
          @for (group of groups; track group.title) {
            <div>
              <h2 class="text-sm font-semibold text-white">{{ group.title }}</h2>
              <ul class="mt-4 flex flex-col gap-1 text-sm">
                @for (link of group.links; track link.label) {
                  <li>
                    <a [routerLink]="link.path" class="inline-block py-1.5 transition-colors hover:text-white">{{ link.label }}</a>
                  </li>
                }
              </ul>
            </div>
          }
        </nav>
      </div>

      <div class="border-t border-white/10">
        <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <span>© {{ year }} {{ company.name }}. {{ company.register }}, USt-IdNr. {{ company.vatId }}</span>
          <span class="flex items-center gap-4">
            <a [href]="'mailto:' + company.email" class="transition-colors hover:text-white">{{ company.email }}</a>
            <!-- TODO: echtes LinkedIn-Profil verlinken -->
            <a href="https://www.linkedin.com" rel="noopener" target="_blank" class="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <ng-icon name="phosphorLinkedinLogo" size="16" />
              LinkedIn
            </a>
          </span>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly company = COMPANY;
  protected readonly year = new Date().getFullYear();

  protected readonly groups = [
    {
      title: 'Leistungen',
      links: [
        { label: 'Produkte', path: '/hardware-beschaffung' },
        { label: 'Managed Services', path: '/managed-services' },
        { label: 'IT Consulting', path: '/it-consulting' },
        { label: 'Konfigurator', path: '/konfigurator' },
      ],
    },
    {
      title: 'Unternehmen',
      links: [
        { label: 'Über uns', path: '/ueber-uns' },
        { label: 'Referenzen', path: '/referenzen' },
        { label: 'Karriere', path: '/karriere' },
        { label: 'Kontakt', path: '/kontakt' },
      ],
    },
    {
      title: 'Rechtliches',
      links: [
        { label: 'Impressum', path: '/impressum' },
        { label: 'Datenschutz', path: '/datenschutz' },
        { label: 'AGB', path: '/agb' },
      ],
    },
  ];
}
