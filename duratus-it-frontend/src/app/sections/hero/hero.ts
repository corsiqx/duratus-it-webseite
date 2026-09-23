import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CONTACT_CTA } from '../../content/site';
import { DarkSurfaceDirective } from '../../shared/dark-surface.directive';
import type { NetworkScene } from './network-scene';

type SceneState = 'loading' | 'ready' | 'fallback';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, NgIcon, DarkSurfaceDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
})
export class Hero {
  protected readonly cta = CONTACT_CTA;
  protected readonly sceneState = signal<SceneState>('loading');

  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private scene?: NetworkScene;

  constructor() {
    const destroyRef = inject(DestroyRef);
    let destroyed = false;
    let observer: IntersectionObserver | undefined;

    destroyRef.onDestroy(() => {
      destroyed = true;
      observer?.disconnect();
      this.scene?.dispose();
    });

    afterNextRender(async () => {
      const host = this.stage().nativeElement;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      try {
        // Three.js is loaded as a separate chunk so it never blocks the first paint.
        const { NetworkScene } = await import('./network-scene');
        if (destroyed) return;
        this.scene = new NetworkScene(host, {
          reducedMotion,
          onReady: () => this.sceneState.set('ready'),
        });
        if (isDevMode()) {
          (window as unknown as { __networkScene?: NetworkScene }).__networkScene = this.scene;
        }
      } catch (error) {
        console.warn('3D-Szene konnte nicht initialisiert werden, statische Darstellung aktiv.', error);
        this.sceneState.set('fallback');
        return;
      }

      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(([entry]) => this.scene?.setVisible(entry.isIntersecting));
        observer.observe(host);
      }
    });
  }
}
