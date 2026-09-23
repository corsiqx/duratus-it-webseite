import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, EmergencyPlan } from '../../data/models';
import { PDF, drawFooter, drawLetterhead, drawTitle, lastTableY } from '../../shared/pdf-brand';

/**
 * Emergency plan as a printable PDF. The point of this document is that it works when nothing else does:
 * it belongs printed in the server room and in the folder of the on-call technician.
 * Loaded on demand so jsPDF stays out of the initial bundle.
 */
export function createEmergencyPdf(plan: EmergencyPlan, customer: Customer): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { margin, pageW, pageH } = PDF;

  drawLetterhead(doc);
  drawTitle(doc, 'Notfallplan', `${customer.name}, Stand ${plan.updated}`);

  // Zielwerte prominent, weil danach im Ernstfall zuerst gefragt wird.
  doc.setFillColor(...PDF.surface);
  doc.roundedRect(118, 40, pageW - margin - 118, 34, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.muted);
  doc.text('WIEDERANLAUFZEIT (RTO)', 124, 47.5, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF.ink);
  doc.text(plan.rto, 124, 52.5, { maxWidth: pageW - margin - 130 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.muted);
  doc.text('MAXIMALER DATENVERLUST (RPO)', 124, 62, { charSpace: 0.3 });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF.ink);
  doc.text(plan.rpo, 124, 67, { maxWidth: pageW - margin - 130 });

  const tableStyles = {
    font: 'helvetica' as const,
    fontSize: 9,
    cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
    textColor: PDF.ink,
  };
  const headStyles = {
    fillColor: PDF.navy,
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: 'bold' as const,
    fontSize: 8,
    cellPadding: { top: 2.6, right: 3, bottom: 2.6, left: 3 },
  };

  autoTable(doc, {
    startY: 86,
    head: [['Stufe', 'Rolle', 'Name', 'Telefon', 'Erreichbar']],
    body: plan.escalation.map((step) => [String(step.level), step.role, step.name, step.phone, step.reachable]),
    theme: 'plain',
    styles: tableStyles,
    headStyles,
    bodyStyles: { lineWidth: { bottom: 0.1 }, lineColor: PDF.line },
    columnStyles: { 0: { cellWidth: 12, halign: 'right' }, 3: { cellWidth: 32 } },
    margin: { left: margin, right: margin },
    didDrawPage: () => undefined,
  });

  let y = lastTableY(doc, 120) + 12;

  const section = (heading: string, lines: readonly string[], numbered = false) => {
    if (y > pageH - 60) {
      doc.addPage();
      y = 24;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PDF.ink);
    doc.text(heading, margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF.muted);
    lines.forEach((line, index) => {
      const text = doc.splitTextToSize(`${numbered ? `${index + 1}. ` : '· '}${line}`, pageW - 2 * margin);
      if (y + text.length * 4.6 > pageH - 34) {
        doc.addPage();
        y = 24;
      }
      doc.text(text, margin, y);
      y += text.length * 4.6 + 1.4;
    });
    y += 6;
  };

  section('Wiederanlauf in dieser Reihenfolge', plan.restoreOrder, true);
  section('Sicherungskette', [...plan.backupChain, `Kopie außer Haus: ${plan.offlineCopy}`]);

  for (const scenario of plan.scenarios) {
    section(
      `Szenario: ${scenario.title}`,
      [
        `Auswirkung: ${scenario.impact}`,
        ...scenario.steps,
        scenario.lastTested ? `Zuletzt getestet am ${scenario.lastTested}.` : 'Dieses Szenario wurde noch nie getestet.',
      ],
    );
  }

  section('Versicherung und Meldepflichten', [plan.insurance]);

  drawFooter(doc, `Notfallplan ${customer.name}, Stand ${plan.updated}. Ausdruck im Serverraum aufbewahren.`);
  doc.save(`Notfallplan-${customer.name.replaceAll(' ', '-')}.pdf`);
}
