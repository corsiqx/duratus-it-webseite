import { Routes } from '@angular/router';

const suffix = ' | Duratus IT';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Duratus IT | IT-Systemhaus für den Mittelstand',
  },
  {
    path: 'hardware-beschaffung',
    loadComponent: () => import('./pages/hardware-beschaffung/hardware-beschaffung').then((m) => m.HardwareBeschaffung),
    title: 'Hardware Beschaffung' + suffix,
  },
  {
    path: 'managed-services',
    loadComponent: () => import('./pages/managed-services/managed-services').then((m) => m.ManagedServices),
    title: 'Managed Services' + suffix,
  },
  {
    path: 'it-consulting',
    loadComponent: () => import('./pages/it-consulting/it-consulting').then((m) => m.ItConsulting),
    title: 'IT Consulting' + suffix,
  },
  {
    path: 'konfigurator',
    loadComponent: () => import('./pages/configurator/configurator').then((m) => m.Configurator),
    title: 'IT-Konfigurator' + suffix,
  },
  {
    path: 'opendesk',
    loadComponent: () => import('./pages/opendesk/opendesk').then((m) => m.OpenDesk),
    title: 'OpenDesk' + suffix,
  },
  {
    path: 'referenzen',
    loadComponent: () => import('./pages/references/references').then((m) => m.References),
    title: 'Referenzen' + suffix,
  },
  {
    path: 'ueber-uns',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    title: 'Über uns' + suffix,
  },
  {
    path: 'karriere',
    loadComponent: () => import('./pages/careers/careers').then((m) => m.Careers),
    title: 'Karriere' + suffix,
  },
  {
    path: 'bewerbung',
    loadComponent: () => import('./pages/application/application').then((m) => m.Application),
    title: 'Bewerbung' + suffix,
  },
  {
    path: 'kontakt',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
    title: 'Kontakt' + suffix,
  },
  {
    path: 'impressum',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
    data: { heading: 'Impressum' },
    title: 'Impressum' + suffix,
  },
  {
    path: 'datenschutz',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
    data: { heading: 'Datenschutz' },
    title: 'Datenschutz' + suffix,
  },
  {
    path: 'agb',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
    data: { heading: 'AGB' },
    title: 'AGB' + suffix,
  },
  // Former addresses of the hardware-beschaffung page.
  { path: 'procurement', redirectTo: 'hardware-beschaffung' },
  { path: 'produkte', redirectTo: 'hardware-beschaffung' },
  { path: '**', redirectTo: '' },
];
