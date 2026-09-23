export type NavBadge = 'rotation' | 'fristen' | 'pruefung';

export interface KbNavItem {
  label: string;
  path: string;
  icon: string;
  /** Counter shown next to the label when the area needs attention. */
  badge?: NavBadge;
}

export interface KbNavGroup {
  label: string | null;
  items: readonly KbNavItem[];
}

/** Sidebar structure. Paths match app.routes.ts. */
export const KB_NAV: readonly KbNavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Start', path: '/start', icon: 'phosphorSquaresFour' },
      { label: 'Kundenakten', path: '/kunden', icon: 'phosphorBuildings' },
    ],
  },
  {
    label: 'Wissen',
    items: [
      { label: 'Zugänge', path: '/zugaenge', icon: 'phosphorKey', badge: 'rotation' },
      { label: 'Netzwerkpläne', path: '/netzwerk', icon: 'phosphorTreeStructure' },
      { label: 'Dokumentation', path: '/dokumentation', icon: 'phosphorBookOpen', badge: 'pruefung' },
      { label: 'Tätigkeiten', path: '/taetigkeiten', icon: 'phosphorClipboardText' },
    ],
  },
  {
    label: 'Bestand und Fristen',
    items: [
      { label: 'Inventar', path: '/inventar', icon: 'phosphorHardDrives' },
      { label: 'Lizenzen', path: '/lizenzen', icon: 'phosphorCertificate', badge: 'fristen' },
      { label: 'Notfallpläne', path: '/notfall', icon: 'phosphorSiren' },
    ],
  },
  {
    label: 'Verwaltung',
    items: [{ label: 'Zugriffsprotokoll', path: '/protokoll', icon: 'phosphorListMagnifyingGlass' }],
  },
];
