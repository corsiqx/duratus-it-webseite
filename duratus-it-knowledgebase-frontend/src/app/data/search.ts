import { Injectable, computed, inject } from '@angular/core';
import { KbStore } from './kb-store';

export type HitType = 'kunde' | 'kontakt' | 'zugang' | 'geraet' | 'netzplan' | 'dokument' | 'taetigkeit' | 'lizenz';

export interface SearchHit {
  id: string;
  type: HitType;
  title: string;
  subtitle: string;
  customerName: string | null;
  icon: string;
  link: readonly unknown[];
  /** Fields the query is matched against, already lower-cased. */
  haystack: string;
}

export const HIT_TYPE: Record<HitType, { label: string; icon: string }> = {
  kunde: { label: 'Kunde', icon: 'phosphorBuildings' },
  kontakt: { label: 'Ansprechpartner', icon: 'phosphorUser' },
  zugang: { label: 'Zugang', icon: 'phosphorKey' },
  geraet: { label: 'Gerät', icon: 'phosphorHardDrives' },
  netzplan: { label: 'Netzwerkplan', icon: 'phosphorTreeStructure' },
  dokument: { label: 'Dokument', icon: 'phosphorBookOpen' },
  taetigkeit: { label: 'Tätigkeit', icon: 'phosphorClipboardText' },
  lizenz: { label: 'Lizenz', icon: 'phosphorCertificate' },
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss');

/**
 * One search across the whole knowledge base. Passwords are deliberately not part of the index:
 * a search must never reveal a credential, only the entry that holds it.
 */
@Injectable({ providedIn: 'root' })
export class SearchIndex {
  private readonly store = inject(KbStore);

  readonly entries = computed<readonly SearchHit[]>(() => {
    const store = this.store;
    const nameOf = (customerId: string) => store.customer(customerId)?.name ?? '';
    const hits: SearchHit[] = [];

    for (const customer of store.customers()) {
      hits.push({
        id: customer.id,
        type: 'kunde',
        title: customer.name,
        subtitle: `${customer.branch}, ${customer.employees} Beschäftigte`,
        customerName: null,
        icon: HIT_TYPE.kunde.icon,
        link: ['/kunden', customer.id],
        haystack: normalize([customer.name, customer.shortName, customer.branch, customer.responsible, ...customer.tags].join(' ')),
      });
    }

    for (const contact of store.contacts()) {
      hits.push({
        id: contact.id,
        type: 'kontakt',
        title: contact.name,
        subtitle: contact.role,
        customerName: nameOf(contact.customerId),
        icon: HIT_TYPE.kontakt.icon,
        link: ['/kunden', contact.customerId, 'kontakte'],
        haystack: normalize([contact.name, contact.role, contact.email, contact.phone, nameOf(contact.customerId)].join(' ')),
      });
    }

    for (const secret of store.secrets()) {
      hits.push({
        id: secret.id,
        type: 'zugang',
        title: secret.name,
        subtitle: `Benutzer ${secret.username}`,
        customerName: nameOf(secret.customerId),
        icon: HIT_TYPE.zugang.icon,
        link: ['/zugaenge'],
        haystack: normalize([secret.name, secret.username, secret.url ?? '', ...secret.tags, nameOf(secret.customerId)].join(' ')),
      });
    }

    for (const asset of store.assets()) {
      hits.push({
        id: asset.id,
        type: 'geraet',
        title: asset.name,
        subtitle: `${asset.vendor} ${asset.model}`,
        customerName: nameOf(asset.customerId),
        icon: HIT_TYPE.geraet.icon,
        link: ['/inventar'],
        haystack: normalize(
          [asset.name, asset.vendor, asset.model, asset.serial, asset.ip ?? '', asset.os ?? '', asset.location, nameOf(asset.customerId)].join(' '),
        ),
      });
    }

    for (const plan of store.networks()) {
      const site = store.site(plan.siteId);
      hits.push({
        id: `${plan.customerId}-${plan.siteId}`,
        type: 'netzplan',
        title: `Netzwerkplan ${site?.name ?? ''}`,
        subtitle: plan.summary.slice(0, 90),
        customerName: nameOf(plan.customerId),
        icon: HIT_TYPE.netzplan.icon,
        link: ['/netzwerk', plan.customerId, plan.siteId],
        haystack: normalize(
          [
            site?.name ?? '',
            site?.city ?? '',
            plan.summary,
            nameOf(plan.customerId),
            ...plan.vlans.map((vlan) => `${vlan.name} ${vlan.subnet} vlan ${vlan.id}`),
            ...plan.nodes.map((node) => node.label),
          ].join(' '),
        ),
      });
    }

    for (const doc of store.docs()) {
      hits.push({
        id: doc.id,
        type: 'dokument',
        title: doc.title,
        subtitle: doc.summary.slice(0, 90),
        customerName: doc.customerId ? nameOf(doc.customerId) : 'Allgemein',
        icon: HIT_TYPE.dokument.icon,
        link: ['/dokumentation', doc.id],
        haystack: normalize(
          [doc.title, doc.summary, ...doc.tags, doc.author, ...doc.sections.map((section) => `${section.heading} ${section.body}`)].join(' '),
        ),
      });
    }

    for (const change of store.changes()) {
      hits.push({
        id: change.id,
        type: 'taetigkeit',
        title: change.title,
        subtitle: `${change.date}, ${change.technician}`,
        customerName: nameOf(change.customerId),
        icon: HIT_TYPE.taetigkeit.icon,
        link: ['/taetigkeiten', change.id],
        haystack: normalize([change.id, change.title, change.summary, change.technician, nameOf(change.customerId)].join(' ')),
      });
    }

    for (const license of store.licenses()) {
      hits.push({
        id: license.id,
        type: 'lizenz',
        title: license.name,
        subtitle: `${license.vendor}, ${license.quantity} ${license.unit}`,
        customerName: nameOf(license.customerId),
        icon: HIT_TYPE.lizenz.icon,
        link: ['/lizenzen'],
        haystack: normalize([license.name, license.vendor, license.note, nameOf(license.customerId)].join(' ')),
      });
    }

    return hits;
  });

  /** All words of the query have to appear. A hit in the title ranks above one in the body. */
  search(query: string, limit = 40): readonly SearchHit[] {
    const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    return this.entries()
      .map((hit) => {
        if (!words.every((word) => hit.haystack.includes(word))) return null;
        const title = normalize(hit.title);
        const score = words.reduce((sum, word) => sum + (title.startsWith(word) ? 3 : title.includes(word) ? 2 : 1), 0);
        return { hit, score };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.hit);
  }
}
