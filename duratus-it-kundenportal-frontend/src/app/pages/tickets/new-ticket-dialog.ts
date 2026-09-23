import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Ticket, TicketCategory, TicketPriority } from '../../data/models';
import { PortalStore } from '../../data/portal-store';
import { TICKET_CATEGORY, TICKET_PRIORITY } from '../../data/status';
import { Dialog } from '../../shared/dialog';

export interface TicketPrefill {
  subject?: string;
  category?: TicketCategory;
  description?: string;
}

/** "Neues Ticket" dialog, reusable with prefilled values (e.g. questions about an offer or invoice). */
@Component({
  selector: 'app-new-ticket-dialog',
  imports: [NgIcon, Dialog, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog
      [open]="open()"
      heading="Neues Ticket erstellen"
      subheading="Unser Service-Team meldet sich so schnell wie möglich. Pflichtfelder sind mit * gekennzeichnet."
      (closed)="closed.emit()"
    >
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label for="t-subject" class="text-sm font-semibold text-ink">Betreff *</label>
          <input #subjectInput id="t-subject" type="text" formControlName="subject" placeholder="Kurze Beschreibung des Anliegens" maxlength="120"
            class="min-h-12 rounded-lg border bg-canvas px-4 py-3 text-base text-ink transition outline-none placeholder:text-slate-400 focus:ring-4"
            [class]="fieldClass('subject')" [attr.aria-invalid]="showError('subject')" aria-describedby="t-subject-error" />
          @if (showError('subject')) {
            <p id="t-subject-error" class="text-sm font-medium text-red-600">Bitte geben Sie einen Betreff an.</p>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="t-category" class="text-sm font-semibold text-ink">Kategorie</label>
          <select id="t-category" formControlName="category"
            class="min-h-12 rounded-lg border border-slate-300 bg-canvas px-4 py-3 text-base text-ink transition outline-none hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15">
            @for (option of categories; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </div>

        <fieldset>
          <legend class="text-sm font-semibold text-ink">Priorität</legend>
          <div class="mt-2 grid grid-cols-3 gap-2">
            @for (option of priorities; track option) {
              <label
                class="relative flex min-h-11 cursor-pointer items-center justify-center rounded-lg border-2 border-line px-2 text-sm font-medium text-muted transition-colors hover:border-slate-300 has-checked:border-primary has-checked:bg-primary-soft has-checked:text-primary-hover has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
              >
                <input type="radio" formControlName="priority" [value]="option" class="sr-only" />
                {{ priorityLabel[option].label }}
              </label>
            }
          </div>
          <p class="mt-2 text-xs text-muted">Hoch = Arbeiten ist für mehrere Personen nicht oder kaum möglich.</p>
        </fieldset>

        <div class="flex flex-col gap-2">
          <label for="t-description" class="text-sm font-semibold text-ink">Beschreibung *</label>
          <textarea #descriptionInput id="t-description" rows="4" formControlName="description" placeholder="Was ist das Problem? Seit wann tritt es auf? Wer ist betroffen?"
            class="resize-y rounded-lg border bg-canvas px-4 py-3 text-base text-ink transition outline-none placeholder:text-slate-400 focus:ring-4"
            [class]="fieldClass('description')" [attr.aria-invalid]="showError('description')" aria-describedby="t-description-error"></textarea>
          @if (showError('description')) {
            <p id="t-description-error" class="text-sm font-medium text-red-600">Bitte beschreiben Sie Ihr Anliegen.</p>
          }
        </div>

        <div class="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" (click)="closed.emit()"
            class="inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-slate-300 transition hover:bg-canvas-alt hover:ring-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]">
            Abbrechen
          </button>
          <button type="submit"
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]">
            <ng-icon name="phosphorPaperPlaneRight" size="18" />
            Ticket senden
          </button>
        </div>
      </form>
    </app-dialog>
  `,
})
export class NewTicketDialog {
  private readonly store = inject(PortalStore);

  readonly open = input(false);
  readonly prefill = input<TicketPrefill | null>(null);
  readonly closed = output();
  readonly created = output<Ticket>();

  protected readonly priorityLabel = TICKET_PRIORITY;
  protected readonly priorities: TicketPriority[] = ['niedrig', 'normal', 'hoch'];
  protected readonly categories = (Object.keys(TICKET_CATEGORY) as TicketCategory[]).map((value) => ({
    value,
    label: TICKET_CATEGORY[value].label,
  }));
  protected readonly submitted = signal(false);

  private readonly subjectInput = viewChild<ElementRef<HTMLInputElement>>('subjectInput');
  private readonly descriptionInput = viewChild<ElementRef<HTMLTextAreaElement>>('descriptionInput');

  protected readonly form = inject(NonNullableFormBuilder).group({
    subject: ['', [Validators.required, Validators.maxLength(120)]],
    category: ['sonstiges' as TicketCategory],
    priority: ['normal' as TicketPriority],
    description: ['', Validators.required],
  });

  constructor() {
    // Every opening starts from a clean form with the prefill applied.
    effect(() => {
      if (!this.open()) return;
      const prefill = this.prefill();
      untracked(() => {
        this.submitted.set(false);
        this.form.reset({
          subject: prefill?.subject ?? '',
          category: prefill?.category ?? 'sonstiges',
          priority: 'normal',
          description: prefill?.description ?? '',
        });
      });
    });
  }

  protected showError(field: 'subject' | 'description'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (this.submitted() || control.touched);
  }

  protected fieldClass(field: 'subject' | 'description'): string {
    return this.showError(field)
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/15';
  }

  protected submit(): void {
    this.submitted.set(true);
    for (const field of ['subject', 'description'] as const) {
      const control = this.form.controls[field];
      if (!control.value.trim()) control.setValue('');
    }
    if (this.form.invalid) {
      // Fixed field order: focus the first invalid field.
      (this.form.controls.subject.invalid ? this.subjectInput() : this.descriptionInput())?.nativeElement.focus();
      return;
    }
    const { subject, description, priority, category } = this.form.getRawValue();
    this.created.emit(this.store.createTicket({ subject: subject.trim(), description: description.trim(), priority, category }));
  }
}
