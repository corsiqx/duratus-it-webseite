import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, Scroll } from '@angular/router';
import { filter } from 'rxjs';
import { ShopFooter } from './layout/shop-footer';
import { ShopHeader } from './layout/shop-header';
import { ShopNotice } from './layout/shop-notice';
import { ToastHost } from './shared/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ShopNotice, ShopHeader, ShopFooter, ToastHost],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative flex min-h-dvh flex-col' },
  template: `
    <!-- A plain href="#main" would resolve against <base href="/"> and navigate home, so focus the main element directly. -->
    <a
      href="#main"
      class="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      (click)="skipToMain($event)"
    >
      Zum Inhalt springen
    </a>
    <app-shop-notice />
    <app-shop-header />
    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <router-outlet />
    </main>
    <app-shop-footer />
    <app-toast-host />
  `,
})
export class App {
  constructor() {
    inject(Router)
      .events.pipe(
        filter((event): event is Scroll => event instanceof Scroll),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        if (typeof window === 'undefined') return;
        if (event.position) {
          window.scrollTo({ left: event.position[0], top: event.position[1], behavior: 'instant' });
        } else if (event.anchor) {
          scrollToAnchor(event.anchor);
        } else {
          // New page: jump to the top instantly, the view transition handles the visual change.
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      });
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ block: 'start' });
  }
}

/** Smooth-scrolls to an anchor, retrying briefly while a lazy route is still rendering. */
function scrollToAnchor(anchor: string, attempt = 0): void {
  const target = document.getElementById(anchor);
  if (!target) {
    if (attempt < 12) setTimeout(() => scrollToAnchor(anchor, attempt + 1), 50);
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
}
