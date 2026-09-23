import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ToastService } from './toast.service';

/**
 * Copies a value to the clipboard and confirms it in place. Falls back to a hidden textarea when the
 * Clipboard API is unavailable (older browsers, or a page that is not served over https).
 */
@Component({
  selector: 'app-copy-button',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <button
      type="button"
      class="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      [class]="done() ? 'text-teal-700' : 'text-slate-600 hover:bg-canvas-alt hover:text-ink'"
      (click)="copy()"
    >
      <ng-icon [name]="done() ? 'phosphorCheck' : 'phosphorCopy'" size="17" />
      <span [class.sr-only]="!withLabel()">{{ done() ? 'Kopiert' : label() }}</span>
    </button>
  `,
})
export class CopyButton {
  private readonly toasts = inject(ToastService);

  readonly value = input.required<string>();
  readonly label = input('Kopieren');
  readonly withLabel = input(true);
  /** Message shown in the toast; empty means no toast (used for values that are copied often). */
  readonly toast = input('');
  readonly copied = output<void>();

  protected readonly done = signal(false);

  protected async copy(): Promise<void> {
    const value = this.value();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      this.done.set(true);
      setTimeout(() => this.done.set(false), 2000);
      if (this.toast()) this.toasts.show(this.toast(), 'phosphorCopy');
      this.copied.emit();
    } catch {
      this.toasts.show('Kopieren hat nicht geklappt. Bitte den Wert von Hand markieren.', 'phosphorWarningCircle');
    }
  }
}
