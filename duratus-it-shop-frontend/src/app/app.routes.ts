import { Routes } from '@angular/router';

const title = (page: string) => `${page} | Duratus IT Shop`;

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Duratus IT Shop | Hardware, Lizenzen und der Betrieb dazu',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'katalog',
    title: title('Alle Artikel'),
    loadComponent: () => import('./pages/catalog/catalog-page').then((m) => m.CatalogPage),
  },
  {
    path: 'katalog/:categorySlug',
    title: title('Katalog'),
    loadComponent: () => import('./pages/catalog/catalog-page').then((m) => m.CatalogPage),
  },
  {
    path: 'artikel/:slug',
    title: title('Artikel'),
    loadComponent: () => import('./pages/product/product-page').then((m) => m.ProductPage),
  },
  {
    path: 'suche',
    title: title('Suche'),
    loadComponent: () => import('./pages/search/search-page').then((m) => m.SearchPage),
  },
  {
    path: 'warenkorb',
    title: title('Warenkorb'),
    loadComponent: () => import('./pages/cart/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'kasse',
    title: title('Kasse'),
    loadComponent: () => import('./pages/checkout/checkout-page').then((m) => m.CheckoutPage),
  },
  {
    path: 'merkliste',
    title: title('Merkliste'),
    loadComponent: () => import('./pages/wishlist/wishlist-page').then((m) => m.WishlistPage),
  },
  {
    path: 'bestellungen',
    title: title('Bestellungen und Angebote'),
    loadComponent: () => import('./pages/orders/orders-page').then((m) => m.OrdersPage),
  },
  {
    path: 'bestellungen/:orderId',
    title: title('Vorgang'),
    loadComponent: () => import('./pages/orders/order-detail').then((m) => m.OrderDetail),
  },
  {
    path: 'konto',
    title: title('Mein Konto'),
    loadComponent: () => import('./pages/account/account-page').then((m) => m.AccountPage),
  },
  {
    path: 'versand-und-zahlung',
    title: title('Versand und Zahlung'),
    loadComponent: () => import('./pages/info/delivery-page').then((m) => m.DeliveryPage),
  },
  {
    path: 'fragen',
    title: title('Fragen und Antworten'),
    loadComponent: () => import('./pages/info/faq-page').then((m) => m.FaqPage),
  },
  {
    path: 'impressum',
    title: title('Impressum'),
    loadComponent: () => import('./pages/info/legal-page').then((m) => m.LegalPage),
    data: { legal: 'impressum' },
  },
  {
    path: 'datenschutz',
    title: title('Datenschutz'),
    loadComponent: () => import('./pages/info/legal-page').then((m) => m.LegalPage),
    data: { legal: 'datenschutz' },
  },
  {
    path: 'agb',
    title: title('AGB'),
    loadComponent: () => import('./pages/info/legal-page').then((m) => m.LegalPage),
    data: { legal: 'agb' },
  },
  // Older link shapes used while the shop was built.
  { path: 'produkte', redirectTo: 'katalog' },
  { path: 'kategorie/:categorySlug', redirectTo: 'katalog/:categorySlug' },
  { path: '**', redirectTo: '' },
];
