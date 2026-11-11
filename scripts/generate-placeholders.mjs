import fs from 'node:fs';
import path from 'node:path';

const dirs = [
  'public/images/plays',
  'public/images/actors',
];

dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

const stageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <radialGradient id="spotlight1" cx="50%" cy="10%" r="80%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="60%" stop-color="#e50914" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="#050505"/>
  <rect width="1200" height="800" fill="url(#spotlight1)"/>
  
  <!-- Architectural grid lines -->
  <line x1="100" y1="0" x2="100" y2="800" stroke="#27272a" stroke-width="1" stroke-dasharray="4 8"/>
  <line x1="600" y1="0" x2="600" y2="800" stroke="#27272a" stroke-width="1" stroke-dasharray="4 8"/>
  <line x1="1100" y1="0" x2="1100" y2="800" stroke="#27272a" stroke-width="1" stroke-dasharray="4 8"/>
  
  <!-- Stage Floor Horizon -->
  <polygon points="0,580 1200,580 1200,800 0,800" fill="url(#floor)"/>
  <line x1="0" y1="580" x2="1200" y2="580" stroke="#e50914" stroke-width="2"/>
  
  <!-- Overhead Stage Light Beams -->
  <polygon points="600,0 350,580 850,580" fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="600" cy="580" r="140" fill="#ffffff" fill-opacity="0.08"/>
  
  <!-- Text -->
  <text x="600" y="440" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="56" fill="#ffffff" text-anchor="middle" letter-spacing="4">KISELJUS TEATER</text>
  <text x="600" y="490" font-family="monospace" font-size="20" fill="#e50914" text-anchor="middle" letter-spacing="6">LOOTSI 8 · TALLINN</text>
</svg>
`;

const actorPlaceholderSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#121214"/>
  <circle cx="300" cy="300" r="130" fill="#26262a"/>
  <path d="M120 720 C 140 480, 460 480, 480 720" fill="#26262a"/>
  <text x="300" y="760" font-family="monospace" font-size="18" fill="#71717a" text-anchor="middle" letter-spacing="4">NÄITLEJA / АКТРИСА</text>
</svg>
`;

function createPlayPoster(title, author, subtitle, accentColor) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="70%" stop-color="#141416"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <radialGradient id="accentGlow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bgGrad)"/>
  <rect width="1200" height="800" fill="url(#accentGlow)"/>

  <!-- Architectural borders -->
  <rect x="40" y="40" width="1120" height="720" fill="none" stroke="#27272a" stroke-width="1"/>
  <rect x="52" y="52" width="1096" height="696" fill="none" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="1"/>

  <!-- Dramatic Center Shape -->
  <circle cx="600" cy="340" r="160" fill="none" stroke="${accentColor}" stroke-width="3" stroke-dasharray="6 12"/>
  <circle cx="600" cy="340" r="130" fill="${accentColor}" fill-opacity="0.08"/>

  <text x="600" y="240" font-family="monospace" font-size="16" fill="${accentColor}" text-anchor="middle" letter-spacing="8">// ${author.toUpperCase()}</text>
  <text x="600" y="370" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="64" fill="#ffffff" text-anchor="middle" letter-spacing="4">${title.toUpperCase()}</text>
  <text x="600" y="430" font-family="monospace" font-size="20" fill="#a1a1aa" text-anchor="middle" letter-spacing="6">${subtitle.toUpperCase()}</text>

  <line x1="450" y1="480" x2="750" y2="480" stroke="#3f3f46" stroke-width="1"/>

  <text x="600" y="530" font-family="monospace" font-size="14" fill="#71717a" text-anchor="middle" letter-spacing="4">KISELJUS TEATER · LOOTSI 8 · TALLINN</text>
  <text x="600" y="700" font-family="monospace" font-size="12" fill="#52525b" text-anchor="middle" letter-spacing="5">PILETIKESKUS.EE</text>
