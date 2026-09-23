import { addDays, dateDe } from '../shared/format';
import {
  Account,
  BillingInfo,
  Contract,
  Customer,
  Device,
  Invoice,
  NotificationPrefs,
  Offer,
  PortalNotification,
  Ticket,
  WorkLog,
} from './models';

/*
 * Demo data. Base: the HTML prototype (Duratus_IT_Kundenportal.html), extended for the portal build-out
 * (ticket threads, offer positions, devices, notifications). Everything here is fictitious.
 * There is no backend yet: replace PortalStore's initial state with API calls once one exists.
 */

export const DEMO_CUSTOMER: Customer = { name: 'Muster GmbH', initials: 'MG' };

export const DEMO_ACCOUNT: Account = {
  name: 'Max Mustermann',
  email: 'max.mustermann@muster-gmbh.de',
  phone: '0123 456789',
  position: 'Geschäftsführung',
};

export const DEMO_PREFS: NotificationPrefs = { invoices: true, tickets: true, offers: true, maintenance: false };

export const DEMO_INVOICES: readonly Invoice[] = [
  { id: 'RE-2026-0031', date: '01.08.2026', description: 'Managed Services August 2026', amount: 1219, status: 'bezahlt' },
  { id: 'RE-2026-0028', date: '01.07.2026', description: 'Managed Services Juli 2026', amount: 1219, status: 'bezahlt' },
  { id: 'RE-2026-0025', date: '01.06.2026', description: 'Managed Services Juni 2026', amount: 1094, status: 'bezahlt' },
  { id: 'RE-2026-0022', date: '01.05.2026', description: 'Managed Services Mai 2026', amount: 1094, status: 'offen' },
  { id: 'RE-2026-0019', date: '01.04.2026', description: 'Managed Services April 2026', amount: 1094, status: 'ueberfaellig' },
];

/** The pending demo offer stays signable: its dates are relative to the day the demo data is created. */
export function demoOffers(today = new Date()): Offer[] {
  return [
    {
      id: 'AN-2026-0041',
      title: 'Managed IT Professional, Erweiterung auf 45 User',
      summary:
        'Erweiterung Ihres Managed-IT-Vertrags auf 45 Arbeitsplätze inklusive Firewall, Backup und Monitoring für den neuen Standortbereich.',
      amount: 2450,
      period: 'Monat',
      oneTime: 650,
      termNote: '12 Monate, danach automatische Verlängerung um 12 Monate',
      created: dateDe(addDays(today, -9)),
      validUntil: dateDe(addDays(today, 21)),
      status: 'wartet',
      positions: [
        { name: 'Managed Workstation Business', detail: '45 Arbeitsplätze × 32,00 €', amount: 1440 },
        { name: 'Managed Firewall Business', detail: '1 Standort, inkl. Updates und Regelpflege', amount: 390 },
        { name: 'Managed Backup Business', detail: 'erweitert auf 2 TB, täglich, mit Cloud-Kopie', amount: 320 },
        { name: 'Monitoring und Alarmierung', detail: 'alle Geräte und Dienste', amount: 300 },
      ],
      signedAt: null,
      signedBy: null,
      signature: null,
      declinedAt: null,
      declineReason: null,
    },
    {
      id: 'AN-2026-0037',
      title: 'Cyber-Resilience & Phishing-Schulung, Zusatzpaket',
      summary: 'Regelmäßige Phishing-Simulationen und Online-Schulungen für alle Mitarbeitenden.',
      amount: 150,
      period: 'Monat',
      oneTime: 0,
      termNote: '12 Monate, danach monatlich kündbar',
      created: '20.06.2026',
      validUntil: '20.07.2026',
      status: 'angenommen',
      positions: [
        { name: 'Phishing-Simulation', detail: 'quartalsweise, mit Auswertung', amount: 90 },
        { name: 'Awareness-Schulung online', detail: 'Lernplattform für alle Mitarbeitenden', amount: 60 },
      ],
      signedAt: '02.07.2026',
      signedBy: 'Max Mustermann',
      signature: null,
      declinedAt: null,
      declineReason: null,
    },
    {
      id: 'AN-2026-0030',
      title: 'Managed Backup Enterprise, Upgrade',
      summary: 'Upgrade auf unveränderbare Sicherungen (Immutable Storage) mit längerer Aufbewahrung.',
      amount: 340,
      period: 'Monat',
      oneTime: 0,
      termNote: 'läuft mit dem bestehenden Backup-Vertrag',
      created: '10.04.2026',
      validUntil: '10.05.2026',
      status: 'abgelaufen',
      positions: [
        { name: 'Managed Backup Enterprise', detail: 'Immutable Storage, tägliche Sicherung', amount: 280 },
        { name: 'Erweiterte Aufbewahrung', detail: '12 Monate statt 30 Tage', amount: 60 },
      ],
      signedAt: null,
      signedBy: null,
      signature: null,
      declinedAt: null,
      declineReason: null,
    },
  ];
}

