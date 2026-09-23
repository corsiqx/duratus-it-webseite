// Generates the local product illustrations in public/artikel (no remote images anywhere in the project).
// Flat line art on a light frame, drawn with the brand colours. Run: node tools/make-product-art.mjs
import { writeFileSync } from 'node:fs';

const NAVY = '#0d1f3c';
const BLUE = '#2563eb';
const SOFT = '#dbeafe';
const TEAL = '#1b9e8c';
const SLATE = '#94a3b8';

/** Shared frame: light card, blue halo, artwork centred in a 400x300 box. */
const frame = (label, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${label}">
  <rect width="400" height="300" fill="#f8fafc"/>
  <circle cx="200" cy="148" r="108" fill="#eff6ff"/>
  <g fill="none" stroke="${NAVY}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
${body}
  </g>
</svg>
`;

const ports = (x, y, count, w = 18, h = 12, gap = 8) =>
  Array.from(
    { length: count },
    (_, i) => `    <rect x="${x + i * (w + gap)}" y="${y}" width="${w}" height="${h}" rx="2" fill="${SOFT}"/>`,
  ).join('\n');

const art = {
  notebook: frame(
    'Notebook',
    `    <path d="M118 100h164a8 8 0 0 1 8 8v104H110V108a8 8 0 0 1 8-8Z" fill="#fff"/>
    <rect x="124" y="114" width="152" height="92" rx="4" fill="${SOFT}" stroke="none"/>
    <path d="M86 212h228l16 22a6 6 0 0 1-5 9H75a6 6 0 0 1-5-9Z" fill="#fff"/>
    <path d="M172 220h56" stroke="${SLATE}"/>
    <path d="M140 132h60M140 150h92M140 168h72" stroke="${BLUE}" stroke-width="5"/>`,
  ),

  desktop: frame(
    'Desktop-PC',
    `    <rect x="142" y="70" width="116" height="164" rx="10" fill="#fff"/>
    <path d="M142 112h116"/>
    <circle cx="200" cy="91" r="9" fill="${TEAL}" stroke="none"/>
    <rect x="162" y="128" width="76" height="10" rx="5" fill="${SOFT}" stroke="none"/>
    <rect x="162" y="150" width="76" height="10" rx="5" fill="${SOFT}" stroke="none"/>
    <path d="M166 180h68M166 196h68M166 212h44" stroke="${BLUE}" stroke-width="5"/>`,
  ),

  'thin-client': frame(
    'Thin Client',
    `    <rect x="108" y="140" width="184" height="62" rx="12" fill="#fff"/>
    <circle cx="132" cy="171" r="8" fill="${TEAL}" stroke="none"/>
${ports(158, 165, 4)}
    <path d="M140 202v18M260 202v18" stroke="${SLATE}"/>
    <path d="M118 222h164"/>`,
  ),

  monitor: frame(
    'Monitor',
    `    <rect x="80" y="74" width="240" height="146" rx="10" fill="#fff"/>
    <rect x="94" y="88" width="212" height="112" rx="4" fill="${SOFT}" stroke="none"/>
    <path d="M124 176h60v-24h-60zM196 176h80v-52h-80z" fill="#fff" stroke="${BLUE}" stroke-width="4"/>
    <path d="M200 220v22M164 242h72"/>`,
  ),

  dock: frame(
    'Dockingstation',
    `    <rect x="104" y="146" width="192" height="50" rx="14" fill="#fff"/>
${ports(126, 164, 5, 20, 14, 6)}
    <path d="M104 172H74a14 14 0 0 0-14 14v26" stroke="${BLUE}"/>
    <circle cx="60" cy="220" r="8" fill="${BLUE}" stroke="none"/>
    <path d="M296 160h34" stroke="${SLATE}"/>`,
  ),

  keyboard: frame(
    'Tastatur und Maus',
    `    <rect x="66" y="152" width="200" height="82" rx="12" fill="#fff"/>
    <path d="M84 172h28M124 172h28M164 172h28M204 172h28M84 194h28M124 194h68M204 194h28M104 216h124" stroke="${BLUE}" stroke-width="7"/>
    <path d="M300 152c16 0 26 14 26 34s-10 34-26 34-26-14-26-34 10-34 26-34Z" fill="#fff"/>
    <path d="M300 152v28" stroke="${SLATE}"/>`,
  ),

  headset: frame(
    'Headset',
    `    <path d="M118 176v-16a82 82 0 0 1 164 0v16" fill="none"/>
    <rect x="98" y="168" width="40" height="66" rx="16" fill="#fff"/>
    <rect x="262" y="168" width="40" height="66" rx="16" fill="#fff"/>
    <path d="M138 196h20" stroke="${SOFT}" stroke-width="10"/>
    <path d="M262 214c-22 0-30 18-48 18" stroke="${BLUE}"/>
    <circle cx="208" cy="232" r="9" fill="${BLUE}" stroke="none"/>`,
  ),

  switch: frame(
    'Switch',
    `    <rect x="66" y="128" width="268" height="72" rx="10" fill="#fff"/>
${ports(88, 142, 8, 20, 12, 8)}
${ports(88, 170, 8, 20, 12, 8)}
    <circle cx="310" cy="148" r="6" fill="${TEAL}" stroke="none"/>
    <circle cx="310" cy="176" r="6" fill="${BLUE}" stroke="none"/>
    <path d="M90 200v16M310 200v16" stroke="${SLATE}"/>`,
  ),

  'access-point': frame(
    'Access Point',
    `    <ellipse cx="200" cy="200" rx="86" ry="30" fill="#fff"/>
    <path d="M114 200v-12a86 30 0 0 1 172 0v12" fill="#fff"/>
    <circle cx="200" cy="188" r="10" fill="${TEAL}" stroke="none"/>
    <path d="M148 118a74 74 0 0 1 104 0" stroke="${BLUE}"/>
    <path d="M168 142a44 44 0 0 1 64 0" stroke="${BLUE}"/>`,
  ),

  router: frame(
    'Router',
    `    <rect x="92" y="164" width="216" height="62" rx="12" fill="#fff"/>
    <path d="M132 164V96M268 164V96" stroke="${NAVY}"/>
    <circle cx="132" cy="90" r="8" fill="${BLUE}" stroke="none"/>
    <circle cx="268" cy="90" r="8" fill="${BLUE}" stroke="none"/>
${ports(124, 188, 4, 22, 14, 10)}
    <circle cx="288" cy="195" r="6" fill="${TEAL}" stroke="none"/>`,
  ),

  firewall: frame(
    'Firewall',
    `    <rect x="76" y="176" width="248" height="58" rx="10" fill="#fff"/>
${ports(100, 196, 6, 20, 12, 10)}
    <path d="M200 60l50 19v42c0 31-23 52-50 61-27-9-50-30-50-61V79Z" fill="#fff" stroke="${BLUE}"/>
    <path d="M178 122l17 18 30-32" stroke="${TEAL}" stroke-width="7"/>`,
  ),

  'security-key': frame(
    'Sicherheitsschluessel',
    `    <rect x="146" y="90" width="108" height="150" rx="22" fill="#fff"/>
    <path d="M178 66h44v24h-44z" fill="${SOFT}"/>
    <circle cx="200" cy="146" r="26" stroke="${BLUE}"/>
    <path d="M200 172v42M186 196h28" stroke="${BLUE}"/>
    <circle cx="200" cy="146" r="9" fill="${TEAL}" stroke="none"/>`,
  ),

  'server-rack': frame(
    'Rack-Server',
    `    <rect x="120" y="58" width="160" height="196" rx="12" fill="#fff"/>
    <path d="M120 106h160M120 154h160M120 202h160"/>
    <circle cx="146" cy="82" r="6" fill="${TEAL}" stroke="none"/>
    <circle cx="146" cy="130" r="6" fill="${BLUE}" stroke="none"/>
    <circle cx="146" cy="178" r="6" fill="${BLUE}" stroke="none"/>
    <circle cx="146" cy="226" r="6" fill="${SLATE}" stroke="none"/>
    <path d="M170 82h84M170 130h84M170 178h84M170 226h84" stroke="${SOFT}" stroke-width="10"/>`,
  ),

  'server-tower': frame(
    'Tower-Server',
    `    <rect x="136" y="60" width="128" height="180" rx="12" fill="#fff"/>
    <rect x="156" y="82" width="88" height="18" rx="4" fill="${SOFT}" stroke="none"/>
    <rect x="156" y="110" width="88" height="18" rx="4" fill="${SOFT}" stroke="none"/>
    <rect x="156" y="138" width="88" height="18" rx="4" fill="${SOFT}" stroke="none"/>
    <path d="M156 180h88M156 200h88" stroke="${BLUE}" stroke-width="6"/>
    <circle cx="164" cy="224" r="6" fill="${TEAL}" stroke="none"/>`,
  ),

  nas: frame(
    'NAS-System',
    `    <rect x="132" y="76" width="136" height="164" rx="12" fill="#fff"/>
    <path d="M156 100h88M156 134h88M156 168h88M156 202h88" stroke="${BLUE}" stroke-width="8"/>
    <circle cx="252" cy="100" r="5" fill="${TEAL}" stroke="none"/>
    <circle cx="252" cy="134" r="5" fill="${TEAL}" stroke="none"/>
    <circle cx="252" cy="168" r="5" fill="${SLATE}" stroke="none"/>
    <circle cx="252" cy="202" r="5" fill="${SLATE}" stroke="none"/>`,
  ),

  'backup-appliance': frame(
    'Backup-Appliance',
    `    <rect x="84" y="170" width="232" height="64" rx="12" fill="#fff"/>
${ports(110, 192, 5, 24, 16, 10)}
    <path d="M200 60a60 60 0 1 1-56 82" stroke="${BLUE}"/>
    <path d="M132 118l12 26 26-12" stroke="${BLUE}"/>
    <circle cx="200" cy="102" r="13" fill="${TEAL}" stroke="none"/>`,
  ),

  license: frame(
    'Lizenz',
    `    <rect x="94" y="78" width="212" height="148" rx="12" fill="#fff"/>
    <path d="M124 116h96M124 142h152M124 168h120" stroke="${BLUE}" stroke-width="6"/>
    <circle cx="262" cy="196" r="24" fill="#fff" stroke="${TEAL}"/>
    <path d="M251 196l8 9 15-17" stroke="${TEAL}" stroke-width="6"/>`,
  ),

  'desk-phone': frame(
    'Tischtelefon',
    `    <path d="M110 232h180a10 10 0 0 0 10-10v-34H100v34a10 10 0 0 0 10 10Z" fill="#fff"/>
    <rect x="128" y="94" width="144" height="94" rx="10" fill="#fff"/>
    <rect x="144" y="110" width="112" height="34" rx="4" fill="${SOFT}" stroke="none"/>
    <path d="M150 162h20M186 162h20M222 162h20" stroke="${BLUE}" stroke-width="7"/>
    <path d="M300 188v-24a22 22 0 0 0-22-22" stroke="${SLATE}"/>
    <circle cx="200" cy="210" r="8" fill="${TEAL}" stroke="none"/>`,
  ),

  ups: frame(
    'Unterbrechungsfreie Stromversorgung',
    `    <rect x="128" y="94" width="144" height="146" rx="12" fill="#fff"/>
    <path d="M204 114l-32 52h26l-6 44 34-56h-26Z" fill="${SOFT}" stroke="${BLUE}"/>
    <path d="M152 214h96" stroke="${BLUE}" stroke-width="6"/>
    <circle cx="152" cy="112" r="6" fill="${TEAL}" stroke="none"/>`,
  ),

  // ---------------------------------------------------------------- Switches nach Portzahl
  // Ein Etagen-Switch mit 48 Ports sieht anders aus als einer mit 8. Solange keine Herstellerfotos
  // vorliegen, soll die Abbildung wenigstens die Bauform und die Portzahl richtig zeigen.
  'switch-8': frame(
    'Switch mit 8 Anschlüssen',
    `    <rect x="84" y="128" width="232" height="60" rx="10" fill="#fff"/>
${ports(104, 148, 8, 18, 14, 6)}
    <circle cx="298" cy="141" r="5" fill="${TEAL}" stroke="none"/>
    <circle cx="298" cy="175" r="5" fill="${BLUE}" stroke="none"/>
    <path d="M110 188v22M290 188v22" stroke="${SLATE}"/>
    <path d="M92 210h216"/>`,
  ),

  'switch-8-poe': frame(
    'Switch mit 8 Anschlüssen und PoE',
    `    <rect x="84" y="128" width="232" height="60" rx="10" fill="#fff"/>
${ports(104, 152, 8, 18, 14, 6)}
    <path d="M110 142h72" stroke="${TEAL}" stroke-width="5"/>
    <path d="M196 133l-8 12h7l-2 11 10-14h-7Z" fill="${TEAL}" stroke="none"/>
    <circle cx="298" cy="141" r="5" fill="${TEAL}" stroke="none"/>
    <path d="M110 188v22M290 188v22" stroke="${SLATE}"/>
    <path d="M92 210h216"/>`,
  ),

  'switch-24': frame(
    'Switch mit 24 Anschlüssen',
    `    <rect x="52" y="118" width="296" height="80" rx="10" fill="#fff"/>
${ports(70, 132, 12, 18, 12, 5)}
${ports(70, 164, 12, 18, 12, 5)}
    <circle cx="328" cy="138" r="5" fill="${TEAL}" stroke="none"/>
    <circle cx="328" cy="170" r="5" fill="${BLUE}" stroke="none"/>
    <path d="M52 132h-14v52h14M348 132h14v52h-14" stroke="${SLATE}"/>
    <path d="M62 198v16M338 198v16" stroke="${SLATE}"/>`,
  ),

  'switch-24-poe': frame(
    'Switch mit 24 Anschlüssen und PoE',
    `    <rect x="52" y="112" width="296" height="92" rx="10" fill="#fff"/>
    <path d="M70 128l-8 12h7l-2 11 10-14h-7Z" fill="${TEAL}" stroke="none"/>
    <path d="M86 134h44" stroke="${TEAL}" stroke-width="4"/>
${ports(70, 148, 12, 18, 12, 5)}
${ports(70, 176, 12, 18, 12, 5)}
    <circle cx="328" cy="154" r="5" fill="${TEAL}" stroke="none"/>
    <circle cx="328" cy="182" r="5" fill="${BLUE}" stroke="none"/>
    <path d="M52 132h-14v52h14M348 132h14v52h-14" stroke="${SLATE}"/>
    <path d="M62 204v14M338 204v14" stroke="${SLATE}"/>`,
  ),

  'switch-48': frame(
    'Switch mit 48 Anschlüssen',
    `    <rect x="40" y="114" width="320" height="88" rx="10" fill="#fff"/>
${ports(56, 130, 24, 9, 12, 3)}
${ports(56, 162, 24, 9, 12, 3)}
    <circle cx="344" cy="136" r="5" fill="${TEAL}" stroke="none"/>
    <circle cx="344" cy="168" r="5" fill="${BLUE}" stroke="none"/>
    <path d="M40 132h-14v52h14M360 132h14v52h-14" stroke="${SLATE}"/>
    <path d="M50 202v16M350 202v16" stroke="${SLATE}"/>`,
  ),

  // ---------------------------------------------------------------- Access Points nach Bauform
  'ap-wall': frame(
    'Access Point für die Wanddose',
    `    <rect x="150" y="122" width="100" height="120" rx="10" fill="#fff"/>
    <path d="M150 208h100" />
    <circle cx="200" cy="160" r="9" fill="${TEAL}" stroke="none"/>
${ports(168, 218, 2, 26, 14, 10)}
    <path d="M148 100a74 74 0 0 1 104 0" stroke="${BLUE}"/>
    <path d="M168 76a44 44 0 0 1 64 0" stroke="${BLUE}"/>`,
  ),

  // ---------------------------------------------------------------- Firewalls nach Bauform
  'firewall-desktop': frame(
    'Firewall im Tischgehäuse',
    `    <rect x="96" y="176" width="208" height="54" rx="10" fill="#fff"/>
${ports(118, 194, 5, 22, 14, 10)}
    <circle cx="286" cy="186" r="5" fill="${TEAL}" stroke="none"/>
    <path d="M200 62l46 17v40c0 29-21 49-46 57-25-8-46-28-46-57V79Z" fill="#fff" stroke="${BLUE}"/>
    <path d="M180 120l16 17 28-30" stroke="${TEAL}" stroke-width="7"/>`,
  ),

  'firewall-rack': frame(
    'Firewall im 19-Zoll-Gehäuse',
    `    <rect x="56" y="176" width="288" height="56" rx="8" fill="#fff"/>
    <path d="M56 188h-16v32h16M344 188h16v32h-16" stroke="${SLATE}"/>
${ports(84, 194, 7, 20, 14, 8)}
    <circle cx="316" cy="188" r="5" fill="${TEAL}" stroke="none"/>
    <circle cx="316" cy="216" r="5" fill="${BLUE}" stroke="none"/>
    <path d="M200 62l46 17v40c0 29-21 49-46 57-25-8-46-28-46-57V79Z" fill="#fff" stroke="${BLUE}"/>
    <path d="M180 120l16 17 28-30" stroke="${TEAL}" stroke-width="7"/>`,
  ),

  // ---------------------------------------------------------------- Gateway mit eingebautem Controller
  gateway: frame(
    'Gateway mit Verwaltung',
    `    <rect x="132" y="138" width="136" height="86" rx="12" fill="#fff"/>
    <rect x="150" y="156" width="100" height="26" rx="4" fill="${SOFT}" stroke="none"/>
${ports(152, 196, 4, 20, 12, 6)}
    <circle cx="252" cy="202" r="5" fill="${TEAL}" stroke="none"/>
    <path d="M148 116a74 74 0 0 1 104 0" stroke="${BLUE}"/>
    <path d="M168 92h64" stroke="${BLUE}"/>`,
  ),

  // ---------------------------------------------------------------- Lizenzen nach Art
  'license-cloud': frame(
    'Lizenz für Cloud-Dienste',
    `    <rect x="108" y="126" width="140" height="120" rx="10" fill="#fff"/>
    <path d="M132 160h92M132 186h92M132 212h60" stroke="${BLUE}" stroke-width="6"/>
    <path d="M214 112a44 44 0 0 1 84 10 30 30 0 0 1-6 59h-70a34 34 0 0 1-8-69Z" fill="#fff" stroke="${NAVY}"/>
    <path d="M240 140l14 15 26-28" stroke="${TEAL}" stroke-width="7"/>`,
  ),

  'license-backup': frame(
    'Lizenz für die Datensicherung',
    `    <rect x="94" y="120" width="132" height="116" rx="10" fill="#fff"/>
    <path d="M118 152h84M118 178h84M118 204h52" stroke="${BLUE}" stroke-width="6"/>
    <path d="M280 96l44 16v40c0 29-20 49-44 57-24-8-44-28-44-57v-40Z" fill="#fff" stroke="${NAVY}"/>
    <path d="M280 128a26 26 0 1 1-24 36" stroke="${TEAL}" stroke-width="5"/>
    <path d="M250 150l8 16 16-8" stroke="${TEAL}" stroke-width="5"/>`,
  ),

  'license-phone': frame(
    'Lizenz für die Telefonanlage',
    `    <rect x="94" y="120" width="132" height="116" rx="10" fill="#fff"/>
    <path d="M118 152h84M118 178h84M118 204h52" stroke="${BLUE}" stroke-width="6"/>
    <path d="M258 168v-14a46 46 0 0 1 92 0v14" fill="none" stroke="${NAVY}"/>
    <rect x="244" y="162" width="30" height="50" rx="12" fill="#fff"/>
    <rect x="334" y="162" width="30" height="50" rx="12" fill="#fff"/>
    <path d="M334 206c-16 0-22 14-36 14" stroke="${BLUE}"/>
    <circle cx="292" cy="220" r="8" fill="${BLUE}" stroke="none"/>`,
  ),
};

for (const [name, svg] of Object.entries(art)) writeFileSync(`public/artikel/${name}.svg`, svg);
console.log(`${Object.keys(art).length} Produktbilder geschrieben.`);
