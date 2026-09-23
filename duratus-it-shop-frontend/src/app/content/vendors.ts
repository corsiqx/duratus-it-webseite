export interface Vendor {
  /** Key used by the articles (`Product.vendorId`). */
  id: string;
  /** Display name in the shop. */
  name: string;
  /**
   * Brand as Icecat spells it. Used for the lookup `?Brand=…&ProductCode=…`.
   * Aruba Instant On is filed under HPE, Ubiquiti under "Ubiquiti" (not "UniFi").
   */
  icecatBrand: string;
  /** SVG stored in public/logos/vendors, same files as the website. */
  logo: string;
  /** Tailwind height in the partner strip, tuned per logo. */
  stripHeight: string;
  /** Tailwind height on a product card, where the logo replaces the brand name. */
  cardHeight: string;
  /** Part of the official partner list shown on the website. */
  partner: boolean;
  /** Pure image marks without lettering get the brand name as a caption. */
  showName?: boolean;
}

// Logo files: Wikimedia Commons and Simple Icons (Huawei). Marken sind Eigentum der jeweiligen Hersteller;
// Nutzung vor Veröffentlichung mit den Partnerprogrammen abstimmen.
export const VENDORS: readonly Vendor[] = [
  { id: 'microsoft', name: 'Microsoft', icecatBrand: 'Microsoft', logo: 'logos/vendors/microsoft.svg', stripHeight: 'h-7', cardHeight: 'h-4', partner: true },
  { id: 'dell', name: 'Dell Technologies', icecatBrand: 'Dell', logo: 'logos/vendors/dell.svg', stripHeight: 'h-11', cardHeight: 'h-6', partner: true },
  { id: 'hpe', name: 'Hewlett Packard Enterprise', icecatBrand: 'HPE', logo: 'logos/vendors/hpe.svg', stripHeight: 'h-10', cardHeight: 'h-6', partner: true },
  { id: 'cisco', name: 'Cisco', icecatBrand: 'Cisco', logo: 'logos/vendors/cisco.svg', stripHeight: 'h-10', cardHeight: 'h-6', partner: true },
  { id: 'fortinet', name: 'Fortinet', icecatBrand: 'Fortinet', logo: 'logos/vendors/fortinet.svg', stripHeight: 'h-[1.125rem]', cardHeight: 'h-2.5', partner: true },
  { id: 'sophos', name: 'Sophos', icecatBrand: 'Sophos', logo: 'logos/vendors/sophos.svg', stripHeight: 'h-6', cardHeight: 'h-3.5', partner: true },
  { id: 'aruba', name: 'Aruba', icecatBrand: 'HPE', logo: 'logos/vendors/aruba.svg', stripHeight: 'h-10', cardHeight: 'h-6', partner: true },
  { id: 'unifi', name: 'UniFi', icecatBrand: 'Ubiquiti', logo: 'logos/vendors/unifi.svg', stripHeight: 'h-9', cardHeight: 'h-5', partner: true, showName: true },
  { id: 'huawei', name: 'Huawei', icecatBrand: 'Huawei', logo: 'logos/vendors/huawei.svg', stripHeight: 'h-9', cardHeight: 'h-5', partner: true, showName: true },
  { id: 'veeam', name: 'Veeam', icecatBrand: 'Veeam', logo: 'logos/vendors/veeam.svg', stripHeight: 'h-6', cardHeight: 'h-3.5', partner: true },
  { id: '3cx', name: '3CX', icecatBrand: '3CX', logo: 'logos/vendors/3cx.svg', stripHeight: 'h-8', cardHeight: 'h-4', partner: true },

  // Ergänzende Hersteller ohne Partnerlogo: runden die Lösungen der Partner ab
  // (USV für die Server, Tischtelefone für die 3CX-Anlage). Kein Logo im Repo, daher Textmarke.
  { id: 'apc', name: 'APC by Schneider Electric', icecatBrand: 'APC', logo: '', stripHeight: '', cardHeight: '', partner: false },
  { id: 'yealink', name: 'Yealink', icecatBrand: 'Yealink', logo: '', stripHeight: '', cardHeight: '', partner: false },
];

export const vendorById = (id: string): Vendor | undefined => VENDORS.find((vendor) => vendor.id === id);

/** Only the brands shown as partners on the website. */
export const PARTNER_VENDORS: readonly Vendor[] = VENDORS.filter((vendor) => vendor.partner);
