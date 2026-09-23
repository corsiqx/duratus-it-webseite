import { jsPDF } from 'jspdf';
import { COMPANY } from '../content/company';

export type Rgb = [number, number, number];

/** Same palette as the website offer PDF: slate-950, blue-600, slate-200, slate-600, slate-900. */
export const PDF = {
  navy: [2, 6, 23] as Rgb,
  navySoft: [22, 35, 60] as Rgb,
  blue: [37, 99, 235] as Rgb,
  blueSoft: [239, 246, 255] as Rgb,
  line: [226, 232, 240] as Rgb,
  muted: [71, 85, 105] as Rgb,
  ink: [15, 23, 42] as Rgb,
  surface: [248, 250, 252] as Rgb,
  pageW: 210,
  pageH: 297,
  margin: 16,
};

const LOGO_LINE: Rgb = [127, 196, 247];
const LOGO_DOT: Rgb = [46, 201, 184];

/** Duratus IT mark (shield, pulse line, dot), same path data as the SVG logo scaled from its 72x72 viewBox. */
export function drawLogo(doc: jsPDF, x: number, y: number, size: number): void {
  const s = size / 72;
  doc.setLineJoin('round');
  doc.setLineCap('round');

  doc.setFillColor(...PDF.navySoft);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.35);
  doc.lines(
    [
      [26 * s, 10 * s],
      [0, 22 * s],
      [0, 16 * s, -12 * s, 27 * s, -26 * s, 32 * s],
      [-14 * s, -5 * s, -26 * s, -16 * s, -26 * s, -32 * s],
      [0, -22 * s],
    ],
    x + 36 * s,
    y + 4 * s,
    [1, 1],
    'DF',
    true,
  );

  doc.setDrawColor(...LOGO_LINE);
  doc.setLineWidth(Math.max(0.5, 2.8 * s));
  doc.lines(
    [
      [6 * s, 0],
      [4 * s, -10 * s],
      [4 * s, 20 * s],
      [4 * s, -26 * s],
      [4 * s, 22 * s],
      [4 * s, -12 * s],
      [4 * s, 6 * s],
      [6 * s, 0],
      [8 * s, 0],
    ],
    x + 14 * s,
    y + 36 * s,
    [1, 1],
    'S',
    false,
  );

  doc.setFillColor(...LOGO_DOT);
  doc.circle(x + 32 * s, y + 20 * s, 2.6 * s, 'F');
}

/** Navy letterhead with logo, company address and a blue rule. */
export function drawLetterhead(doc: jsPDF): void {
  const { pageW, margin } = PDF;
  doc.setFillColor(...PDF.navy);
  doc.rect(0, 0, pageW, 34, 'F');
  doc.setFillColor(...PDF.blue);
  doc.rect(0, 34, pageW, 1.4, 'F');

  drawLogo(doc, margin, 8.5, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Duratus IT', margin + 21, 16.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('IT-Systemhaus für den Mittelstand', margin + 21, 22);

  doc.setTextColor(203, 213, 225);
  doc.text(`${COMPANY.street} · ${COMPANY.city}`, pageW - margin, 14, { align: 'right' });
  doc.text(`${COMPANY.phone} · ${COMPANY.email}`, pageW - margin, 19, { align: 'right' });
  doc.text(COMPANY.web, pageW - margin, 24, { align: 'right' });
}

/** Document title with a muted subtitle. */
export function drawTitle(doc: jsPDF, title: string, subtitle: string): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...PDF.ink);
  doc.text(title, PDF.margin, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF.muted);
  doc.text(subtitle, PDF.margin, 58.5, { maxWidth: 96 });
}

/** Light address card on the right side. */
export function drawAddressCard(doc: jsPDF, label: string, lines: [string, ...string[]]): void {
  const x = 118;
  const w = PDF.pageW - PDF.margin - x;
  doc.setFillColor(...PDF.surface);
  doc.roundedRect(x, 40, w, 34, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.muted);
  doc.text(label.toUpperCase(), x + 6, 47.5, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PDF.ink);
  doc.text(lines[0], x + 6, 54.5, { maxWidth: w - 12 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF.muted);
  lines.slice(1).forEach((line, index) => doc.text(line, x + 6, 60.5 + index * 5, { maxWidth: w - 12 }));
}

/** Small uppercase label with a bold value below. */
export function metaRow(doc: jsPDF, x: number, y: number, label: string, value: string): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.muted);
  doc.text(label.toUpperCase(), x, y, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF.ink);
  doc.text(value, x, y + 4.6);
}

/** Company footer with an individual last line. */
export function drawFooter(doc: jsPDF, note: string): void {
  const { pageW, pageH, margin } = PDF;
  doc.setDrawColor(...PDF.line);
  doc.setLineWidth(0.2);
  doc.line(margin, pageH - 26, pageW - margin, pageH - 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.ink);
  doc.text(COMPANY.name, margin, pageH - 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF.muted);
  doc.text(`${COMPANY.street} · ${COMPANY.city} · ${COMPANY.register} · USt-IdNr. ${COMPANY.vatId}`, margin, pageH - 15.5);
  doc.text(`Bank: ${COMPANY.bank}`, margin, pageH - 11);
  doc.text(note, margin, pageH - 6.5);
}

/** Navy highlight box with a label and a large amount. */
export function drawHighlight(doc: jsPDF, x: number, y: number, w: number, label: string, value: string): void {
  doc.setFillColor(...PDF.navy);
  doc.roundedRect(x, y, w, 18, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(label.toUpperCase(), x + 6, y + 6.5, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text(value, x + 6, y + 14.5);
}

export const lastTableY = (doc: jsPDF, fallback: number): number =>
  (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? fallback;
