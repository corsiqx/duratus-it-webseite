import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ESCALATION_TIERS, SERVICE_LINES, SERVICE_PRINCIPLES } from '../../content/managed-services';
import { CtaBanner } from '../../shared/cta-banner';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-managed-services',
  imports: [PageHero, CtaBanner, RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './managed-services.html',
})
export class ManagedServices {
  private readonly location = inject(Location);
  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>('tab');
  private readonly packageList = viewChild<ElementRef<HTMLUListElement>>('packageList');

  protected readonly lines = SERVICE_LINES;
  protected readonly principles = SERVICE_PRINCIPLES;
  protected readonly tiers = ESCALATION_TIERS;

  private readonly fragment = toSignal(inject(ActivatedRoute).fragment);
  protected readonly selectedId = signal(SERVICE_LINES[0].id);
  protected readonly selected = computed(() => SERVICE_LINES.find((l) => l.id === this.selectedId()) ?? SERVICE_LINES[0]);

  /** Package card currently in view in the swipeable row (phones and tablets). */
  protected readonly activePackage = signal(0);

  constructor() {
    // Deep links such as /managed-services#backup open the matching tab.
    effect(() => {
      const fragment = this.fragment();
      if (fragment && SERVICE_LINES.some((l) => l.id === fragment)) this.selectedId.set(fragment);
    });

    // The package list is re-created per service line; track which card is in view with an observer (no scroll listener).
    effect((onCleanup) => {
      const list = this.packageList()?.nativeElement;
      this.activePackage.set(0);
      if (!list || typeof IntersectionObserver === 'undefined') return;
      const cards = Array.from(list.children);
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) this.activePackage.set(cards.indexOf(entry.target));
          }
        },
        { root: list, threshold: 0.6 },
      );
      cards.forEach((card) => observer.observe(card));
      onCleanup(() => observer.disconnect());
    });
  }

  protected select(id: string, focus = false): void {
    this.selectedId.set(id);
    // Keep the URL shareable without triggering a router navigation (and its scroll handling).
    this.location.replaceState(`/managed-services#${id}`);
    if (focus) this.tabs().find((t) => t.nativeElement.id === `tab-${id}`)?.nativeElement.focus();
  }

  /** Scrolls the package row horizontally to a card without moving the page vertically. */
  protected showPackage(index: number): void {
    const list = this.packageList()?.nativeElement;
    const card = list?.children.item(index) as HTMLElement | null;
    if (!list || !card) return;
    const padding = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
    const left = list.scrollLeft + card.getBoundingClientRect().left - list.getBoundingClientRect().left - padding;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({ left, behavior: reduced ? 'instant' : 'smooth' });
    this.activePackage.set(index);
  }

  /** WAI-ARIA tabs keyboard pattern: arrows move, Home/End jump. */
  protected onTabKeydown(event: KeyboardEvent, index: number): void {
    const count = this.lines.length;
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % count,
      ArrowDown: (index + 1) % count,
      ArrowLeft: (index - 1 + count) % count,
      ArrowUp: (index - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.select(this.lines[next].id, true);
  }
}
