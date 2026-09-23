import { TestBed } from '@angular/core/testing';
import { PortalStore, STORAGE_KEY } from './portal-store';

describe('PortalStore', () => {
  let store: PortalStore;

  beforeEach(() => {
    localStorage.clear();
    store = TestBed.inject(PortalStore);
  });

  it('derives the dashboard figures from the demo data', () => {
    expect(store.monthlyVolume()).toBe(2169);
    expect(store.openTickets().length).toBe(2);
    expect(store.ticketsAwaitingReply().map((ticket) => ticket.id)).toEqual(['TCK-4799']);
    expect(store.overdueInvoices().map((invoice) => invoice.id)).toEqual(['RE-2026-0019']);
    expect(store.pendingOffers().length).toBe(1);
    expect(store.patchSummary()).toEqual({ total: 32, current: 29, percent: 91 });
    expect(store.unreadCount()).toBe(3);
  });

  it('signs a waiting offer once and records who signed', () => {
    store.signOffer('AN-2026-0041', 'data:image/png;base64,abc');
    const offer = store.offers().find((item) => item.id === 'AN-2026-0041');
    expect(offer?.status).toBe('angenommen');
    expect(offer?.signedBy).toBe('Max Mustermann');
    expect(offer?.signedAt).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);

    store.declineOffer('AN-2026-0041', 'zu spät');
    expect(store.offers().find((item) => item.id === 'AN-2026-0041')?.status).toBe('angenommen');
  });

  it('declines a waiting offer with a reason and ignores expired ones', () => {
    store.declineOffer('AN-2026-0041', '  Budget  ');
    const offer = store.offers().find((item) => item.id === 'AN-2026-0041');
    expect(offer?.status).toBe('abgelehnt');
    expect(offer?.declineReason).toBe('Budget');

    store.signOffer('AN-2026-0030', 'data:image/png;base64,abc');
    expect(store.offers().find((item) => item.id === 'AN-2026-0030')?.status).toBe('abgelaufen');
  });

  it('creates tickets with the next number and an opening message', () => {
    const first = store.createTicket({ subject: 'Monitor defekt', description: 'Bild flackert', priority: 'hoch', category: 'arbeitsplatz' });
    const second = store.createTicket({ subject: 'Neuer Drucker', description: 'Einrichtung', priority: 'niedrig', category: 'drucker' });
    expect(first.id).toBe('TCK-4822');
    expect(second.id).toBe('TCK-4823');
    expect(store.tickets()[0].id).toBe('TCK-4823');
    expect(first.messages[0]).toMatchObject({ author: 'kunde', text: 'Bild flackert' });
    expect(first.messages[1].text).toBe('Ticket erstellt, Priorität Hoch.');
  });

  it('moves a ticket back to the service team when the customer answers a question', () => {
    store.replyToTicket('TCK-4799', 'Ja, bitte mit Zugriff auf das Sammelpostfach.');
    const ticket = store.tickets().find((item) => item.id === 'TCK-4799');
    expect(ticket?.status).toBe('in_bearbeitung');
    expect(ticket?.messages.at(-2)).toMatchObject({ author: 'kunde', name: 'Max Mustermann' });
  });

  it('closes and reopens tickets and does not accept replies on solved tickets', () => {
    store.closeTicket('TCK-4821');
    expect(store.tickets().find((item) => item.id === 'TCK-4821')?.status).toBe('geloest');
    const before = store.tickets().find((item) => item.id === 'TCK-4821')?.messages.length;
    store.replyToTicket('TCK-4821', 'Noch da?');
    expect(store.tickets().find((item) => item.id === 'TCK-4821')?.messages.length).toBe(before);

    store.reopenTicket('TCK-4821');
    expect(store.tickets().find((item) => item.id === 'TCK-4821')?.status).toBe('offen');
  });

  it('marks notifications as read', () => {
    store.markNotificationRead('n-an-0041');
    expect(store.unreadCount()).toBe(2);
    store.markAllNotificationsRead();
    expect(store.unreadCount()).toBe(0);
  });

  it('persists changes to localStorage and restores them in a new session', () => {
    store.closeTicket('TCK-4799');
    TestBed.tick();
    expect(localStorage.getItem(STORAGE_KEY)).toContain('geloest');

    TestBed.resetTestingModule();
    const restored = TestBed.inject(PortalStore);
    expect(restored.tickets().find((item) => item.id === 'TCK-4799')?.status).toBe('geloest');
  });

  it('resets to the demo data', () => {
    store.closeTicket('TCK-4799');
    store.markAllNotificationsRead();
    store.reset();
    expect(store.tickets().find((item) => item.id === 'TCK-4799')?.status).toBe('rueckfrage');
    expect(store.unreadCount()).toBe(3);
  });
});
