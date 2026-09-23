import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';

let nextId = 0;

/**
 * Modal built on the native <dialog>: focus trap, Escape and inert background come from the browser.
 * The parent owns the open state and resets it on (closed).
 */
@Component({
  selector: 'app-dialog',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-canvas text-ink shadow-2xl shadow-slate-950/30 ring-1 ring-slate-900/5 backdrop:bg-slate-950/60 backdrop:backdrop-blur-[2px] open:animate-fade-up motion-reduce:open:animate-none"
      [attr.aria-labelledby]="headingId"
      (close)="closed.emit()"
      (click)="onClick($event)"
    >
      @if (open()) {
        <!-- Initial focus lands on the content (announces the heading) instead of showing a focus ring on the close button. -->
        <div class="p-5 outline-none sm:p-7" tabindex="-1" autofocus>
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 [id]="headingId" class="text-lg font-bold tracking-tight text-ink sm:text-xl">{{ heading() }}</h2>
              @if (subheading()) {
                <p class="mt-1 text-sm text-muted">{{ subheading() }}</p>
              }
            </div>
            <button
              type="button"
              class="-mt-1.5 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
              (click)="dialog.close()"
            >
              <ng-icon name="phosphorX" size="20" />
              <span class="sr-only">Dialog schließen</span>
            </button>
          </div>
          <div class="mt-5">
            <ng-content />
          </div>
        </div>
      }
    </dialog>
  `,
})
export class Dialog {
  readonly open = input(false);
  readonly heading = input.required<string>();
  readonly subheading = input('');
  readonly closed = output();

  protected readonly headingId = `dialog-heading-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // After render, so the projected content exists when showModal() moves focus into it.
    afterRenderEffect(() => {
      const element = this.dialog().nativeElement;
      if (this.open() && !element.open) element.showModal();
      if (!this.open() && element.open) element.close();
    });
  }

  /** A click on the dialog element itself (not its content) hit the backdrop. */
  protected onClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.dialog().nativeElement.close();
  }
}
