import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { COMPANY, EXPRESS_SURCHARGE, FREE_SHIPPING_FROM, SHIPPING_FLAT } from '../../content/company';
import { DELIVERY_OPTIONS, ORDER_STEPS, PAYMENT_METHODS } from '../../content/shop';
import { euroCents } from '../../shared/format';
import { Crumb, PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-delivery-page',
  imports: [RouterLink, NgIcon, PageHero, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-page-hero
      [crumbs]="crumbs"
      title="Versand und"
      highlight="Zahlung"
      lead="Wie eine Bestellung bei uns läuft, was der Versand kostet und wann welche Zahlungsart möglich ist."
    />

    <!-- The path of an order -->
    <section class="bg-canvas py-12 sm:py-16" aria-labelledby="steps-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="steps-heading" class="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Der Weg einer Bestellung</h2>
        <ol class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          @for (step of steps; track step.title; let i = $index) {
            <li appReveal [revealDelay]="i" class="flex h-full flex-col rounded-2xl bg-canvas-alt p-5">
              <div class="flex items-center gap-3">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white tabular-nums">
                  {{ i + 1 }}
                </span>
                <ng-icon [name]="step.icon" size="20" class="text-primary" />
              </div>
              <h3 class="mt-4 font-bold text-ink">{{ step.title }}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ step.text }}</p>
            </li>
          }
        </ol>
      </div>
    </section>

    <!-- Shipping -->
    <section class="bg-canvas-alt py-12 sm:py-16" aria-labelledby="shipping-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div class="lg:col-span-5">
            <h2 id="shipping-heading" class="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Versand</h2>
            <p class="mt-3 leading-relaxed text-muted">
              Wo es möglich ist, liefert der Distributor direkt an Ihre Adresse. Das spart einen Umschlag über unser
              Lager und hält die Lieferzeit kurz.
            </p>
            <dl class="mt-6 flex flex-col gap-3">
              <div class="flex items-baseline justify-between gap-4 rounded-xl bg-canvas px-4 py-3 ring-1 ring-line">
                <dt class="text-sm text-muted">Versandkosten</dt>
                <dd class="font-semibold text-ink tabular-nums">{{ euroCents(flat) }} netto</dd>
              </div>
              <div class="flex items-baseline justify-between gap-4 rounded-xl bg-canvas px-4 py-3 ring-1 ring-line">
                <dt class="text-sm text-muted">Versandfrei ab</dt>
                <dd class="font-semibold text-ink tabular-nums">{{ euroCents(freeFrom) }} netto</dd>
              </div>
              <div class="flex items-baseline justify-between gap-4 rounded-xl bg-canvas px-4 py-3 ring-1 ring-line">
                <dt class="text-sm text-muted">Expresszuschlag</dt>
                <dd class="font-semibold text-ink tabular-nums">{{ euroCents(express) }} netto</dd>
              </div>
              <div class="flex items-baseline justify-between gap-4 rounded-xl bg-canvas px-4 py-3 ring-1 ring-line">
                <dt class="text-sm text-muted">Liefergebiet</dt>
                <dd class="text-right font-semibold text-ink">Deutschland, Österreich auf Anfrage</dd>
              </div>
            </dl>
            <p class="mt-4 text-sm text-muted">
              Monatliche Lizenzen sind keine Sendung und lösen keine Versandkosten aus.
            </p>
          </div>

          <div class="lg:col-span-7">
            <ul class="flex flex-col gap-3">
              @for (option of deliveryOptions; track option.id) {
                <li class="flex gap-4 rounded-2xl bg-canvas p-5 ring-1 ring-line">
                  <span class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <ng-icon [name]="option.icon" size="22" />
                  </span>
                  <div class="min-w-0">
                    <h3 class="font-bold text-ink">{{ option.label }}</h3>
                    <p class="mt-1 text-sm leading-relaxed text-muted">{{ option.text }}</p>
                  </div>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Payment -->
    <section class="bg-canvas py-12 sm:py-16" aria-labelledby="payment-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="payment-heading" class="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Zahlung</h2>
        <p class="mt-3 max-w-[64ch] leading-relaxed text-muted">
          Wir fragen im Shop keine Zahlungsdaten ab. Es gibt keine Karten- und keine Bankdaten einzugeben: die
          Abwicklung läuft über Rechnung, Überweisung oder unseren Leasingpartner.
        </p>
        <ul class="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          @for (method of payments; track method.id; let i = $index) {
            <li appReveal [revealDelay]="i" class="flex h-full flex-col rounded-2xl bg-canvas-alt p-5">
              <span class="flex size-11 items-center justify-center rounded-full bg-canvas text-primary">
                <ng-icon [name]="method.icon" size="22" />
              </span>
              <h3 class="mt-4 font-bold text-ink">{{ method.label }}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ method.text }}</p>
            </li>
          }
        </ul>
      </div>
    </section>

    <!-- Returns and warranty -->
    <section class="bg-canvas-alt py-12 sm:py-16" aria-labelledby="returns-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 id="returns-heading" class="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Rückgabe und Garantie</h2>
            <div class="mt-4 flex flex-col gap-4 text-muted">
              <p class="leading-relaxed">
                Als Firmenkunde haben Sie kein Widerrufsrecht wie Verbraucher. Wir nehmen ungeöffnete Lagerware innerhalb
                von 14 Tagen trotzdem zurück, sofern sie originalverpackt ist. Konfigurierte Geräte und Lizenzen sind
                ausgenommen, weil sie für Sie gefertigt oder auf Ihren Mandanten ausgestellt wurden.
              </p>
              <p class="leading-relaxed">
                Im Garantiefall übernehmen wir die Abwicklung mit dem Hersteller. Bei Geräten mit Vor-Ort-Service
                brauchen Sie nur ein Ticket zu öffnen, den Rest organisieren wir.
              </p>
            </div>
          </div>
          <div class="rounded-2xl bg-canvas p-6 ring-1 ring-line">
            <h3 class="font-bold text-ink">Fragen zur Bestellung?</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted">
              Schreiben oder rufen Sie an. Sie landen bei einem Menschen, der die Bestellung vor sich hat.
            </p>
            <div class="mt-5 flex flex-col gap-2 sm:flex-row">
              <a [href]="'mailto:' + company.shopEmail" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover">
                <ng-icon name="phosphorEnvelopeSimple" size="16" />
                {{ company.shopEmail }}
              </a>
              <a [href]="company.phoneHref" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-canvas-alt px-5 text-sm font-semibold text-ink transition hover:bg-slate-100">
                <ng-icon name="phosphorPhone" size="16" />
                {{ company.phone }}
              </a>
            </div>
            <p class="mt-4 text-sm text-muted">{{ company.serviceHours }}</p>
            <a routerLink="/fragen" class="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover">
              Häufige Fragen ansehen
              <ng-icon name="phosphorArrowRight" size="14" />
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class DeliveryPage {
  protected readonly crumbs: readonly Crumb[] = [{ label: 'Versand und Zahlung' }];
  protected readonly company = COMPANY;
  protected readonly steps = ORDER_STEPS;
  protected readonly deliveryOptions = DELIVERY_OPTIONS;
  protected readonly payments = PAYMENT_METHODS;
  protected readonly euroCents = euroCents;
  protected readonly flat = SHIPPING_FLAT;
  protected readonly freeFrom = FREE_SHIPPING_FROM;
  protected readonly express = EXPRESS_SURCHARGE;
}
