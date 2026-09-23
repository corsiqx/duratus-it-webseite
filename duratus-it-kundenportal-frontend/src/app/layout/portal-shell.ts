import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { filter, map } from 'rxjs';
import { AuthService } from '../data/auth';
import { PortalStore } from '../data/portal-store';
import { BrandMark } from '../shared/brand-mark';
import { initials } from '../shared/format';
import { ToastService } from '../shared/toast.service';
import { NavBadge, PORTAL_NAV } from './nav';
import { NotificationsPanel } from './notifications-panel';

/** Sidebar navigation (off-canvas below lg), top bar with page title and the routed page. */
@Component({
  selector: 'app-portal-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, BrandMark, NotificationsPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-shell.html',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class PortalShell {
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly auth = inject(AuthService);
  protected readonly store = inject(PortalStore);
  protected readonly nav = PORTAL_NAV;

  protected readonly menuOpen = signal(false);
  protected readonly isDesktop = signal(true);
  protected readonly accountInitials = computed(() => initials(this.store.account().name));

  protected readonly badges = computed<Record<NavBadge, number>>(() => ({
    tickets: this.store.ticketsAwaitingReply().length,
    offers: this.store.pendingOffers().length,
    invoices: this.store.overdueInvoices().length,
  }));

  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly sidebarClose = viewChild.required<ElementRef<HTMLButtonElement>>('sidebarClose');
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected readonly heading = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.currentHeading()),
    ),
    { initialValue: this.currentHeading() },
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const query = window.matchMedia('(min-width: 64rem)');
      const sync = () => {
        this.isDesktop.set(query.matches);
        if (query.matches) this.menuOpen.set(false);
      };
      sync();
      query.addEventListener('change', sync);
      destroyRef.onDestroy(() => query.removeEventListener('change', sync));
    });

    // Close the off-canvas menu after navigating and continue at the new page content.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (!this.menuOpen()) return;
        this.menuOpen.set(false);
        this.main().nativeElement.focus({ preventScroll: true });
      });

    // Lock page scroll behind the open mobile menu.
    effect(() => document.documentElement.classList.toggle('overflow-hidden', this.menuOpen()));
    destroyRef.onDestroy(() => document.documentElement.classList.remove('overflow-hidden'));
  }

  protected openMenu(): void {
    this.menuOpen.set(true);
    requestAnimationFrame(() => this.sidebarClose().nativeElement.focus());
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.menuButton().nativeElement.focus();
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/anmelden']);
    this.toasts.show('Sie wurden abgemeldet.', 'phosphorSignOut');
  }

  private currentHeading(): string {
    let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return (route.data['heading'] as string | undefined) ?? '';
  }
}
