import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { VAT_RATE } from '../../content/company';
import { PortalStore } from '../../data/portal-store';
import { OFFER_STATUS } from '../../data/status';
import { Dialog } from '../../shared/dialog';
import { euroCents } from '../../shared/format';
import { SignaturePad } from '../../shared/signature-pad';
import { StatusBadge } from '../../shared/status-badge';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-offer-detail',
  imports: [NgIcon, RouterLink, StatusBadge, Dialog, SignaturePad],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  templateUrl: './offer-detail.html',
})
export class OfferDetail {
  protected readonly store = inject(PortalStore);
  private readonly toasts = inject(ToastService);

  /** Route parameter :offerId */
  readonly offerId = input.required<string>();

  protected readonly status = OFFER_STATUS;
  protected readonly euroCents = euroCents;
  protected readonly vatRate = VAT_RATE;

  protected readonly offer = computed(() => this.store.offers().find((offer) => offer.id === this.offerId()));

  // Signing
  protected readonly signing = signal(false);
  protected readonly hasSignature = signal(false);
  protected readonly accepted = signal(false);
  protected readonly canConfirm = computed(() => this.hasSignature() && this.accepted());
  private readonly pad = viewChild(SignaturePad);

  // Declining
  protected readonly declining = signal(false);
  protected readonly declineReason = signal('');

  protected readonly pdfBusy = signal(false);

  protected openSigning(): void {
    this.hasSignature.set(false);
    this.accepted.set(false);
    this.signing.set(true);
  }

  protected confirmSigning(): void {
    const offer = this.offer();
    const pad = this.pad();
    if (!offer || !pad || !this.canConfirm()) return;
    this.store.signOffer(offer.id, pad.toDataUrl());
    this.signing.set(false);
    this.toasts.show(`Angebot ${offer.id} wurde erfolgreich unterzeichnet.`);
  }

  protected openDeclining(): void {
    this.declineReason.set('');
    this.declining.set(true);
  }

  protected confirmDeclining(): void {
    const offer = this.offer();
    if (!offer) return;
    this.store.declineOffer(offer.id, this.declineReason());
    this.declining.set(false);
    this.toasts.show(`Angebot ${offer.id} wurde abgelehnt. Danke für Ihre Rückmeldung.`, 'phosphorInfo');
  }

  protected async downloadPdf(): Promise<void> {
    const offer = this.offer();
    if (!offer) return;
    this.pdfBusy.set(true);
    try {
      const { createOfferPdf } = await import('./offer-pdf');
      createOfferPdf(offer, this.store.billing());
      this.toasts.show(`${offer.id} wurde heruntergeladen.`, 'phosphorDownloadSimple');
    } catch {
      this.toasts.show('Die PDF konnte nicht erstellt werden. Bitte erneut versuchen.', 'phosphorWarningCircle');
    } finally {
      this.pdfBusy.set(false);
    }
  }
}
