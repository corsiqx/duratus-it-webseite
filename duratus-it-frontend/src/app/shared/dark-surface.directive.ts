import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { HeaderTheme } from '../layout/header-theme';

/** Bottom edge of the floating nav bar (12px top gutter + 56px bar). */
const HEADER_HEIGHT = 68;

/**
 * Marks a full-width dark section. While any part of it sits under the fixed header,
 * the header switches to its light-on-dark variant.
 */
@Directive({ selector: '[appDarkSurface]' })
export class DarkSurfaceDirective {
  constructor() {
    const element = inject(ElementRef<HTMLElement>).nativeElement;
    const theme = inject(HeaderTheme);
    const destroyRef = inject(DestroyRef);

    destroyRef.onDestroy(() => theme.setUnderHeader(this, false));

    afterNextRender(() => {
      // Synchronous first check avoids a one-frame flash of the light header on pages that start dark.
      const rect = element.getBoundingClientRect();
      theme.setUnderHeader(this, rect.top <= HEADER_HEIGHT && rect.bottom > HEADER_HEIGHT);

      if (typeof IntersectionObserver === 'undefined') return;
      // Root starts below the header: the section "intersects" exactly while it is still under the header line.
      // Observing the whole section keeps this correct after instant jumps (anchor links, scroll restoration).
      const observer = new IntersectionObserver(
        ([entry]) =>
          theme.setUnderHeader(this, entry.isIntersecting && entry.boundingClientRect.top <= HEADER_HEIGHT),
        { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px`, threshold: [0, 0.001, 1] },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
