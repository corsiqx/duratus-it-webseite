import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VAT_RATE } from '../../content/company';
import { BillingInfo, Invoice } from '../../data/models';
import { INVOICE_STATUS } from '../../data/status';
import { euroCents } from '../../shared/format';
import {
  PDF,
  Rgb,
  drawAddressCard,
  drawFooter,
  drawHighlight,
  drawLetterhead,
  drawTitle,
  lastTableY,
  metaRow,
} from '../../shared/pdf-brand';

const STATUS_COLOR: Record<Invoice['status'], Rgb> = {
  bezahlt: [15, 118, 110],
  offen: [37, 99, 235],
  ueberfaellig: [185, 28, 28],
};

/**
 * Builds the invoice PDF in the brand layout and triggers the download.
 * Invoice amounts are gross; net and VAT are derived. Loaded on demand so jsPDF stays out of the initial bundle.
 */
export function createInvoicePdf(invoice: Invoice, billing: BillingInfo): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { margin, pageW } = PDF;

  drawLetterhead(doc);
  drawTitle(doc, 'Rechnung', invoice.description);
  drawAddressCard(doc, 'Rechnungsempfänger', [billing.company, billing.street, billing.zipCity]);

  metaRow(doc, margin, 70, 'Rechnungsnummer', invoice.id);
  metaRow(doc, margin + 40, 70, 'Rechnungsdatum', invoice.date);
  metaRow(doc, margin + 74, 70, 'Zahlungsziel', '14 Tage netto');

  const net = invoice.amount / (1 + VAT_RATE);
  const vat = invoice.amount - net;

  autoTable(doc, {
    startY: 86,
    head: [['Position', 'Menge', 'Einzelpreis (netto)', 'Gesamt (netto)']],
    body: [[invoice.description, '1', euroCents(net), euroCents(net)]],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 3.2, right: 3, bottom: 3.2, left: 3 }, textColor: PDF.ink },
    headStyles: {
      fillColor: PDF.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 2.6, right: 3, bottom: 2.6, left: 3 },
    },
    bodyStyles: { lineWidth: { bottom: 0.1 }, lineColor: PDF.line },
    columnStyles: {
      0: { cellWidth: 86 },
      1: { halign: 'right', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 36 },
      3: { halign: 'right', cellWidth: 36 },
    },
    margin: { left: margin, right: margin },
    didParseCell: (hook) => {
      if (hook.section === 'head' && hook.column.index > 0) hook.cell.styles.halign = 'right';
    },
  });

  const afterTable = lastTableY(doc, 110);
  const boxX = 110;
  let y = afterTable + 10;

  const totalRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF.muted);
    doc.text(label, boxX, y);
    doc.text(value, pageW - margin, y, { align: 'right' });
    y += 5.6;
  };

  totalRow('Zwischensumme (netto)', euroCents(net));
  totalRow(`zzgl. ${Math.round(VAT_RATE * 100)} % MwSt.`, euroCents(vat));
  drawHighlight(doc, boxX, y - 1.5, pageW - margin - boxX, 'Gesamtbetrag (brutto)', euroCents(invoice.amount));

  // Status on the left, level with the totals.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.muted);
  doc.text('STATUS', margin, afterTable + 10, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...STATUS_COLOR[invoice.status]);
  doc.text(INVOICE_STATUS[invoice.status].label, margin, afterTable + 16);

  if (invoice.status !== 'bezahlt') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF.muted);
    const payment =
      billing.paymentMethod === 'sepa'
        ? 'Der Betrag wird per SEPA-Lastschrift von Ihrem Konto eingezogen.'
        : `Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer ${invoice.id}.`;
    doc.text(payment, margin, afterTable + 22, { maxWidth: boxX - margin - 8 });
  }

  drawFooter(doc, 'Diese Rechnung wurde automatisch aus dem Duratus IT Kundenportal erzeugt.');
  doc.save(`${invoice.id}.pdf`);
}
