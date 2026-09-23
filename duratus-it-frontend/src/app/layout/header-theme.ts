import { computed, Injectable, signal } from '@angular/core';

/** Tracks how many dark surfaces currently sit under the fixed header, so it can switch to its light-on-dark look. */
@Injectable({ providedIn: 'root' })
export class HeaderTheme {
  private readonly darkSurfaces = signal(new Set<object>());

  readonly overDarkSurface = computed(() => this.darkSurfaces().size > 0);

  setUnderHeader(owner: object, isUnder: boolean): void {
    this.darkSurfaces.update((current) => {
      if (current.has(owner) === isUnder) return current;
      const next = new Set(current);
      if (isUnder) next.add(owner);
      else next.delete(owner);
      return next;
    });
  }
}