export const DEMO_CONTRACTS: readonly Contract[] = [
  {
    id: 'V-2025-014',
    name: 'Managed IT Professional',
    area: 'Managed IT',
    start: '01.09.2025',
    termMonths: 12,
    renewMonths: 12,
    noticeMonths: 3,
    amount: 1094,
    active: true,
    included: ['Managed Firewall Business', 'Managed Workstation Business (32 Geräte)', 'Managed Backup Business', '24/7 Monitoring'],
  },
  {
    id: 'V-2025-015',
    name: 'Managed Backup Business',
    area: 'Managed Backup',
    start: '01.09.2025',
    termMonths: 12,
    renewMonths: 12,
    noticeMonths: 3,
    amount: 125,
    active: true,
    included: ['Tägliches automatisches Backup', 'Monatlicher Restore-Test', '3-2-1-Strategie inkl. Cloud-Kopie'],
  },
  {
    id: 'V-2026-003',
    name: 'IT Consulting Retainer',
    area: 'IT Consulting',
    start: '01.02.2026',
    termMonths: null,
    renewMonths: null,
    noticeMonths: 1,
    amount: 950,
    active: true,
    included: ['Tagessatz-Kontingent 1 Tag/Monat', 'Priorisierte Terminvergabe'],
  },
];

export const DEMO_TICKETS: readonly Ticket[] = [
  {
    id: 'TCK-4821',
    subject: 'E-Mail-Zustellung verzögert',
    category: 'email',
    priority: 'hoch',
    status: 'in_bearbeitung',
    created: '18.08.2026',
    updated: '19.08.2026',
    messages: [
      { author: 'kunde', name: 'Max Mustermann', at: '18.08.2026, 08:12', text: 'Seit heute früh kommen externe E-Mails teilweise mit bis zu zwei Stunden Verspätung bei uns an.' },
      { author: 'system', name: 'System', at: '18.08.2026, 08:12', text: 'Ticket erstellt, Priorität Hoch.' },
      { author: 'technik', name: 'Julia Beispiel', at: '18.08.2026, 09:05', text: 'Wir haben uns per Fernwartung verbunden. Die Warteschlange des Mail-Gateways ist ungewöhnlich voll, wir suchen die Ursache.' },
      { author: 'technik', name: 'Julia Beispiel', at: '19.08.2026, 10:30', text: 'Ursache war eine fehlerhafte Filterregel. Die Regel ist korrigiert, wir beobachten die Zustellung noch bis morgen.' },
    ],
  },
  {
    id: 'TCK-4799',
    subject: 'Neuer Mitarbeiter, Onboarding IT',
    category: 'zugang',
    priority: 'normal',
    status: 'rueckfrage',
    created: '15.08.2026',
    updated: '15.08.2026',
    messages: [
      { author: 'kunde', name: 'Max Mustermann', at: '15.08.2026, 09:40', text: 'Im Vertrieb fängt ein neuer Kollege an. Bitte Notebook, E-Mail-Postfach und Zugänge vorbereiten.' },
      { author: 'system', name: 'System', at: '15.08.2026, 09:40', text: 'Ticket erstellt, Priorität Normal.' },
      { author: 'technik', name: 'David Klein', at: '15.08.2026, 16:20', text: 'Notebook ist eingerichtet, die Zugänge sind vorbereitet. Eine Frage noch: Soll er auch Zugriff auf das Sammelpostfach des Vertriebs bekommen?' },
      { author: 'system', name: 'System', at: '15.08.2026, 16:20', text: 'Status geändert: Wartet auf Ihre Antwort.' },
    ],
  },
  {
    id: 'TCK-4756',
    subject: 'Drucker im 2. OG offline',
    category: 'drucker',
    priority: 'niedrig',
    status: 'geloest',
    created: '10.08.2026',
    updated: '11.08.2026',
    messages: [
      { author: 'kunde', name: 'Max Mustermann', at: '10.08.2026, 08:55', text: 'Der Drucker im 2. OG wird von keinem Rechner mehr gefunden.' },
      { author: 'system', name: 'System', at: '10.08.2026, 08:55', text: 'Ticket erstellt, Priorität Niedrig.' },
      { author: 'technik', name: 'David Klein', at: '10.08.2026, 10:15', text: 'Aus der Ferne ist der Drucker nicht erreichbar. Wir kommen heute um 14 Uhr vorbei.' },
      { author: 'technik', name: 'David Klein', at: '11.08.2026, 09:30', text: 'Netzteil getauscht, der Drucker ist wieder im Netz. Der Testdruck war erfolgreich.' },
      { author: 'system', name: 'System', at: '11.08.2026, 09:30', text: 'Ticket gelöst.' },
    ],
  },
  {
    id: 'TCK-4701',
    subject: 'VPN-Verbindung bricht ständig ab',
    category: 'netzwerk',
    priority: 'hoch',
    status: 'geloest',
    created: '02.08.2026',
    updated: '03.08.2026',
    messages: [
      { author: 'kunde', name: 'Max Mustermann', at: '02.08.2026, 07:48', text: 'Im Homeoffice bricht die VPN-Verbindung alle paar Minuten ab.' },
      { author: 'system', name: 'System', at: '02.08.2026, 07:48', text: 'Ticket erstellt, Priorität Hoch.' },
      { author: 'technik', name: 'Julia Beispiel', at: '02.08.2026, 11:02', text: 'Die VPN-Konfiguration am Router ist erneuert. Bitte testen Sie die Verbindung und geben Sie uns Bescheid.' },
      { author: 'kunde', name: 'Max Mustermann', at: '03.08.2026, 08:10', text: 'Läuft seit gestern stabil, vielen Dank!' },
      { author: 'system', name: 'System', at: '03.08.2026, 08:10', text: 'Ticket gelöst.' },
    ],
  },
];

