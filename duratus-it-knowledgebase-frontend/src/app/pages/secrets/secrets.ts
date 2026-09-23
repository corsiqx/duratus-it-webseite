import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { KbStore } from '../../data/kb-store';
import { Secret } from '../../data/models';
import { daysUntilRotation, suggestPassword } from '../../data/secret-rules';
import { SECRET_CATEGORY } from '../../data/status';
import { CustomerFilter } from '../../shared/customer-filter';
import { EmptyState } from '../../shared/empty-state';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';
import { RotateDialog } from '../../shared/rotate-dialog';
import { SecretCard } from '../../shared/secret-card';

type Filter = 'alle' | 'faellig' | 'hochprivilegiert' | 'ohne-mfa';

@Component({
  selector: 'app-secrets',
  imports: [RouterLink, NgIcon, SecretCard, RotateDialog, FilterTabs, CustomerFilter, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="text-sm text-muted sm:text-base">
      Alle Zugänge, die Duratus IT für Kunden verwahrt. Verdeckt, protokolliert und mit Frist für den nächsten Wechsel.
    </p>

    <!-- Sicherheitshinweis: dieser Prototyp ist kein Tresor. -->
    <div class="mt-4 flex items-start gap-3 rounded-2xl bg-night p-4 text-sm text-slate-300 sm:p-5">
      <ng-icon name="phosphorLockKey" size="22" class="mt-0.5 shrink-0 text-teal-300" />
      <div>
        <p class="font-semibold text-white">Prototyp, noch kein echter Tresor</p>
        <p class="mt-1 leading-relaxed">
          Die Passwörter hier sind erfunden und liegen unverschlüsselt im Browser. Vor dem Echtbetrieb gehören sie in einen
          Tresor mit Serverteil: verschlüsselt gespeichert, nur auf Anfrage ausgeliefert, Rollen serverseitig geprüft.
          Was schon stimmt: verdeckte Anzeige, Zeitlimit, Vier-Augen-Stufe und
          <a routerLink="/protokoll" class="font-semibold text-teal-300 underline">Protokoll</a>.
        </p>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
      <app-filter-tabs label="Zugänge filtern" [options]="filterOptions()" [(value)]="filter" />
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <app-customer-filter [(value)]="customerId" />
        <label class="relative block sm:w-64">
          <span class="sr-only">Zugänge durchsuchen</span>
          <ng-icon name="phosphorMagnifyingGlass" size="18" class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="System oder Benutzer"
            class="min-h-11 w-full rounded-full border border-slate-300 bg-canvas py-2 pr-4 pl-10 text-base text-ink transition outline-none placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:text-sm"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
        </label>
      </div>
    </div>

    @if (visible().length === 0) {
      <div class="mt-5">
        <app-empty-state icon="phosphorKey" title="Kein Zugang gefunden" hint="Filter zurücksetzen oder anders suchen." />
      </div>
    } @else {
      <ul class="mt-5 grid gap-4 xl:grid-cols-2" aria-live="polite">
        @for (secret of visible(); track secret.id) {
          <li class="min-w-0"><app-secret-card [secret]="secret" (rotate)="openRotate($event)" /></li>
        }
      </ul>
    }

    <app-rotate-dialog [secret]="rotating()" [initial]="suggestion()" (saved)="save($event)" (closed)="rotating.set(null)" />
  `,
})
export class Secrets {
  private readonly store = inject(KbStore);
  protected readonly category = SECRET_CATEGORY;

  protected readonly filter = signal<Filter>('alle');
  protected readonly customerId = signal('alle');
  protected readonly query = signal('');
  protected readonly rotating = signal<Secret | null>(null);
  protected readonly suggestion = signal('');

  /** Filter first by customer, then by state; the counters show what each filter would leave. */
  private readonly byCustomer = computed(() =>
    this.customerId() === 'alle'
      ? this.store.secrets()
      : this.store.secrets().filter((secret) => secret.customerId === this.customerId()),
  );

  protected readonly filterOptions = computed<readonly FilterOption<Filter>[]>(() => {
    const secrets = this.byCustomer();
    return [
      { value: 'alle', label: 'Alle', count: secrets.length },
      { value: 'faellig', label: 'Wechsel fällig', count: secrets.filter((secret) => daysUntilRotation(secret) <= 0).length },
      { value: 'hochprivilegiert', label: 'Hochprivilegiert', count: secrets.filter((secret) => secret.scope !== 'team').length },
      { value: 'ohne-mfa', label: 'Ohne zweiten Faktor', count: secrets.filter((secret) => !secret.mfa).length },
    ];
  });

  protected readonly visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    return this.byCustomer()
      .filter((secret) => {
        if (this.filter() === 'faellig') return daysUntilRotation(secret) <= 0;
        if (this.filter() === 'hochprivilegiert') return secret.scope !== 'team';
        if (this.filter() === 'ohne-mfa') return !secret.mfa;
        return true;
      })
      .filter(
        (secret) =>
          !needle ||
          [secret.name, secret.username, secret.url ?? '', ...secret.tags].join(' ').toLowerCase().includes(needle),
      )
      .sort((a, b) => daysUntilRotation(a) - daysUntilRotation(b));
  });

  protected openRotate(secret: Secret): void {
    this.suggestion.set(suggestPassword());
    this.rotating.set(secret);
  }

  protected save(password: string): void {
    const secret = this.rotating();
    if (secret) this.store.rotateSecret(secret, password);
    this.rotating.set(null);
  }
}
