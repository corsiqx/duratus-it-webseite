import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HARDWARE_CATEGORIES, PRODUCT_PRINCIPLES, VENDORS } from '../../content/products';
import { CtaBanner } from '../../shared/cta-banner';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-hardware-beschaffung',
  imports: [PageHero, CtaBanner, RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      crumb="Hardware Beschaffung"
      title="IT-Produkte,"
      highlight="die zu Ihrem Betrieb passen."
      lead="Peripherie, Arbeitsplätze, Netzwerk, Security, Server und Storage aus einer Hand. Bevorzugt zusammen mit dem passenden Managed-Service-Paket, damit Kauf und Betrieb zusammenpassen."
    />

    <section class="bg-canvas py-16 sm:py-24 lg:py-28" aria-labelledby="sortiment-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div appReveal class="max-w-2xl">
          <h2 id="sortiment-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink md:text-5xl">
            Sechs Produktbereiche, jeweils mit passendem Betrieb.
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-muted">
            Wir liefern die Geräte, die Sie für Ihren Betrieb brauchen, abgestimmt auf die jeweilige Managed-Service-Linie.
          </p>
        </div>

        <ul class="mt-10 sm:mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (category of categories; track category.title; let i = $index) {
            <li
              appReveal
              [revealDelay]="i % 3"
              class="group flex gap-4 rounded-2xl border border-line bg-canvas p-5 transition duration-300 ease-out-expo sm:flex-col sm:gap-0 sm:p-7 sm:hover:-translate-y-0.5 sm:hover:border-blue-200 sm:hover:shadow-lg sm:hover:shadow-slate-900/5"
            >
              <!-- Mobile: icon beside the text for a compact list; from sm: stacked card. -->
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white sm:size-12"
              >
                <ng-icon [name]="category.icon" size="24" />
              </span>
              <div class="flex flex-1 flex-col">
                <h3 class="text-lg font-bold tracking-tight text-ink sm:mt-5 sm:text-xl">{{ category.title }}</h3>
                <p class="mt-1.5 flex-1 leading-relaxed text-muted sm:mt-2">{{ category.text }}</p>
                <a
                  routerLink="/managed-services"
                  [fragment]="category.serviceId"
                  class="mt-3 inline-flex min-h-8 items-center gap-1.5 self-start text-sm font-semibold text-primary hover:text-primary-hover sm:mt-5"
                >
                  Betrieb: {{ category.serviceLabel }}
                  <ng-icon name="phosphorArrowUpRight" size="16" />
                </a>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="border-y border-line bg-canvas-alt py-16 sm:py-24 lg:py-28" aria-labelledby="bundle-title">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div appReveal class="lg:col-span-4">
          <p class="text-sm font-semibold text-primary">So kaufen Sie bei uns</p>
          <h2 id="bundle-title" class="mt-4 text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink">
            Paket statt Einzelkauf.
          </h2>
          <p class="mt-5 leading-relaxed text-muted">
            Produkte verkaufen wir nicht einfach nur. Sie sind der Start einer langfristigen Betriebspartnerschaft.
          </p>
        </div>
        <ul class="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 sm:gap-y-10 lg:col-span-8">
          @for (item of principles; track item.title; let i = $index) {
            <li appReveal [revealDelay]="i % 2" class="flex gap-4">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-canvas text-primary shadow-sm shadow-slate-900/5 ring-1 ring-line">
                <ng-icon [name]="item.icon" size="22" />
              </span>
              <div>
                <h3 class="font-bold text-ink">{{ item.title }}</h3>
                <p class="mt-1.5 leading-relaxed text-muted">{{ item.text }}</p>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="bg-canvas py-16 sm:py-24 lg:py-28" aria-labelledby="vendors-title">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div appReveal class="max-w-2xl">
          <h2 id="vendors-title" class="text-[2rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] font-bold tracking-tight text-balance text-ink">
            Hersteller in unserem Sortiment.
          </h2>
          <p class="mt-5 text-lg leading-relaxed text-muted">
            Bezug über zertifizierte Hersteller- und Distributorenprogramme: Originalware, volle Garantie und direkter
            Herstellersupport.
          </p>
        </div>

        <!-- 11 logos + 1 closing cell = 12 cells, so every breakpoint (2, 3, 4, 6 columns) fills without gaps. -->
        <ul appReveal class="mt-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-line sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          @for (vendor of vendors; track vendor.name) {
            <li
              class="group -mt-px -ml-px flex h-24 flex-col sm:h-32 items-center justify-center gap-2.5 border-t border-l border-line px-4 transition-colors sm:px-6 duration-300 hover:bg-canvas-alt"
            >
              <img
                [src]="vendor.logo"
                [alt]="vendor.name"
                class="w-auto max-w-full object-contain opacity-60 grayscale transition duration-300 ease-out-expo group-hover:opacity-100 group-hover:grayscale-0"
                [class]="vendor.height"
                loading="lazy"
                decoding="async"
              />
              @if (vendor.showName) {
                <span class="text-sm font-semibold text-muted transition-colors group-hover:text-ink" aria-hidden="true">
                  {{ vendor.name }}
                </span>
              }
            </li>
          }
          <li class="-mt-px -ml-px flex h-24 items-center sm:h-32 justify-center border-t border-l border-line bg-primary-soft px-4 text-center text-sm font-semibold text-primary">
            und weitere auf Anfrage
          </li>
        </ul>
      </div>
    </section>

    <app-cta-banner
      title="Neue Hardware gesucht, direkt mit Betrieb?"
      text="Wir beraten Sie zum passenden Paket aus Produkten und Managed Service für Ihren Bedarf."
      topic="produkte"
    />
  `,
})
export class HardwareBeschaffung {
  protected readonly categories = HARDWARE_CATEGORIES;
  protected readonly principles = PRODUCT_PRINCIPLES;
  protected readonly vendors = VENDORS;
}