export const DEMO_WORK_LOGS: readonly WorkLog[] = [
  { date: '18.08.2026', technician: 'Julia Beispiel', description: 'Fernwartung E-Mail-Server, Diagnose Zustellverzögerung', hours: 1.5, ticketId: 'TCK-4821' },
  { date: '15.08.2026', technician: 'David Klein', description: 'Onboarding neuer Mitarbeiter, Geräte-Setup und Zugänge', hours: 2, ticketId: 'TCK-4799' },
  { date: '10.08.2026', technician: 'David Klein', description: 'Vor-Ort-Termin: Drucker-Reparatur 2. OG', hours: 0.75, ticketId: 'TCK-4756' },
  { date: '02.08.2026', technician: 'Julia Beispiel', description: 'VPN-Konfiguration am Router erneuert', hours: 1.25, ticketId: 'TCK-4701' },
  { date: '01.08.2026', technician: 'Automatisiert (RMM)', description: 'Monatliches Patch-Fenster durchgeführt (32 Geräte)', hours: null, ticketId: null },
];

export const DEMO_BILLING: BillingInfo = {
  company: 'Muster GmbH',
  street: 'Beispielweg 12',
  zipCity: '12345 Musterstadt',
  email: 'buchhaltung@muster-gmbh.de',
  paymentMethod: 'sepa',
  iban: 'DE12 3456 7890 1234 5678 90',
};

