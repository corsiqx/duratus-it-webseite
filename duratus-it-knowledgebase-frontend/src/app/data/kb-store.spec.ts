import { TestBed } from '@angular/core/testing';
import { KbStore, STORAGE_KEY, daysUntil } from './kb-store';

describe('KbStore', () => {
  let store: KbStore;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.resetTestingModule();
    store = TestBed.inject(KbStore);
  });

  it('links every record of a customer file to an existing customer', () => {
    const ids = new Set(store.customers().map((customer) => customer.id));
    const referenced = [
      ...store.sites(),
      ...store.contacts(),
      ...store.assets(),
      ...store.secrets(),
      ...store.changes(),
      ...store.licenses(),
    ].map((record) => record.customerId);
    expect(referenced.every((id) => ids.has(id))).toBe(true);
  });

  it('points every network node with a device at a known inventory entry', () => {
    const assetIds = new Set(store.assets().map((asset) => asset.id));
    const nodes = store.networks().flatMap((plan) => plan.nodes.filter((node) => node.assetId !== null));
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.every((node) => assetIds.has(node.assetId!))).toBe(true);
  });

  it('sorts the deadlines with the most urgent one first', () => {
    const expiries = store.expiries();
    const sorted = [...expiries].sort((a, b) => a.daysLeft - b.daysLeft);
    expect(expiries.map((item) => item.id)).toEqual(sorted.map((item) => item.id));
    expect(store.openExpiries().every((item) => item.daysLeft <= 60)).toBe(true);
  });

  it('stores a rotation, resets the interval and writes it to the log', () => {
    const secret = store.secrets()[0];
    const before = store.audit().length;

    store.rotateSecret(secret, 'Ganz-Neues-Passwort-42!');

    const updated = store.secrets().find((entry) => entry.id === secret.id)!;
    expect(updated.password).toBe('Ganz-Neues-Passwort-42!');
    expect(daysUntil(updated.rotatedAt)).toBe(0);
    expect(store.audit()).toHaveLength(before + 1);
    expect(store.audit()[0].action).toBe('zugang-rotiert');
  });

  it('puts the last opened customer file first and keeps it free of duplicates', () => {
    store.touchCustomer('aatal-mvz');
    store.touchCustomer('muster-gmbh');
    store.touchCustomer('aatal-mvz');
    const recent = store.recentCustomers().map((customer) => customer.id);
    expect(recent[0]).toBe('aatal-mvz');
    expect(new Set(recent).size).toBe(recent.length);
  });

  it('keeps a plan drawn in the editor and notes it in the log', () => {
    const plan = store.networks()[0];
    const nodes = [...plan.nodes, { ...plan.nodes[0], id: 'neu', label: 'Neuer Baustein', x: 500, y: 600 }];
    const links = [...plan.links, { from: plan.nodes[0].id, to: 'neu', kind: 'lwl' as const, label: '10 Gbit' }];

    store.savePlan(plan.customerId, plan.siteId, nodes, links);

    const saved = store.networks().find((entry) => entry.customerId === plan.customerId && entry.siteId === plan.siteId)!;
    expect(saved.nodes).toHaveLength(plan.nodes.length + 1);
    expect(saved.links).toHaveLength(plan.links.length + 1);
    expect(saved.author).toBe(store.staff().name);
    expect(store.isPlanEdited(plan.customerId, plan.siteId)).toBe(true);
    expect(store.audit()[0].action).toBe('netzplan-geaendert');

    store.resetPlan(plan.customerId, plan.siteId);
    expect(store.networks()[0].nodes).toHaveLength(plan.nodes.length);
    expect(store.isPlanEdited(plan.customerId, plan.siteId)).toBe(false);
  });

  it('restores the delivered state on reset', () => {
    store.togglePin('muster-gmbh');
    store.rotateSecret(store.secrets()[0], 'Zwischendurch-Gesetzt-77!');
    store.reset();
    expect(store.pinned()).toEqual(['nordlicht-logistik']);
    expect(store.secrets()[0].password).not.toBe('Zwischendurch-Gesetzt-77!');
  });
});
