import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CONTACT_PEOPLE } from '../../content/company';
import { COMPANY, CONTACT_CTA } from '../../content/site';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';
import { ContactService } from './contact.service';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/** Topic keys accepted via ?thema=… so other pages can preselect the subject. */
const TOPICS: Record<string, string> = {
  produkte: 'Produkte und Hardware',
  'managed-services': 'Managed Services',
  consulting: 'IT Consulting und Strategie',
  security: 'IT-Security',
  allgemein: 'Allgemeine Beratung',
};

@Component({
  selector: 'app-contact',
  imports: [PageHero, ReactiveFormsModule, RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
})
export class Contact {
  private readonly contactService = inject(ContactService);

  /** Bound from the query parameter ?thema=… (withComponentInputBinding). */
  readonly thema = input<string>();

  protected readonly company = COMPANY;
  protected readonly people = CONTACT_PEOPLE;
  protected readonly cta = CONTACT_CTA;
  protected readonly topics = Object.values(TOPICS);
  protected readonly state = signal<SubmitState>('idle');

  protected readonly form = inject(NonNullableFormBuilder).group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    company: ['', [Validators.maxLength(160)]],
    topic: [TOPICS['allgemein'], Validators.required],
    message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(4000)]],
    privacy: [false, Validators.requiredTrue],
  });

  constructor() {
    effect(() => {
      const topic = TOPICS[this.thema() ?? ''];
      if (topic) this.form.controls.topic.setValue(topic);
    });
  }

  protected showError(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected fieldClass(control: keyof typeof this.form.controls): string {
    return this.showError(control)
      ? 'border-red-500 focus:border-red-600 focus:ring-red-600/15'
      : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/15';
  }

  protected async submit(): Promise<void> {
    if (this.state() === 'submitting') return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    this.state.set('submitting');
    const { privacy: _privacy, ...request } = this.form.getRawValue();
    try {
      await this.contactService.send(request);
      this.state.set('success');
      this.form.reset({ topic: TOPICS['allgemein'] });
    } catch {
      this.state.set('error');
    }
  }

  /**
   * Moves focus to the first invalid field. Uses the known field order instead of querying
   * [aria-invalid], which is not rendered yet at this point.
   */
  private focusFirstInvalid(): void {
    const fields: [keyof typeof this.form.controls, string][] = [
      ['firstName', 'c-first'],
      ['lastName', 'c-last'],
      ['email', 'c-email'],
      ['company', 'c-company'],
      ['topic', 'c-topic'],
      ['message', 'c-message'],
      ['privacy', 'c-privacy'],
    ];
    const first = fields.find(([name]) => this.form.controls[name].invalid);
    if (first) document.getElementById(first[1])?.focus();
  }

  protected startOver(): void {
    this.state.set('idle');
  }
}
