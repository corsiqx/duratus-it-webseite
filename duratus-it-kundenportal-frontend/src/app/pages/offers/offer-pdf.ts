import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VAT_RATE } from '../../content/company';
import { BillingInfo, Offer } from '../../data/models';
import { OFFER_STATUS } from '../../data/status';
import { euroCents } from '../../shared/format';
import {
  PDF,
  drawAddressCard,
  drawFooter,
  drawHighlight,
  drawLetterhead,
  drawTitle,
  lastTableY,
  metaRow,
} from '../../shared/pdf-brand';

/**
 * Offer as PDF: positions, totals, conditions and, once accepted, the drawn signature.
 * Loaded on demand so jsPDF stays out of the initial bundle.
 */
export function createOfferPdf(offer: Offer, billing: BillingInfo): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { margin, pageW } = PDF;

  drawLetterhead(doc);
  drawTitle(doc, 'Angebot', offer.title);
  drawAddressCard(doc, 'Angebot für', [billing.company, billing.street, billing.zipCity]);

  metaRow(doc, margin, 76, 'Angebotsnummer', offer.id);
  metaRow(doc, margin + 40, 76, 'Datum', offer.created);
  metaRow(doc, margin + 74, 76, 'Gültig bis', offer.validUntil);

  autoTable(doc, {
    startY: 90,
    head: [['Leistung', 'Betrag (netto)']],
    body: [
      ...offer.positions.map((position) => [`${position.name}\n${position.detail}`, euroCents(position.amount)]),
      ...(offer.oneTime > 0 ? [['Einrichtung und Übergabe\neinmalig', euroCents(offer.oneTime)]] : []),
    ],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 3.2, right: 3, bottom: 3.2, left: 3 }, textColor: PDF.ink },
    headStyles: {
      fillColor: PDF.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 2.6, right: 3, bottom: 2.6, left: 3 },
    },
    bodyStyles: { lineWidth: { bottom: 0.1 }, lineColor: PDF.line, minCellHeight: 12 },
    columnStyles: { 0: { cellWidth: 138 }, 1: { halign: 'right', cellWidth: 40 } },
    margin: { left: margin, right: margin },
    didParseCell: (hook) => {
      if (hook.section === 'head' && hook.column.index === 1) hook.cell.styles.halign = 'right';
    },
    willDrawCell: (hook) => {
      if (hook.section !== 'body' || hook.column.index !== 0 || !Array.isArray(hook.cell.text) || hook.cell.text.length < 2) return;
      // Title bold, detail muted: two visual levels in one cell.
      const [title, ...rest] = hook.cell.text;
      hook.cell.text = [];
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...PDF.ink);
      doc.text(title, hook.cell.x + 3, hook.cell.y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...PDF.muted);
      doc.text(rest.join(' '), hook.cell.x + 3, hook.cell.y + 10.4);
    },
  });

  const boxX = 110;
  let y = lastTableY(doc, 140) + 10;
  drawHighlight(doc, boxX, y - 1.5, pageW - margin - boxX, 'Monatlich netto', euroCents(offer.amount));
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF.muted);
  doc.text(`zzgl. ${Math.round(VAT_RATE * 100)} % MwSt.`, boxX, y);
  doc.text(euroCents(offer.amount * VAT_RATE), pageW - margin, y, { align: 'right' });
  if (offer.oneTime > 0) {
    y += 5.6;
    doc.text('Einmalig (netto)', boxX, y);
    doc.text(euroCents(offer.oneTime), pageW - margin, y, { align: 'right' });
  }

  // Conditions on the left.
  let left = lastTableY(doc, 140) + 10;
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.muted);
  doc.text('LAUFZEIT', margin, left, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF.ink);
  const term = doc.splitTextToSize(offer.termNote, boxX - margin - 10) as string[];
  doc.text(term, margin, left + 5);
  left += 8 + term.length * 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.muted);
  doc.text('STATUS', margin, left, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF.ink);
  doc.text(OFFER_STATUS[offer.status].label, margin, left + 5);

  // Acceptance block.
  y = Math.max(y, left) + 16;
  if (offer.status === 'angenommen') {
    doc.setDrawColor(...PDF.line);
    doc.setFillColor(...PDF.surface);
    doc.roundedRect(margin, y, pageW - 2 * margin, 42, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF.muted);
    doc.text('ANGENOMMEN', margin + 6, y + 8, { charSpace: 0.3 });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...PDF.ink);
    doc.text(`${offer.signedBy ?? billing.company}, ${billing.company}`, margin + 6, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF.muted);
    doc.text(`Digital unterzeichnet am ${offer.signedAt} im Duratus IT Kundenportal.`, margin + 6, y + 21);
    if (offer.signature) {
      doc.addImage(offer.signature, 'PNG', pageW - margin - 70, y + 4, 64, 26, undefined, 'FAST');
    }
    doc.setDrawColor(...PDF.muted);
    doc.setLineWidth(0.2);
    doc.line(pageW - margin - 70, y + 32, pageW - margin - 6, y + 32);
    doc.setFontSize(7.5);
    doc.text('Unterschrift', pageW - margin - 70, y + 36.5);
  } else if (offer.status === 'abgelehnt') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF.muted);
    doc.text(`Abgelehnt am ${offer.declinedAt}${offer.declineReason ? `: ${offer.declineReason}` : '.'}`, margin, y, {
      maxWidth: pageW - 2 * margin,
    });
  }

  drawFooter(doc, `Freibleibendes Angebot, gültig bis ${offer.validUntil}. Alle Preise zzgl. der gesetzlichen Mehrwertsteuer.`);
  doc.save(`${offer.id}.pdf`);
}
