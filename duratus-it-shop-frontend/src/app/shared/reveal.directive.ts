import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input, signal } from '@angular/core';

/**
 * Fades and lifts an element in once it enters the viewport.
 * Only transform and opacity animate; motion applies under `prefers-reduced-motion: no-preference` only.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class:
      'motion-safe:transition-[opacity,translate] motion-safe:duration-700 motion-safe:ease-out-expo motion-safe:data-[revealed=false]:translate-y-5 motion-safe:data-[revealed=false]:opacity-0',
    '[attr.data-revealed]': 'revealed()',
    '[class.delay-75]': 'revealDelay() === 1',
    '[class.delay-150]': 'revealDelay() === 2',
    '[class.delay-225]': 'revealDelay() === 3',
    '[class.delay-300]': 'revealDelay() === 4',
    '[class.delay-375]': 'revealDelay() === 5',
  },
})
export class RevealDirective {
  readonly revealDelay = input<number>(0);
  protected readonly revealed = signal(false);

  constructor() {
    const element = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.revealed.set(true);
        return;
      }
      // Anything already above the fold (or scrolled past, e.g. after an anchor jump) shows immediately.
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
        this.revealed.set(true);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
          this.revealed.set(true);
          observer.disconnect();
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