/** Ticket volume of the last six months for the dashboard chart. */
export const DEMO_TICKET_VOLUME: readonly { month: string; count: number }[] = [
  { month: 'Mär', count: 4 },
  { month: 'Apr', count: 3 },
  { month: 'Mai', count: 6 },
  { month: 'Jun', count: 2 },
  { month: 'Jul', count: 5 },
  { month: 'Aug', count: 4 },
];

/** 32 managed workstations, matching the contract "Managed Workstation Business (32 Geräte)". */
export const DEMO_DEVICES: readonly Device[] = (() => {
  const departments: [string, string, number, Device['type']][] = [
    ['Geschäftsführung', 'GF', 2, 'Notebook'],
    ['Vertrieb', 'VT', 8, 'Notebook'],
    ['Buchhaltung', 'BH', 4, 'Desktop'],
    ['Einkauf', 'EK', 4, 'Desktop'],
    ['Technik', 'TE', 8, 'Notebook'],
    ['Empfang', 'EM', 2, 'Desktop'],
    ['Lager', 'LG', 4, 'Desktop'],
  ];
  const exceptions: Record<string, Partial<Device>> = {
    'NB-VT-05': { patch: 'neustart' },
    'NB-TE-03': { patch: 'neustart', online: false, lastSeen: '14.09.2026, 17:42' },
    'PC-LG-02': { patch: 'ausstehend', online: false, lastSeen: '09.09.2026, 12:05', os: 'Windows 11 23H2' },
  };
  return departments.flatMap(([department, code, count, type]) =>
    Array.from({ length: count }, (_, index) => {
      const name = `${type === 'Notebook' ? 'NB' : 'PC'}-${code}-${String(index + 1).padStart(2, '0')}`;
      const device: Device = { name, type, department, os: 'Windows 11 24H2', patch: 'aktuell', online: true, lastSeen: 'jetzt' };
      return { ...device, ...exceptions[name] };
    }),
  );
})();

export const DEMO_NOTIFICATIONS: readonly PortalNotification[] = [
  {
    id: 'n-4799-rueckfrage',
    title: 'Rückfrage zu TCK-4799',
    text: 'David Klein wartet auf Ihre Antwort zum Onboarding.',
    date: '15.08.2026',
    icon: 'phosphorChatCircleText',
    link: '/tickets/TCK-4799',
  },
  {
    id: 'n-an-0041',
    title: 'Neues Angebot AN-2026-0041',
    text: 'Managed IT Professional, Erweiterung auf 45 User wartet auf Ihre Unterschrift.',
    date: '15.08.2026',
    icon: 'phosphorSignature',
    link: '/angebote/AN-2026-0041',
  },
  {
    id: 'n-re-0019',
    title: 'Rechnung RE-2026-0019 überfällig',
    text: 'Der Betrag von 1.094,00 € ist noch nicht eingegangen.',
    date: '15.08.2026',
    icon: 'phosphorWarningCircle',
    link: '/rechnungen',
    queryParams: { status: 'ueberfaellig' },
  },
  {
    id: 'n-4756-geloest',
    title: 'TCK-4756 gelöst',
    text: 'Drucker im 2. OG ist wieder erreichbar.',
    date: '11.08.2026',
    icon: 'phosphorCheckCircle',
    link: '/tickets/TCK-4756',
  },
  {
    id: 'n-re-0031',
    title: 'Neue Rechnung RE-2026-0031',
    text: 'Managed Services August 2026 steht zum Download bereit.',
    date: '01.08.2026',
    icon: 'phosphorReceipt',
    link: '/rechnungen',
  },
];

/** Notifications that are already read in a fresh demo. */
export const DEMO_READ_NOTIFICATIONS: readonly string[] = ['n-4756-geloest', 'n-re-0031'];
