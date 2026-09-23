import { Routes } from '@angular/router';
import { redirectSignedIn, requireSignIn } from './data/auth';
import { PortalShell } from './layout/portal-shell';

const title = (page: string) => `${page} | Duratus IT Kundenportal`;

export const routes: Routes = [
  {
    path: 'anmelden',
    title: title('Anmelden'),
    canActivate: [redirectSignedIn],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: PortalShell,
    canActivate: [requireSignIn],
    canActivateChild: [requireSignIn],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'uebersicht' },
      {
        path: 'uebersicht',
        title: title('Übersicht'),
        data: { heading: 'Übersicht' },
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'tickets',
        title: title('Tickets'),
        data: { heading: 'Tickets' },
        loadComponent: () => import('./pages/tickets/tickets').then((m) => m.Tickets),
      },
      {
        path: 'tickets/:ticketId',
        title: title('Ticket'),
        data: { heading: 'Tickets' },
        loadComponent: () => import('./pages/tickets/ticket-detail').then((m) => m.TicketDetail),
      },
      {
        path: 'meine-it',
        title: title('Meine IT'),
        data: { heading: 'Meine IT' },
        loadComponent: () => import('./pages/my-it/my-it').then((m) => m.MyIt),
      },
      {
        path: 'arbeitsnachweise',
        title: title('Arbeitsnachweise'),
        data: { heading: 'Arbeitsnachweise' },
        loadComponent: () => import('./pages/work-logs/work-logs').then((m) => m.WorkLogs),
      },
      {
        path: 'rechnungen',
        title: title('E-Rechnungen'),
        data: { heading: 'E-Rechnungen' },
        loadComponent: () => import('./pages/invoices/invoices').then((m) => m.Invoices),
      },
      {
        path: 'angebote',
        title: title('Angebote'),
        data: { heading: 'Angebote' },
        loadComponent: () => import('./pages/offers/offers').then((m) => m.Offers),
      },
      {
        path: 'angebote/:offerId',
        title: title('Angebot'),
        data: { heading: 'Angebote' },
        loadComponent: () => import('./pages/offers/offer-detail').then((m) => m.OfferDetail),
      },
      {
        path: 'vertraege',
        title: title('Verträge'),
        data: { heading: 'Verträge' },
        loadComponent: () => import('./pages/contracts/contracts').then((m) => m.Contracts),
      },
      {
        path: 'zahlungsinformationen',
        title: title('Zahlungsinformationen'),
        data: { heading: 'Zahlungsinformationen' },
        loadComponent: () => import('./pages/billing/billing').then((m) => m.Billing),
      },
      {
        path: 'konto',
        title: title('Mein Konto'),
        data: { heading: 'Mein Konto' },
        loadComponent: () => import('./pages/account/account').then((m) => m.AccountPage),
      },
    ],
  },
  { path: '**', redirectTo: 'uebersicht' },
];
