import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { PortalStore } from '../../data/portal-store';
import { decimalDe } from '../../shared/format';

@Component({
  selector: 'app-work-logs',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      {{ store.workLogs().length }} Einträge ·
      <span class="font-semibold text-ink tabular-nums">{{ decimalDe(totalHours) }} Std.</span> manuelle Arbeitszeit im aktuellen Monat
    </p>

    <!-- Desktop table -->
    <div class="mt-5 hidden overflow-hidden rounded-2xl bg-canvas ring-1 ring-line md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-line bg-canvas-alt text-xs font-semibold text-muted">
          <tr>
            <th scope="col" class="px-5 py-3">Datum</th>
            <th scope="col" class="px-5 py-3">Techniker</th>
            <th scope="col" class="px-5 py-3">Tätigkeit</th>
            <th scope="col" class="px-5 py-3 text-right">Dauer</th>
            <th scope="col" class="px-5 py-3">Referenz</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          @for (log of store.workLogs(); track $index) {
            <tr class="transition-colors hover:bg-canvas-alt/60">
              <td class="px-5 py-4 whitespace-nowrap text-muted tabular-nums">{{ log.date }}</td>
              <td class="px-5 py-4 whitespace-nowrap text-ink">
                <span class="inline-flex items-center gap-2">
                  @if (log.hours === null) {
                    <ng-icon name="phosphorRobot" size="16" class="text-primary" />
                  }
                  {{ log.technician }}
                </span>
              </td>
              <td class="px-5 py-4 text-ink">{{ log.description }}</td>
              <td class="px-5 py-4 text-right font-semibold whitespace-nowrap tabular-nums" [class]="log.hours === null ? 'text-muted' : 'text-ink'">
                {{ log.hours === null ? 'automatisiert' : decimalDe(log.hours) + ' Std.' }}
              </td>
              <td class="px-5 py-4 whitespace-nowrap text-muted tabular-nums">{{ log.ticketId ?? 'ohne Ticket' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Phone list -->
    <ul class="mt-5 flex flex-col gap-3 md:hidden">
      @for (log of store.workLogs(); track $index) {
        <li class="rounded-2xl bg-canvas p-4 ring-1 ring-line">
          <div class="flex items-center justify-between gap-3 text-xs text-muted tabular-nums">
            <span>{{ log.date }}</span>
            <span>{{ log.ticketId ?? 'ohne Ticket' }}</span>
          </div>
          <p class="mt-2 text-sm font-semibold text-ink">{{ log.description }}</p>
          <div class="mt-3 flex items-center justify-between gap-3 text-sm">
            <span class="inline-flex items-center gap-2 text-muted">
              @if (log.hours === null) {
                <ng-icon name="phosphorRobot" size="16" class="text-primary" />
              }
              {{ log.technician }}
            </span>
            <span class="font-semibold whitespace-nowrap tabular-nums" [class]="log.hours === null ? 'text-muted' : 'text-ink'">
              {{ log.hours === null ? 'automatisiert' : decimalDe(log.hours) + ' Std.' }}
            </span>
          </div>
        </li>
      }
    </ul>
  `,
})
export class WorkLogs {
  protected readonly store = inject(PortalStore);
  protected readonly decimalDe = decimalDe;
  protected readonly totalHours = this.store.workLogs().reduce((sum, log) => sum + (log.hours ?? 0), 0);
}
