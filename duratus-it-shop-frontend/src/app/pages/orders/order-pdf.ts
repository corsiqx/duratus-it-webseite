import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VAT_RATE } from '../../content/company';
import { DELIVERY_OPTIONS, PAYMENT_METHODS } from '../../content/shop';
import { Order } from '../../data/models';
import { dateDe, euroCents } from '../../shared/format';
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
 * Builds the order confirmation or the quote in the brand layout and triggers the download.
 * Loaded on demand so jsPDF stays out of the initial bundle.
 */
export function createOrderPdf(order: Order): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { margin, pageW } = PDF;
  const isQuote = order.kind === 'angebot';
  const created = new Date(order.createdAt);

  drawLetterhead(doc);
  drawTitle(
    doc,
    isQuote ? 'Angebot' : 'Bestellbestätigung',
    isQuote
      ? 'Unverbindliches Angebot aus dem Duratus IT Shop. Gültig bis zum unten genannten Datum.'
      : 'Vielen Dank für Ihre Bestellung. Diese Bestätigung listet alle Positionen mit dem zugesagten Liefertermin.',
  );
  drawAddressCard(doc, isQuote ? 'Angebot für' : 'Lieferadresse', [
    order.address.company,
    order.address.contact,
    order.address.street,
    `${order.address.zip} ${order.address.city}`,
  ]);

  metaRow(doc, margin, 70, isQuote ? 'Angebotsnummer' : 'Bestellnummer', order.id);
  metaRow(doc, margin + 40, 70, 'Datum', dateDe(created));
  metaRow(doc, margin + 74, 70, isQuote ? 'Gültig bis' : 'Liefertermin', order.validUntil ?? order.expectedDelivery);

  const deliveryLabel = DELIVERY_OPTIONS.find((option) => option.id === order.delivery)?.label ?? '';
  const paymentLabel = PAYMENT_METHODS.find((method) => method.id === order.payment)?.label ?? '';
  metaRow(doc, margin, 84, 'Versandart', deliveryLabel);
  metaRow(doc, margin + 50, 84, 'Zahlungsart', paymentLabel);
  if (order.reference) metaRow(doc, margin + 118, 84, 'Ihre Referenz', order.reference);

  autoTable(doc, {
    startY: 96,
    head: [['Pos.', 'Artikel', 'Artikelnummer', 'Menge', 'Einzelpreis', 'Gesamt', isQuote ? 'Lieferzeit' : 'Termin']],
    body: order.lines.map((line, index) => [
      String(index + 1),
      `${line.name}\n${line.subtitle}`,
      line.mpn,
      `${line.quantity} ${line.recurring ? line.unit : 'Stk.'}`,
      euroCents(line.unitPrice),
      euroCents(line.lineTotal),
      line.deliveryDate,
    ]),
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: { top: 2.8, right: 2.5, bottom: 2.8, left: 2.5 }, textColor: PDF.ink },
    headStyles: {
      fillColor: PDF.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 2.4, right: 2.5, bottom: 2.4, left: 2.5 },
    },
    bodyStyles: { lineWidth: { bottom: 0.1 }, lineColor: PDF.line },
    columnStyles: {
      0: { cellWidth: 9, textColor: PDF.muted },
      1: { cellWidth: 58 },
      2: { cellWidth: 24, textColor: PDF.muted },
      3: { halign: 'right', cellWidth: 18 },
      4: { halign: 'right', cellWidth: 22 },
      5: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
      6: { halign: 'right', cellWidth: 25, textColor: PDF.muted },
    },
    margin: { left: margin, right: margin },
    didParseCell: (hook) => {
      if (hook.section === 'head' && hook.column.index > 2) hook.cell.styles.halign = 'right';
    },
  });

  const boxX = 112;
  let y = lastTableY(doc, 140) + 10;

  const totalRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...(bold ? PDF.ink : PDF.muted));
    doc.text(label, boxX, y);
    doc.text(value, pageW - margin, y, { align: 'right' });
    y += 5.6;
  };

  totalRow('Warenwert (netto)', euroCents(order.goodsNet));
  totalRow('Versand (netto)', order.shippingNet === 0 ? 'kostenfrei' : euroCents(order.shippingNet));
  doc.setDrawColor(...PDF.line);
  doc.setLineWidth(0.2);
  doc.line(boxX, y - 3.4, pageW - margin, y - 3.4);
  totalRow(`Umsatzsteuer ${Math.round(VAT_RATE * 100)} %`, euroCents(order.vat));
  y += 1;
  drawHighlight(doc, boxX, y, pageW - margin - boxX, isQuote ? 'Angebotssumme brutto' : 'Rechnungsbetrag brutto', euroCents(order.gross));
  y += 24;

  if (order.monthlyNet > 0) {
    doc.setFillColor(...PDF.blueSoft);
    doc.roundedRect(margin, y, pageW - 2 * margin, 16, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PDF.blue);
    doc.text(`Zusätzlich monatlich: ${euroCents(order.monthlyNet)} netto`, margin + 5, y + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...PDF.muted);
    doc.text('Lizenzen werden monatlich auf der Sammelrechnung geführt, nicht mit diesem Betrag.', margin + 5, y + 11.8);
    y += 22;
  }

  if (order.note) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PDF.ink);
    doc.text('Ihr Hinweis', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF.muted);
    doc.text(order.note, margin, y + 5, { maxWidth: pageW - 2 * margin });
  }

  drawFooter(
    doc,
    isQuote
      ? `Angebot ${order.id} · gültig bis ${order.validUntil} · Preise netto zzgl. Umsatzsteuer · Irrtum und Modellpflege vorbehalten`
      : `Bestellung ${order.id} · Zahlung ${paymentLabel} · Preise netto zzgl. Umsatzsteuer · Eigentumsvorbehalt bis zur vollständigen Zahlung`,
  );

  doc.save(`${order.id}-${isQuote ? 'angebot' : 'bestellbestaetigung'}-duratus-it.pdf`);
}
