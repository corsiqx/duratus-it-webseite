import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { PortalNotification } from '../data/models';
import { PortalStore } from '../data/portal-store';

/**
 * Bell button with a popover list. Uses the Popover API: light dismiss, Escape and top layer come from the browser;
 * the panel is positioned under the button when it opens.
 */
@Component({
  selector: 'app-notifications-panel',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative', '(window:resize)': 'onResize()' },
  template: `
    <button
      #trigger
      type="button"
      popovertarget="notifications-popover"
      class="relative flex size-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
    >
      <ng-icon name="phosphorBell" size="21" />
      @if (store.unreadCount() > 0) {
        <span
          class="absolute top-1 right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] leading-4.5 font-bold text-white ring-2 ring-canvas tabular-nums"
          aria-hidden="true"
        >{{ store.unreadCount() }}</span>
      }
      <span class="sr-only">Benachrichtigungen, {{ store.unreadCount() }} ungelesen</span>
    </button>

    <div
      #panel
      id="notifications-popover"
      popover
      class="inset-auto m-0 max-h-[var(--panel-max-h,32rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-canvas p-0 text-ink shadow-[0_24px_60px_-20px_rgb(15_23_42/0.35)] ring-1 ring-slate-900/[0.07] open:flex open:animate-fade-in motion-reduce:open:animate-none"
      (beforetoggle)="position($event)"
    >
      <div class="flex shrink-0 items-center justify-between gap-3 border-b border-line py-2 pr-2 pl-4">
        <h2 class="text-sm font-bold text-ink">Benachrichtigungen</h2>
        <button
          type="button"
          class="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-40"
          [disabled]="store.unreadCount() === 0"
          (click)="store.markAllNotificationsRead()"
        >
          <ng-icon name="phosphorChecks" size="15" />
          Alle gelesen
        </button>
      </div>
      <ul class="max-h-[26rem] min-h-0 flex-1 divide-y divide-line overflow-y-auto overscroll-contain">
        @for (item of store.notifications(); track item.id) {
          <li>
            <button
              type="button"
              class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas-alt focus-visible:bg-canvas-alt focus-visible:outline-none"
              (click)="open(item)"
            >
              <span
                class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
                [class]="item.read ? 'bg-slate-100 text-slate-500' : 'bg-primary-soft text-primary'"
              >
                <ng-icon [name]="item.icon" size="18" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-start justify-between gap-2">
                  <span class="text-sm" [class]="item.read ? 'font-medium text-slate-700' : 'font-semibold text-ink'">{{ item.title }}</span>
                  @if (!item.read) {
                    <span class="mt-1.5 size-2 shrink-0 rounded-full bg-primary"><span class="sr-only">ungelesen</span></span>
                  }
                </span>
                <span class="mt-0.5 block text-xs leading-relaxed text-muted">{{ item.text }}</span>
                <span class="mt-1 block text-[0.6875rem] text-slate-400 tabular-nums">{{ item.date }}</span>
              </span>
            </button>
          </li>
        }
      </ul>
    </div>
  `,
})
export class NotificationsPanel {
  protected readonly store = inject(PortalStore);
  private readonly router = inject(Router);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  protected position(event: Event): void {
    if ((event as ToggleEvent).newState === 'open') this.place();
  }

  /** Keeps the panel inside the viewport: under the bell on wide screens, full width with 16 px gutters on phones. */
  protected place(): void {
    const panel = this.panel().nativeElement;
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    const gutter = 16;
    const viewport = document.documentElement.clientWidth;
    const width = Math.min(384, viewport - 2 * gutter);
    const right = Math.min(Math.max(gutter, viewport - rect.right), viewport - width - gutter);
    const top = rect.bottom + 8;
    panel.style.top = `${top}px`;
    panel.style.right = `${right}px`;
    panel.style.width = `${width}px`;
    panel.style.setProperty('--panel-max-h', `${window.innerHeight - top - gutter}px`);
  }

  protected onResize(): void {
    if (this.panel().nativeElement.matches(':popover-open')) this.place();
  }

  protected open(item: PortalNotification): void {
    this.store.markNotificationRead(item.id);
    this.panel().nativeElement.hidePopover();
    void this.router.navigate([item.link], { queryParams: item.queryParams });
  }
}
