import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { APPLICATION_STEPS, JOBS } from '../../content/careers';
import { COMPANY } from '../../content/site';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';
import { ApplicationService } from './application.service';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const SPONTANEOUS = 'initiativ';
const MAX_FILES = 3;
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

@Component({
  selector: 'app-application',
  imports: [PageHero, ReactiveFormsModule, RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './application.html',
})
export class Application {
  private readonly applicationService = inject(ApplicationService);

  /** Bound from the query parameter ?stelle=… (job id or "initiativ"). */
  readonly stelle = input<string>();

  protected readonly company = COMPANY;
  protected readonly jobs = JOBS;
  protected readonly steps = APPLICATION_STEPS;
  protected readonly spontaneous = SPONTANEOUS;
  protected readonly maxFiles = MAX_FILES;

  protected readonly state = signal<SubmitState>('idle');
  protected readonly documents = signal<File[]>([]);
  protected readonly fileError = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    position: [SPONTANEOUS, Validators.required],
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.maxLength(40)],
    availableFrom: ['', Validators.maxLength(60)],
    profileUrl: ['', Validators.maxLength(200)],
    message: ['', Validators.maxLength(4000)],
    privacy: [false, Validators.requiredTrue],
  });

  /** Headline of the selected position, used in the intro and the success message. */
  protected readonly positionLabel = computed(() => {
    const value = this.form.controls.position.value;
    return JOBS.find((job) => job.id === value)?.title ?? 'Initiativbewerbung';
  });

  constructor() {
    effect(() => {
      const requested = this.stelle();
      if (requested && (requested === SPONTANEOUS || JOBS.some((job) => job.id === requested))) {
        this.form.controls.position.setValue(requested);
      }
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

  protected addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const picked = Array.from(input.files ?? []);
    input.value = '';
    if (!picked.length) return;

    const rejected = picked.find((file) => !ALLOWED.includes(file.type) || file.size > MAX_SIZE);
    if (rejected) {
      this.fileError.set(
        !ALLOWED.includes(rejected.type)
          ? `"${rejected.name}" ist kein PDF- oder Word-Dokument.`
          : `"${rejected.name}" ist größer als 10 MB.`,
      );
      return;
    }

    const combined = [...this.documents(), ...picked].slice(0, MAX_FILES);
    this.fileError.set(
      this.documents().length + picked.length > MAX_FILES ? `Maximal ${MAX_FILES} Dateien, weitere wurden ignoriert.` : '',
    );
    this.documents.set(combined);
  }

  protected removeFile(index: number): void {
    this.documents.update((files) => files.filter((_, i) => i !== index));
    this.fileError.set('');
  }

  protected fileSize(file: File): string {
    const kb = file.size / 1024;
    return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} kB`;
  }

  protected async submit(): Promise<void> {
    if (this.state() === 'submitting') return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    this.state.set('submitting');
    const { privacy: _privacy, position, ...rest } = this.form.getRawValue();
    try {
      await this.applicationService.send({
        ...rest,
        position: this.positionLabel(),
        documents: this.documents(),
      });
      this.state.set('success');
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
      ['position', 'a-position'],
      ['firstName', 'a-first'],
      ['lastName', 'a-last'],
      ['email', 'a-email'],
      ['phone', 'a-phone'],
      ['availableFrom', 'a-start'],
      ['profileUrl', 'a-profile'],
      ['message', 'a-message'],
      ['privacy', 'a-privacy'],
    ];
    const first = fields.find(([name]) => this.form.controls[name].invalid);
    if (first) document.getElementById(first[1])?.focus();
  }

  protected startOver(): void {
    this.form.reset({ position: SPONTANEOUS });
    this.documents.set([]);
    this.fileError.set('');
    this.state.set('idle');
  }
}
