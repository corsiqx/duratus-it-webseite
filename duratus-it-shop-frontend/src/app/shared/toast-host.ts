import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      // Phones: under the top bar (clear of sticky action bars and the thumb zone). Larger screens: bottom right.
      'pointer-events-none fixed inset-x-4 top-[calc(4.5rem+env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-6 sm:items-end',
    role: 'status',
    'aria-live': 'polite',
  },
  template: `
    @for (toast of toasts.toasts(); track toast.id) {
      <div
        class="pointer-events-auto flex w-full max-w-sm animate-fade-in sm:animate-fade-up items-center gap-3 rounded-2xl bg-night py-3 pr-2 pl-4 text-sm text-white shadow-xl ring-1 shadow-slate-950/20 ring-white/10 motion-reduce:animate-none sm:w-auto"
      >
        <ng-icon [name]="toast.icon" size="20" class="shrink-0 text-teal-400" />
        <span class="flex-1 leading-snug">{{ toast.message }}</span>
        <button
          type="button"
          class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-primary-on-night"
          (click)="toasts.dismiss(toast.id)"
        >
          <ng-icon name="phosphorX" size="16" />
          <span class="sr-only">Hinweis schließen</span>
        </button>
      </div>
    }
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
