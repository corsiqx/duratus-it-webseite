export interface HardwareCategory {
  title: string;
  icon: string;
  text: string;
  /** Matching managed service line id (see managed-services.ts). */
  serviceId: string;
  serviceLabel: string;
}

export const HARDWARE_CATEGORIES: readonly HardwareCategory[] = [
  {
    title: 'Workplace',
    icon: 'phosphorLaptop',
    text: 'Notebooks, Desktop-PCs und Thin Clients für den modernen Arbeitsplatz.',
    serviceId: 'workstation',
    serviceLabel: 'Managed Workstation',
  },
  {
    title: 'Peripherie',
    icon: 'phosphorMonitor',
    text: 'Monitore, Docking-Stations, Eingabegeräte und Headsets für jeden Rollout.',
    serviceId: 'workstation',
    serviceLabel: 'Managed Workstation',
  },
  {
    title: 'Networking',
    icon: 'phosphorNetwork',
    text: 'Switches, Access Points, Router und SD-WAN-Geräte für stabile Netzwerke.',
    serviceId: 'firewall',
    serviceLabel: 'Managed Firewall',
  },
  {
    title: 'Security',
    icon: 'phosphorShieldCheck',
    text: 'Firewalls, EDR-Lizenzen und 2FA-Hardware für durchgängigen Schutz.',
    serviceId: 'firewall',
    serviceLabel: 'Managed Firewall',
  },
  {
    title: 'Server',
    icon: 'phosphorHardDrives',
    text: 'Rack- und Tower-Server sowie hyperkonvergente Systeme.',
    serviceId: 'server',
    serviceLabel: 'Managed Server',
  },
  {
    title: 'Storage',
    icon: 'phosphorDatabase',
    text: 'NAS-Systeme, Backup-Appliances und Cloud-Storage-Kontingente.',
    serviceId: 'backup',
    serviceLabel: 'Managed Backup',
  },
];

export const PRODUCT_PRINCIPLES = [
  {
    title: 'Mit passendem Betrieb',
    text: 'Hardware kommt mit dem passenden Managed-Service-Paket, damit Beschaffung und Betrieb zusammenpassen.',
    icon: 'phosphorStack',
  },
  {
    title: 'Zertifizierte Einkaufswege',
    text: 'Bezug nur über zertifizierte Distributoren und Herstellerprogramme. Originalware mit geregelter Garantie.',
    icon: 'phosphorSealCheck',
  },
  {
    title: 'Leasing und Finanzierung',
    text: 'Über unsere Leasing-Partner verteilen Sie Investitionen auf planbare Monatsraten.',
    icon: 'phosphorCreditCard',
  },
  {
    title: 'Direktversand',
    text: 'Wo möglich liefert der Distributor direkt. Das spart Zeit und hält Lieferzeiten aktuell.',
    icon: 'phosphorTruck',
  },
  {
    title: 'Schnelle Angebote',
    text: 'Angebote entstehen automatisiert aus aktuellen Preislisten, inklusive Bestand und Lieferzeit.',
    icon: 'phosphorLightning',
  },
  {
    title: 'Nahtloser Übergang in den Betrieb',
    text: 'Jedes bestellte Gerät landet automatisch als Onboarding-Vorgang im Service-System.',
    icon: 'phosphorArrowsClockwise',
  },
] as const;

export interface Vendor {
  name: string;
  /** SVG stored in public/logos/vendors. */
  logo: string;
  /** Tailwind height class, tuned per logo so wide wordmarks and square marks look equally heavy. */
  height: string;
  /** Pure image marks without lettering get the brand name as a caption. */
  showName?: boolean;
}

// Logo files: Wikimedia Commons and Simple Icons (Huawei). Marken sind Eigentum der jeweiligen Hersteller;
// Nutzung vor Veröffentlichung mit den Partnerprogrammen abstimmen.
export const VENDORS: readonly Vendor[] = [
  { name: 'Microsoft', logo: 'logos/vendors/microsoft.svg', height: 'h-7' },
  { name: 'Dell Technologies', logo: 'logos/vendors/dell.svg', height: 'h-11' },
  { name: 'Hewlett Packard Enterprise', logo: 'logos/vendors/hpe.svg', height: 'h-10' },
  { name: 'Cisco', logo: 'logos/vendors/cisco.svg', height: 'h-10' },
  { name: 'Fortinet', logo: 'logos/vendors/fortinet.svg', height: 'h-[1.125rem]' },
  { name: 'Sophos', logo: 'logos/vendors/sophos.svg', height: 'h-6' },
  { name: 'Aruba', logo: 'logos/vendors/aruba.svg', height: 'h-10' },
  { name: 'UniFi', logo: 'logos/vendors/unifi.svg', height: 'h-9', showName: true },
  { name: 'Huawei', logo: 'logos/vendors/huawei.svg', height: 'h-9', showName: true },
  { name: 'Veeam', logo: 'logos/vendors/veeam.svg', height: 'h-6' },
  { name: '3CX', logo: 'logos/vendors/3cx.svg', height: 'h-8' },
];
