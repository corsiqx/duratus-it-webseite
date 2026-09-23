import { Routes } from '@angular/router';
import { redirectSignedIn, requireSignIn } from './data/auth';
import { KbShell } from './layout/kb-shell';

const title = (page: string) => `${page} | Duratus IT Wissensdatenbank`;

export const routes: Routes = [
  {
    path: 'anmelden',
    title: title('Anmelden'),
    canActivate: [redirectSignedIn],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: KbShell,
    canActivate: [requireSignIn],
    canActivateChild: [requireSignIn],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'start' },
      {
        path: 'start',
        title: title('Start'),
        data: { heading: 'Start' },
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'suche',
        title: title('Suche'),
        data: { heading: 'Suche' },
        loadComponent: () => import('./pages/search/search-page').then((m) => m.SearchPage),
      },
      {
        path: 'kunden',
        title: title('Kundenakten'),
        data: { heading: 'Kundenakten' },
        loadComponent: () => import('./pages/customers/customers').then((m) => m.Customers),
      },
      {
        path: 'kunden/:customerId',
        title: title('Kundenakte'),
        data: { heading: 'Kundenakte' },
        loadComponent: () => import('./pages/customers/customer-detail').then((m) => m.CustomerDetail),
      },
      {
        path: 'kunden/:customerId/:tab',
        title: title('Kundenakte'),
        data: { heading: 'Kundenakte' },
        loadComponent: () => import('./pages/customers/customer-detail').then((m) => m.CustomerDetail),
      },
      {
        path: 'zugaenge',
        title: title('Zugänge'),
        data: { heading: 'Zugänge' },
        loadComponent: () => import('./pages/secrets/secrets').then((m) => m.Secrets),
      },
      {
        path: 'netzwerk',
        title: title('Netzwerkpläne'),
        data: { heading: 'Netzwerkpläne' },
        loadComponent: () => import('./pages/network/network').then((m) => m.Network),
      },
      {
        path: 'netzwerk/:customerId/:siteId',
        title: title('Netzwerkplan'),
        data: { heading: 'Netzwerkplan' },
        loadComponent: () => import('./pages/network/network-detail').then((m) => m.NetworkDetail),
      },
      {
        path: 'dokumentation',
        title: title('Dokumentation'),
        data: { heading: 'Dokumentation' },
        loadComponent: () => import('./pages/docs/docs').then((m) => m.Docs),
      },
      {
        path: 'dokumentation/:docId',
        title: title('Dokument'),
        data: { heading: 'Dokumentation' },
        loadComponent: () => import('./pages/docs/doc-detail').then((m) => m.DocDetail),
      },
      {
        path: 'taetigkeiten',
        title: title('Tätigkeiten'),
        data: { heading: 'Tätigkeiten' },
        loadComponent: () => import('./pages/changes/changes').then((m) => m.Changes),
      },
      {
        path: 'taetigkeiten/:changeId',
        title: title('Tätigkeit'),
        data: { heading: 'Tätigkeiten' },
        loadComponent: () => import('./pages/changes/change-detail').then((m) => m.ChangeDetail),
      },
      {
        path: 'inventar',
        title: title('Inventar'),
        data: { heading: 'Inventar' },
        loadComponent: () => import('./pages/inventory/inventory').then((m) => m.Inventory),
      },
      {
        path: 'lizenzen',
        title: title('Lizenzen und Fristen'),
        data: { heading: 'Lizenzen und Fristen' },
        loadComponent: () => import('./pages/licenses/licenses').then((m) => m.Licenses),
      },
      {
        path: 'notfall',
        title: title('Notfallpläne'),
        data: { heading: 'Notfallpläne' },
        loadComponent: () => import('./pages/emergency/emergency').then((m) => m.Emergency),
      },
      {
        path: 'protokoll',
        title: title('Zugriffsprotokoll'),
        data: { heading: 'Zugriffsprotokoll' },
        loadComponent: () => import('./pages/audit/audit').then((m) => m.Audit),
      },
      {
        path: 'konto',
        title: title('Mein Konto'),
        data: { heading: 'Mein Konto' },
        loadComponent: () => import('./pages/account/account').then((m) => m.AccountPage),
      },
    ],
  },
  { path: '**', redirectTo: 'start' },
];