</svg>
`;
}

function createActorPortrait(name, role, initials) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs>
    <linearGradient id="portGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1f1f23"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#portGrad)"/>

  <!-- Minimalist frame -->
  <rect x="24" y="24" width="552" height="752" fill="none" stroke="#27272a" stroke-width="1"/>

  <!-- Stylized Silhouette -->
  <circle cx="300" cy="290" r="120" fill="#2e2e33"/>
  <path d="M 140 680 C 160 460, 440 460, 460 680 Z" fill="#2e2e33"/>

  <!-- Initials Badge -->
  <circle cx="300" cy="290" r="70" fill="#18181b" stroke="#e50914" stroke-width="2"/>
  <text x="300" y="306" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${initials}</text>

  <!-- Typography -->
  <text x="300" y="600" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="800" font-size="26" fill="#ffffff" text-anchor="middle" letter-spacing="1">${name.toUpperCase()}</text>
  <text x="300" y="635" font-family="monospace" font-size="12" fill="#e50914" text-anchor="middle" letter-spacing="2">${role.toUpperCase()}</text>

  <text x="300" y="740" font-family="monospace" font-size="10" fill="#52525b" text-anchor="middle" letter-spacing="4">KISELJUS TEATER · LOOTSI 8</text>
</svg>
`;
}

const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#0a0a0a"/>
  <rect x="8" y="8" width="84" height="84" fill="none" stroke="#e50914" stroke-width="4"/>
  <text x="50" y="68" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="52" fill="#ffffff" text-anchor="middle">K</text>
</svg>
`;

fs.writeFileSync('public/favicon.svg', faviconSvg.trim());
fs.writeFileSync('public/images/placeholder-stage.jpg', stageSvg.trim());
fs.writeFileSync('public/images/placeholder-stage.svg', stageSvg.trim());
fs.writeFileSync('public/images/placeholder-actor.jpg', actorPlaceholderSvg.trim());
fs.writeFileSync('public/images/placeholder-actor.svg', actorPlaceholderSvg.trim());

const plays = [
  { file: 'enesetapja', title: 'Enesetapja', author: 'Nikolai Erdman', sub: 'Tragifarss / Самоубийца', color: '#e50914' },
  { file: 'doktor-zivago', title: 'Doktor Živago', author: 'Boriss Pasternak', sub: 'Teatriseriaal / Доктор Живаго', color: '#6366f1' },
  { file: 'tomba-di-giulietta', title: 'TOMBA DI GIULIETTA', author: 'William Shakespeare', sub: 'Ekskursioon / Гробница Джульетты', color: '#ec4899' },
  { file: 'mann-ist-mann', title: 'Mann ist Mann', author: 'Bertolt Brecht', sub: 'Grotesk / Человек есть человек', color: '#10b981' },
];

plays.forEach(p => {
  const content = createPlayPoster(p.title, p.author, p.sub, p.color).trim();
  fs.writeFileSync(`public/images/plays/${p.file}.jpg`, content);
  fs.writeFileSync(`public/images/plays/${p.file}.svg`, content);
});

const actors = [
  { file: 'anton-kiseljus', name: 'Anton Kiseljus', role: 'Lavastaja / Kunstiline juht', initials: 'AK' },
  { file: 'nika-fedortsuk', name: 'Nika Fedortšuk', role: 'Näitleja / Visuaalkunstnik', initials: 'NF' },
  { file: 'ivan-mysyagin', name: 'Ivan Mysyagin', role: 'Näitleja', initials: 'IM' },
  { file: 'mikhail-pashchuk', name: 'Mikhail Pashchuk', role: 'Näitleja', initials: 'MP' },
  { file: 'valeri-bazenov', name: 'Valeri Baženov', role: 'Näitleja', initials: 'VB' },
  { file: 'pavel-kornyshev', name: 'Pavel Kornyshev', role: 'Näitleja', initials: 'PK' },
  { file: 'nina-zagvozdkina', name: 'Nina Zagvozdkina', role: 'Näitleja', initials: 'NZ' },
  { file: 'sofia-stromberg', name: 'Sofia Strömberg', role: 'Näitleja', initials: 'SS' },
  { file: 'sofia-mihhaljova', name: 'Sofia Mihhaljova', role: 'Näitleja', initials: 'SM' },
  { file: 'katrin-seljugina', name: 'Katrin Seljugina', role: 'Näitleja', initials: 'KS' },
  { file: 'sandra-haljaste', name: 'Sandra Haljaste', role: 'Näitleja', initials: 'SH' },
];

actors.forEach(a => {
  const content = createActorPortrait(a.name, a.role, a.initials).trim();
  fs.writeFileSync(`public/images/actors/${a.file}.jpg`, content);
  fs.writeFileSync(`public/images/actors/${a.file}.svg`, content);
});

console.log('Successfully updated assets with Nika Fedortšuk and updated troupe!');
