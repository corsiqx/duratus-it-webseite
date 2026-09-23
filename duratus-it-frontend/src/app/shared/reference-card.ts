import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ReferenceCase } from '../content/references';

@Component({
  selector: 'app-reference-card',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    <article class="flex h-full flex-col rounded-2xl border border-line bg-canvas p-5 shadow-sm shadow-slate-900/5 sm:p-8">
      <div class="flex items-start justify-between gap-4">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <ng-icon [name]="case().icon" size="24" />
        </span>
        <span class="rounded-full bg-canvas-alt px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line">{{ case().service }}</span>
      </div>
      <h3 class="mt-5 text-xl font-bold tracking-tight text-ink">{{ case().title }}</h3>
      <p class="mt-1 text-sm text-muted">{{ case().meta }}</p>

      <dl class="mt-6 flex flex-1 flex-col gap-4 text-[15px] leading-relaxed">
        <div>
          <dt class="font-semibold text-ink">Ausgangslage</dt>
          <dd class="mt-1 text-muted">{{ case().situation }}</dd>
        </div>
        <div>
          <dt class="font-semibold text-ink">Lösung</dt>
          <dd class="mt-1 text-muted">{{ case().solution }}</dd>
        </div>
        <div class="mt-auto flex gap-3 rounded-xl bg-primary-soft p-4">
          <dt class="sr-only">Ergebnis</dt>
          <ng-icon name="phosphorCheckCircle" size="20" class="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <dd class="font-medium text-blue-950">{{ case().result }}</dd>
        </div>
      </dl>
    </article>
  `,
})
export class ReferenceCard {
  readonly case = input.required<ReferenceCase>();
}
