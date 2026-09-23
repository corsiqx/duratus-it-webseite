import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CATEGORIES } from '../content/catalog';
import { COMPANY, WEBSITE } from '../content/company';
import { PAYMENT_METHODS } from '../content/shop';
import { BrandMark } from '../shared/brand-mark';

@Component({
  selector: 'app-shop-footer',
  imports: [RouterLink, NgIcon, BrandMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-night text-slate-400">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 md:grid-cols-12 lg:px-8">
        <div class="md:col-span-4">
          <app-brand-mark tone="onDark" />
          <p class="mt-5 max-w-[32ch] text-lg leading-relaxed font-semibold text-white">
            Hardware, Lizenzen und der Betrieb dazu. Aus einer Hand.
          </p>
          <address class="mt-4 text-sm leading-relaxed not-italic">
            {{ company.name }}<br />
            {{ company.street }}, {{ company.city }}
          </address>
          <p class="mt-5 flex flex-col gap-1 text-sm">
            <a [href]="company.phoneHref" class="transition-colors hover:text-white">{{ company.phone }}</a>
            <a [href]="'mailto:' + company.shopEmail" class="transition-colors hover:text-white">{{ company.shopEmail }}</a>
            <span>{{ company.serviceHours }}</span>
          </p>
        </div>

        <nav class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8" aria-label="Fußnavigation">
          <div>
            <h2 class="text-sm font-semibold text-white">Kategorien</h2>
            <ul class="mt-4 flex flex-col gap-1 text-sm">
              @for (category of categories; track category.id) {
                <li>
                  <a [routerLink]="['/katalog', category.slug]" class="inline-block py-1.5 transition-colors hover:text-white">
                    {{ category.name }}
                  </a>
                </li>
              }
            </ul>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-white">Bestellen</h2>
            <ul class="mt-4 flex flex-col gap-1 text-sm">
              @for (link of shopLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path" class="inline-block py-1.5 transition-colors hover:text-white">{{ link.label }}</a>
                </li>
              }
            </ul>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-white">Duratus IT</h2>
            <ul class="mt-4 flex flex-col gap-1 text-sm">
              @for (link of siteLinks; track link.href) {
                <li>
                  <a [href]="link.href" class="inline-flex items-center gap-1.5 py-1.5 transition-colors hover:text-white">
                    {{ link.label }}
                    <ng-icon name="phosphorArrowUpRight" size="12" class="opacity-60" />
                  </a>
                </li>
              }
            </ul>
            <ul class="mt-4 flex flex-col gap-1 text-sm">
              @for (link of legalLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path" class="inline-block py-1.5 transition-colors hover:text-white">{{ link.label }}</a>
                </li>
              }
            </ul>
          </div>
        </nav>
      </div>

      <div class="border-t border-white/10">
        <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <span>© {{ year }} {{ company.name }}. {{ company.register }}, USt-IdNr. {{ company.vatId }}</span>
          <ul class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            @for (method of payments; track method.id) {
              <li class="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                <ng-icon [name]="method.icon" size="14" class="text-primary-on-night" />
                {{ method.label }}
              </li>
            }
          </ul>
        </div>
      </div>
    </footer>
  `,
})
export class ShopFooter {
  protected readonly company = COMPANY;
  protected readonly categories = CATEGORIES;
  protected readonly payments = PAYMENT_METHODS;
  protected readonly year = new Date().getFullYear();

  protected readonly shopLinks = [
    { label: 'Warenkorb', path: '/warenkorb' },
    { label: 'Merkliste', path: '/merkliste' },
    { label: 'Bestellungen und Angebote', path: '/bestellungen' },
    { label: 'Versand und Zahlung', path: '/versand-und-zahlung' },
    { label: 'Fragen und Antworten', path: '/fragen' },
    { label: 'Mein Konto', path: '/konto' },
  ];

  protected readonly siteLinks = [
    { label: 'Website', href: WEBSITE.home },
    { label: 'Managed Services', href: WEBSITE.managedServices },
    { label: 'Konfigurator', href: WEBSITE.configurator },
    { label: 'Kundenportal', href: WEBSITE.portal },
  ];

  protected readonly legalLinks = [
    { label: 'Impressum', path: '/impressum' },
    { label: 'Datenschutz', path: '/datenschutz' },
    { label: 'AGB', path: '/agb' },
  ];
}
