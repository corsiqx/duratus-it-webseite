import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { filter, map } from 'rxjs';
import { COMPANY_NAV, CONTACT_CTA, SERVICE_NAV } from '../content/site';
import { BrandMark } from '../shared/brand-mark';
import { HeaderTheme } from './header-theme';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, NgIcon, BrandMark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // The host spans the full width but lets clicks through its transparent gutter; only the bar is interactive.
    class: 'pointer-events-none fixed inset-x-0 top-0 z-40 block px-3 pt-3 sm:px-4 [view-transition-name:site-header]',
    '(document:keydown.escape)': 'onEscape()',
    '(document:click)': 'onDocumentClick($event)',
  },
  templateUrl: './site-header.html',
})
export class SiteHeader {
  private readonly theme = inject(HeaderTheme);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly router = inject(Router);
  private readonly servicesTrigger = viewChild.required<ElementRef<HTMLAnchorElement>>('servicesTrigger');
  private readonly menuTrigger = viewChild.required<ElementRef<HTMLButtonElement>>('menuTrigger');
  private readonly servicesPanel = viewChild.required<ElementRef<HTMLElement>>('servicesPanel');

  protected readonly serviceNav = SERVICE_NAV;
  protected readonly companyNav = COMPANY_NAV;
  protected readonly cta = CONTACT_CTA;

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly servicesOpen = signal(false);
  protected readonly onDark = this.theme.overDarkSurface;

  /** Over navy the glass surface only appears once there is something to separate from; over light content it is always on. */
  protected readonly showDarkSurface = computed(() => this.onDark() && (this.scrolled() || this.menuOpen()));
  protected readonly showLightSurface = computed(() => !this.onDark());

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly servicesActive = computed(() => SERVICE_NAV.some((item) => this.url().startsWith(item.path)));

  private hoverTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeAll());

    afterNextRender(() => {
      const sentinel = document.getElementById('top');
      if (!sentinel || typeof IntersectionObserver === 'undefined') return;
      // The #top sentinel sits at the very top of the page; once it leaves, the bar gets its glass surface.
      const observer = new IntersectionObserver(([entry]) => this.scrolled.set(!entry.isIntersecting));
      observer.observe(sentinel);
      destroyRef.onDestroy(() => {
        observer.disconnect();
        clearTimeout(this.hoverTimer);
      });
    });
  }

  /** Hover opens the dropdown on devices with a real pointer; a short close delay bridges the gap to the panel. */
  protected hoverServices(open: boolean, event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => this.servicesOpen.set(open), open ? 50 : 140);
  }

  /** Arrow down on the trigger opens the menu and moves focus to the first entry. */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    this.servicesOpen.set(true);
    setTimeout(() => this.panelLinks()[0]?.focus());
  }

  /** Arrow keys move between dropdown entries. */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const links = this.panelLinks();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % links.length : (index - 1 + links.length) % links.length;
    links[next]?.focus();
  }

  /** Keyboard users tabbing out of the dropdown close it. */
  protected onServicesFocusOut(event: FocusEvent, container: HTMLElement): void {
    if (!container.contains(event.relatedTarget as Node | null)) this.servicesOpen.set(false);
  }

  protected onEscape(): void {
    if (this.servicesOpen()) {
      this.closeAll();
      this.servicesTrigger().nativeElement.focus();
    } else if (this.menuOpen()) {
      this.closeAll();
      this.menuTrigger().nativeElement.focus();
    }
  }

  protected closeAll(): void {
    clearTimeout(this.hoverTimer);
    this.servicesOpen.set(false);
    this.menuOpen.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.contains(event.target as Node)) this.closeAll();
  }

  private panelLinks(): HTMLAnchorElement[] {
    return Array.from(this.servicesPanel().nativeElement.querySelectorAll('a'));
  }
}
