import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

let nextId = 0;

/**
 * Quantity field with minus and plus. Both buttons keep the 44 px touch target;
 * the number stays typable so a rollout of 60 pieces does not need 60 clicks.
 */
@Component({
  selector: 'app-quantity-stepper',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  template: `
    <div class="inline-flex items-center rounded-full bg-canvas ring-1 ring-line">
      <button
        type="button"
        class="flex size-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-canvas-alt hover:text-ink focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-slate-300"
        [disabled]="value() <= min()"
        (click)="step(-1)"
      >
        <ng-icon name="phosphorMinus" size="16" />
        <span class="sr-only">Menge verringern</span>
      </button>
      <label [for]="id" class="sr-only">{{ label() }}</label>
      <input
        [id]="id"
        type="number"
        inputmode="numeric"
        class="w-12 border-0 bg-transparent py-2 text-center text-sm font-semibold text-ink tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        [min]="min()"
        [max]="max()"
        [value]="value()"
        (input)="onInput($event)"
      />
      <button
        type="button"
        class="flex size-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-canvas-alt hover:text-ink focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-slate-300"
        [disabled]="value() >= max()"
        (click)="step(1)"
      >
        <ng-icon name="phosphorPlus" size="16" />
        <span class="sr-only">Menge erhöhen</span>
      </button>
    </div>
    @if (hint()) {
      <p class="mt-1.5 text-xs text-primary">{{ hint() }}</p>
    }
  `,
})
export class QuantityStepper {
  readonly value = model.required<number>();
  readonly min = input(1);
  readonly max = input(999);
  readonly label = input('Menge');
  /** Optional line under the field, e.g. the next volume tier. */
  readonly hint = input('');

  protected readonly id = `qty-${nextId++}`;
  protected readonly clamped = computed(() => this.value());

  protected step(delta: number): void {
    this.value.set(Math.min(this.max(), Math.max(this.min(), this.value() + delta)));
  }

  protected onInput(event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(raw)) return;
    this.value.set(Math.min(this.max(), Math.max(this.min(), Math.round(raw))));
  }
}
