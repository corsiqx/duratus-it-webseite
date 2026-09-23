import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { KbStore } from '../data/kb-store';

let nextId = 0;

/** Filters a list down to one customer. "alle" keeps everything. */
@Component({
  selector: 'app-customer-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <label class="flex items-center gap-2">
      <span class="text-sm font-medium whitespace-nowrap text-muted">Kunde</span>
      <select
        [id]="id"
        class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-canvas px-3 text-base text-ink transition outline-none hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-56 sm:text-sm"
        [value]="value()"
        (change)="value.set($any($event.target).value)"
      >
        <option value="alle">Alle Kunden</option>
        @for (customer of store.customers(); track customer.id) {
          <option [value]="customer.id">{{ customer.name }}</option>
        }
      </select>
    </label>
  `,
})
export class CustomerFilter {
  protected readonly store = inject(KbStore);
  protected readonly id = `customer-filter-${nextId++}`;
  readonly value = model<string>('alle');
}
