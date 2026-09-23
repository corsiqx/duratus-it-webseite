import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COMPANY } from '../../content/site';
import { VAT_RATE } from '../../content/configurator';

export interface OfferLine {
  name: string;
  note: string;
  description: string;
  monthly: number;
  setup: number;
}

export interface OfferData {
  customerName: string;
  contactName: string;
  userCount: number;
  siteLabel: string;
  tierName: string;
  tierDescription: string;
  tierPricePerUser: number;
  supportMonthly: number;
  lines: OfferLine[];
  onboarding: number;
  discountPercent: number;
  discountAmount: number;
  monthlyTotal: number;
  setupTotal: number;
}

type Rgb = [number, number, number];

/** Same palette as the website: slate-950, blue-600, blue-50, slate-200, slate-600, slate-900. */
const NAVY: Rgb = [2, 6, 23];
const NAVY_SOFT: Rgb = [22, 35, 60];
const BLUE: Rgb = [37, 99, 235];
const BLUE_SOFT: Rgb = [239, 246, 255];
const LINE: Rgb = [226, 232, 240];
const MUTED: Rgb = [71, 85, 105];
const INK: Rgb = [15, 23, 42];
const LOGO_LINE: Rgb = [127, 196, 247];
const LOGO_DOT: Rgb = [46, 201, 184];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;

const euro = (value: number) =>
  `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(value))} €`;
const formatDate = (value: Date) => value.toLocaleDateString('de-DE');

/**
 * Draws the Duratus IT mark: the shield, the pulse line and the dot.
 * Uses the same path data as the SVG logo, scaled from its 72x72 viewBox.
 */
function drawLogo(doc: jsPDF, x: number, y: number, size: number): void {
  const s = size / 72;
  doc.setLineJoin('round');
  doc.setLineCap('round');

  // Shield: M36 4 L62 14 L62 36 C62 52 50 63 36 68 C22 63 10 52 10 36 L10 14 Z
  doc.setFillColor(...NAVY_SOFT);
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

  // Pulse line: 14,36 20,36 24,26 28,46 32,20 36,42 40,30 44,36 50,36 58,36
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

/** Small label/value pair with the label in muted uppercase. */
function metaRow(doc: jsPDF, x: number, y: number, label: string, value: string): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), x, y, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(value, x, y + 4.6);
}

/** Compact navy bar for continuation pages. */
function drawContinuationHeader(doc: jsPDF, offerNumber: string): void {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 18, 'F');
  drawLogo(doc, MARGIN, 3.5, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Duratus IT', MARGIN + 14, 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Angebot ${offerNumber}`, PAGE_W - MARGIN, 11.5, { align: 'right' });
}

/** Footer with company details and page numbers, drawn on every page at the end. */
function drawFooters(doc: jsPDF, validUntil: Date): void {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_H - 26, PAGE_W - MARGIN, PAGE_H - 26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...INK);
    doc.text(COMPANY.name, MARGIN, PAGE_H - 20);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(
      `${COMPANY.street} · ${COMPANY.city} · ${COMPANY.register} · USt-IdNr. ${COMPANY.vatId}`,
      MARGIN,
      PAGE_H - 15.5,
    );
    doc.text(
      `Freibleibendes Angebot, gültig bis ${formatDate(validUntil)}. Alle Preise zzgl. der gesetzlichen Mehrwertsteuer.`,
      MARGIN,
      PAGE_H - 11,
    );
    doc.text('Erstellt mit dem IT-Konfigurator von Duratus IT.', MARGIN, PAGE_H - 6.5);
    doc.text(`Seite ${page} von ${pages}`, PAGE_W - MARGIN, PAGE_H - 6.5, { align: 'right' });
  }
}

/** Rounded pill with the configuration facts. */
function chip(doc: jsPDF, x: number, y: number, text: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const width = doc.getTextWidth(text) + 8;
  doc.setFillColor(...BLUE_SOFT);
  doc.roundedRect(x, y, width, 7.5, 3.75, 3.75, 'F');
  doc.setTextColor(...BLUE);
  doc.text(text, x + 4, y + 5.1);
  return width + 3;
}

/**
 * Builds the offer PDF in the brand layout and triggers the download.
 * Loaded on demand so jsPDF stays out of the initial bundle.
 */
export function createOfferPdf(data: OfferData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ---------------------------------------------------------------- header
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 34, 'F');
  doc.setFillColor(...BLUE);
  doc.rect(0, 34, PAGE_W, 1.4, 'F');

  drawLogo(doc, MARGIN, 8.5, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Duratus IT', MARGIN + 21, 16.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('IT-Systemhaus für den Mittelstand', MARGIN + 21, 22);

  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`${COMPANY.street} · ${COMPANY.city}`, PAGE_W - MARGIN, 14, { align: 'right' });
  doc.text(COMPANY.phone, PAGE_W - MARGIN, 19, { align: 'right' });
  doc.text(COMPANY.email, PAGE_W - MARGIN, 24, { align: 'right' });

  // ----------------------------------------------------------------- title
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 30);
  const offerNumber = `AN-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...INK);
  doc.text('Angebot', MARGIN, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text('Managed Services für Ihre IT-Umgebung', MARGIN, 58.5);

  // Recipient card on the right.
  const cardX = 118;
  const cardW = PAGE_W - MARGIN - cardX;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(cardX, 40, cardW, 30, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text('ANGEBOT FÜR', cardX + 6, 47.5, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(data.customerName || '[Firma]', cardX + 6, 54.5, { maxWidth: cardW - 12 });
  if (data.contactName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(data.contactName, cardX + 6, 60.5, { maxWidth: cardW - 12 });
  }

  metaRow(doc, MARGIN, 70, 'Angebotsnummer', offerNumber);
  metaRow(doc, MARGIN + 46, 70, 'Datum', formatDate(today));
  metaRow(doc, MARGIN + 82, 70, 'Gültig bis', formatDate(validUntil));

  // Configuration chips.
  let chipX = MARGIN;
  chipX += chip(doc, chipX, 82, `${data.userCount} Arbeitsplätze`);
  chipX += chip(doc, chipX, 82, data.siteLabel);
  chip(doc, chipX, 82, data.tierName);

  // ----------------------------------------------------------------- table
  const dash = '—';
  autoTable(doc, {
    startY: 96,
    head: [['Leistung', 'Monatlich', 'Einmalig']],
    body: [
      [
        {
          content: `${data.tierName}\n${data.userCount} Arbeitsplätze × ${euro(data.tierPricePerUser)}`,
          styles: { fontStyle: 'bold' },
        },
        euro(data.supportMonthly),
        dash,
      ],
      ...data.lines.map((line) => [
        { content: line.note ? `${line.name}\n${line.note}` : line.name, styles: { fontStyle: 'bold' as const } },
        euro(line.monthly),
        line.setup > 0 ? euro(line.setup) : dash,
      ]),
      [
        { content: `Onboarding und Ersteinrichtung\nEinrichtung, Dokumentation und Übergabe`, styles: { fontStyle: 'bold' as const } },
        dash,
        euro(data.onboarding),
      ],
    ],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 3.2, right: 3, bottom: 3.2, left: 3 }, textColor: INK },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 2.6, right: 3, bottom: 2.6, left: 3 },
    },
    bodyStyles: { lineWidth: { bottom: 0.1 }, lineColor: LINE },
    columnStyles: {
      0: { cellWidth: 108 },
      1: { halign: 'right', cellWidth: 35 },
      2: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: MARGIN, right: MARGIN },
    didParseCell: (hook) => {
      // Amount columns read better right-aligned in the header too.
      if (hook.section === 'head' && hook.column.index > 0) hook.cell.styles.halign = 'right';
      // Second line of a cell is the muted description.
      if (hook.section === 'body' && hook.column.index === 0) hook.cell.styles.minCellHeight = 12;
    },
    willDrawCell: (hook) => {
      if (hook.section === 'body' && hook.column.index === 0 && Array.isArray(hook.cell.text) && hook.cell.text.length > 1) {
        // Draw the title bold and the note muted, so the cell reads as two levels.
        const [title, ...rest] = hook.cell.text;
        hook.cell.text = [];
        const { x, y } = hook.cell;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(title, x + 3, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(rest.join(' '), x + 3, y + 10.4);
      }
    },
  });

  // ---------------------------------------------------------------- totals
  const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY ?? 160;
  const boxX = 110;
  const boxW = PAGE_W - MARGIN - boxX;
  const contentBottom = PAGE_H - 32;
  let y = afterTable + 8;

  /** Starts a continuation page when a block would not fit above the footer. */
  const ensureSpace = (needed: number) => {
    if (y + needed <= contentBottom) return;
    doc.addPage();
    drawContinuationHeader(doc, offerNumber);
    y = 30;
  };

  ensureSpace(56);

  const totalRow = (label: string, value: string, options: { bold?: boolean; color?: Rgb } = {}) => {
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...(options.color ?? MUTED));
    doc.text(label, boxX, y);
    doc.text(value, PAGE_W - MARGIN, y, { align: 'right' });
    y += 5.6;
  };

  totalRow('Summe Services (netto)', euro(data.monthlyTotal + data.discountAmount), { color: MUTED });
  if (data.discountAmount > 0) {
    totalRow(`Paket-Rabatt ${Math.round(data.discountPercent * 100)} %`, `- ${euro(data.discountAmount)}`, { color: BLUE });
  }

  // Net monthly rate is the number that matters for business customers, so it gets the highlight.
  const highlightY = y - 1.5;
  doc.setFillColor(...NAVY);
  doc.roundedRect(boxX, highlightY, boxW, 18, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('MONATLICH NETTO', boxX + 6, highlightY + 6.5, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text(euro(data.monthlyTotal), boxX + 6, highlightY + 14.5);

  y = highlightY + 24;
  totalRow(`zzgl. ${Math.round(VAT_RATE * 100)} % MwSt.`, euro(data.monthlyTotal * VAT_RATE));
  totalRow('Monatlich brutto', euro(data.monthlyTotal * (1 + VAT_RATE)), { bold: true, color: INK });
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(boxX, y - 3.5, PAGE_W - MARGIN, y - 3.5);
  y += 2;
  totalRow('Einmalige Einrichtung (netto)', euro(data.setupTotal), { bold: true, color: INK });

  // ---------------------------------------------------- scope of services
  const scope: [string, string][] = [
    [data.tierName, data.tierDescription],
    ...data.lines.map((line): [string, string] => [line.name, line.description]),
  ];
  const scopeColumn = (PAGE_W - 2 * MARGIN - 10) / 2;
  const scopeRows = Math.ceil(scope.length / 2);

  y += 8;
  ensureSpace(10 + scopeRows * 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text('Das ist enthalten', MARGIN, y);
  y += 8;

  scope.forEach(([title, description], index) => {
    const x = MARGIN + (index % 2) * (scopeColumn + 10);
    const rowY = y + Math.floor(index / 2) * 14;

    doc.setFillColor(...BLUE_SOFT);
    doc.circle(x + 2, rowY - 1.2, 2, 'F');
    doc.setFillColor(...BLUE);
    doc.circle(x + 2, rowY - 1.2, 0.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(title, x + 6.5, rowY, { maxWidth: scopeColumn - 8 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    // Two lines per entry keeps every row the same height.
    doc.text(doc.splitTextToSize(description, scopeColumn - 8).slice(0, 2), x + 6.5, rowY + 4);
  });
  y += scopeRows * 14;

  // ------------------------------------- next steps (full width strip at the end)
  y += 8;
  ensureSpace(24);
  const stepsY = y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text('So geht es weiter', MARGIN, stepsY);

  const steps: [string, string][] = [
    ['Rückfragen klären', 'Wir prüfen die Konfiguration und melden uns innerhalb eines Werktags.'],
    ['Aufnahme vor Ort', 'Kurze Bestandsaufnahme Ihrer Umgebung, damit alle Annahmen passen.'],
    ['Onboarding', 'Automatisiertes Setup, Schulung und Übergabe der Dokumentation.'],
  ];
  const stepWidth = (PAGE_W - 2 * MARGIN - 16) / 3;
  steps.forEach(([title, text], index) => {
    const x = MARGIN + index * (stepWidth + 8);
    const rowY = stepsY + 10;

    doc.setFillColor(...BLUE);
    doc.circle(x + 2.6, rowY - 1.3, 2.6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(index + 1), x + 2.6, rowY + 0.2, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(title, x + 7.5, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(doc.splitTextToSize(text, stepWidth - 9), x + 7.5, rowY + 4);
  });

  drawFooters(doc, validUntil);

  const safeName = (data.customerName || 'Konfiguration').replace(/[^a-zA-Z0-9äöüÄÖÜß]+/g, '_');
  doc.save(`Duratus_IT_Angebot_${safeName}.pdf`);
}
