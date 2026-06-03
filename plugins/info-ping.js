import { performance } from 'node:perf_hooks';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const pingLabel = (ms) => {
  if (ms < 100) return 'EXCELENTE';
  if (ms < 300) return 'ESTABLE';
  return 'LENTO';
};

const handler = async (m, { conn }) => {
  const start = performance.now();
  const botname = 'OSARAGI BOT';

  await conn.sendMessage(m.key.remoteJid, { react: { text: '🖤', key: m.key } });

  try {
    const ping = Math.max(0, Math.round(performance.now() - start));
    
    const up = process.uptime();
    const hh = String(Math.floor(up / 3600)).padStart(2, '0');
    const mm = String(Math.floor((up % 3600) / 60)).padStart(2, '0');
    const ss = String(Math.floor(up % 60)).padStart(2, '0');
    const uptimeText = `${hh}:${mm}:${ss}`;
    
    const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

    // Configurado exactamente para buscar Osaragi.png en la carpeta lib
    const osaragiPath = path.join(process.cwd(), 'lib', 'Osaragi.png');
    const osaragiBuffer = fs.existsSync(osaragiPath) ? fs.readFileSync(osaragiPath) : null;

    const W = 1600;
    const H = 900;

    const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#020202"/>
    <stop offset="50%" stop-color="#050810"/>
    <stop offset="100%" stop-color="#020305"/>
  </linearGradient>
  <radialGradient id="ambLeft" cx="0%" cy="100%" r="60%">
    <stop offset="0%" stop-color="#56b4f7" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#56b4f7" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="ambRight" cx="100%" cy="0%" r="55%">
    <stop offset="0%" stop-color="#8a00d4" stop-opacity="0.20"/>
    <stop offset="100%" stop-color="#8a00d4" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="panelL" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#050a14" stop-opacity="0.95"/>
    <stop offset="100%" stop-color="#020305" stop-opacity="0.95"/>
  </linearGradient>
  <linearGradient id="panelR" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#080414" stop-opacity="0.95"/>
    <stop offset="100%" stop-color="#020105" stop-opacity="0.95"/>
  </linearGradient>
  <linearGradient id="mc" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#0a1224" stop-opacity="0.75"/>
    <stop offset="100%" stop-color="#050812" stop-opacity="0.75"/>
  </linearGradient>
  <linearGradient id="celesteG" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#56b4f7"/>
    <stop offset="100%" stop-color="#3486c4"/>
  </linearGradient>
  <linearGradient id="purpleG" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#a633ff"/>
    <stop offset="100%" stop-color="#8a00d4"/>
  </linearGradient>
  <linearGradient id="outerStroke" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#56b4f7" stop-opacity="0.9"/>
    <stop offset="50%" stop-color="#8a00d4" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="#56b4f7" stop-opacity="0.9"/>
  </linearGradient>
  <filter id="panelShadow" x="-5%" y="-5%" width="110%" height="115%">
    <feDropShadow dx="0" dy="6" stdDeviation="24" flood-color="#000000" flood-opacity="0.85"/>
  </filter>
  <filter id="blur40">
    <feGaussianBlur stdDeviation="40"/>
  </filter>
  <filter id="blur20">
    <feGaussianBlur stdDeviation="20"/>
  </filter>
  <clipPath id="outerFrame">
    <rect x="50" y="50" width="1500" height="800" rx="16"/>
  </clipPath>
</defs>

<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#ambLeft)"/>
<rect width="${W}" height="${H}" fill="url(#ambRight)"/>
<circle cx="160" cy="780" r="250" fill="#56b4f7" opacity="0.08" filter="url(#blur40)"/>
<circle cx="1440" cy="120" r="280" fill="#8a00d4" opacity="0.10" filter="url(#blur40)"/>

<rect x="50" y="50" width="1500" height="800" rx="16" fill="none" stroke="url(#outerStroke)" stroke-width="3"/>
<rect x="58" y="58" width="1484" height="784" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>

<rect x="50" y="50" width="1500" height="120" rx="16" fill="#04070d" fill-opacity="0.95"/>
<rect x="50" y="130" width="1500" height="40" fill="#04070d" fill-opacity="0.95"/>
<line x1="50" y1="170" x2="1550" y2="170" stroke="url(#outerStroke)" stroke-width="2" stroke-opacity="0.7"/>

<text x="96" y="115" fill="#ffffff" font-size="52" font-weight="900" font-family="'Arial Black', sans-serif" letter-spacing="8">OSARAGI SYSTEM</text>
<text x="96" y="148" fill="#56b4f7" font-size="16" font-family="'Courier New', monospace" letter-spacing="5" opacity="0.85">SAKAMOTO DAYS  ·  GOTHIC ASSASSIN INTERFACE</text>

<rect x="1240" y="70" width="290" height="50" rx="8" fill="#03050a" stroke="#56b4f7" stroke-opacity="0.7" stroke-width="1.5"/>
<text x="1385" y="103" text-anchor="middle" fill="#56b4f7" font-size="20" font-weight="700" font-family="'Courier New', monospace" letter-spacing="2">${botname}</text>

<rect x="60" y="185" width="660" height="640" rx="16" fill="url(#panelL)" stroke="#56b4f7" stroke-opacity="0.25" stroke-width="1.5" filter="url(#panelShadow)"/>
<rect x="60" y="185" width="660" height="52" rx="16" fill="#56b4f7" fill-opacity="0.08"/>
<text x="88" y="221" fill="#56b4f7" font-size="20" font-weight="700" font-family="'Courier New', monospace" letter-spacing="4">NETWORK STATUS</text>
<circle cx="626" cy="213" r="4" fill="#ffffff"/>
<text x="614" y="217" text-anchor="end" fill="#56b4f7" font-size="14" font-family="'Courier New', monospace" letter-spacing="1">ONLINE</text>
<line x1="76" y1="237" x2="704" y2="237" stroke="#56b4f7" stroke-opacity="0.15" stroke-width="1"/>

<rect x="80" y="252" width="620" height="84" rx="12" fill="url(#mc)" stroke="#56b4f7" stroke-opacity="0.3" stroke-width="1"/>
<text x="104" y="279" fill="#56b4f7" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">LATENCIA DEL NODO</text>
<text x="104" y="320" fill="#ffffff" font-size="42" font-weight="900" font-family="'Arial Black', sans-serif">${ping}<tspan font-size="20" fill="#56b4f7" opacity="0.9"> ms</tspan></text>
<rect x="540" y="276" width="130" height="34" rx="8" fill="#56b4f7" fill-opacity="0.15" stroke="#56b4f7" stroke-opacity="0.6" stroke-width="1"/>
<text x="605" y="298" text-anchor="middle" fill="#56b4f7" font-size="13" font-weight="700" font-family="'Courier New', monospace" letter-spacing="1">${pingLabel(ping)}</text>

<rect x="80" y="352" width="620" height="80" rx="12" fill="url(#mc)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
<text x="104" y="376" fill="#8a00d4" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">ENGINE / CORE</text>
<text x="104" y="417" fill="#ffffff" font-size="30" font-weight="700" font-family="'Arial Black', sans-serif">Node.js V${process.versions.node}</text>

<rect x="80" y="448" width="620" height="80" rx="12" fill="url(#mc)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
<text x="104" y="472" fill="#8a00d4" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">MEMORY USAGE</text>
<text x="104" y="513" fill="#ffffff" font-size="26" font-weight="700" font-family="'Courier New', monospace">${ramUsage} MB</text>

<rect x="80" y="544" width="298" height="80" rx="12" fill="url(#mc)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
<text x="104" y="568" fill="#8a00d4" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">UPTIME</text>
<text x="104" y="609" fill="#ffffff" font-size="26" font-weight="700" font-family="'Courier New', monospace">${uptimeText}</text>

<rect x="402" y="544" width="298" height="80" rx="12" fill="url(#mc)" stroke="#56b4f7" stroke-opacity="0.25" stroke-width="1"/>
<text x="426" y="568" fill="#56b4f7" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">RENDIMIENTO</text>
<rect x="426" y="578" width="250" height="10" rx="5" fill="#ffffff" fill-opacity="0.1"/>
<rect x="426" y="578" width="250" height="10" rx="5" fill="url(#celesteG)" opacity="0.9"/>
<text x="426" y="608" fill="#56b4f7" font-size="22" font-weight="700" font-family="'Courier New', monospace">ÓPTIMO</text>

<line x1="76" y1="642" x2="704" y2="642" stroke="#56b4f7" stroke-opacity="0.15" stroke-width="1"/>
<text x="88" y="664" fill="#ffffff" font-size="12" font-family="'Courier New', monospace" letter-spacing="2" opacity="0.35">SYSTEM: OPERATIONAL  ·  HOST: PTERODACTYL</text>

<rect x="740" y="185" width="500" height="640" rx="16" fill="url(#panelR)" stroke="#8a00d4" stroke-opacity="0.25" stroke-width="1.5" filter="url(#panelShadow)"/>
<rect x="740" y="185" width="500" height="52" rx="16" fill="#8a00d4" fill-opacity="0.1"/>
<text x="768" y="221" fill="#8a00d4" font-size="20" font-weight="700" font-family="'Courier New', monospace" letter-spacing="4">OSARAGI DATA</text>
<line x1="756" y1="237" x2="1228" y2="237" stroke="#8a00d4" stroke-opacity="0.2" stroke-width="1"/>

<rect x="760" y="252" width="460" height="80" rx="12" fill="url(#mc)" stroke="#8a00d4" stroke-opacity="0.3" stroke-width="1"/>
<text x="784" y="276" fill="#8a00d4" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">PROYECTO</text>
<text x="784" y="317" fill="#ffffff" font-size="26" font-weight="700" font-family="'Arial Black', sans-serif">${botname}</text>

<rect x="760" y="348" width="218" height="80" rx="12" fill="url(#mc)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
<text x="784" y="372" fill="#8a00d4" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">LIBRERÍA</text>
<text x="784" y="413" fill="#ffffff" font-size="20" font-weight="700" font-family="'Arial Black', sans-serif">Baileys</text>

<rect x="1002" y="348" width="218" height="80" rx="12" fill="url(#mc)" stroke="#8a00d4" stroke-opacity="0.25" stroke-width="1"/>
<text x="1026" y="372" fill="#8a00d4" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">ESTADO</text>
<text x="1054" y="409" fill="#8a00d4" font-size="20" font-weight="700" font-family="'Arial Black', sans-serif">ACTIVO</text>

<rect x="760" y="444" width="460" height="80" rx="12" fill="url(#mc)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
<text x="784" y="468" fill="#8a00d4" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">SISTEMA</text>
<text x="784" y="509" fill="#ffffff" font-size="22" font-weight="700" font-family="'Arial Black', sans-serif">Pterodactyl Node Server</text>

<rect x="760" y="540" width="460" height="80" rx="12" fill="url(#mc)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
<text x="784" y="564" fill="#8a00d4" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">PERFIL DE SEGURIDAD</text>
<text x="784" y="605" fill="#ffffff" font-size="20" font-weight="700" font-family="'Arial Black', sans-serif">Order Assassin</text>

<rect x="760" y="636" width="460" height="80" rx="12" fill="url(#mc)" stroke="#56b4f7" stroke-opacity="0.3" stroke-width="1"/>
<text x="784" y="660" fill="#56b4f7" font-size="12" font-family="'Courier New', monospace" letter-spacing="3" opacity="0.8">DEVELOPER</text>
<text x="784" y="701" fill="#ffffff" font-size="24" font-weight="700" font-family="'Arial Black', sans-serif">Allen <tspan fill="#56b4f7">(Creator)</tspan></text>

<line x1="1258" y1="168" x2="1258" y2="830" stroke="url(#purpleG)" stroke-width="4" opacity="0.3" filter="url(#blur20)"/>

<text x="96" y="872" fill="#ffffff" fill-opacity="0.35" font-size="14" font-family="'Courier New', monospace" letter-spacing="3">OSARAGI WA BOT  ·  GOTHIC INTERFACE</text>
<text x="1504" y="872" text-anchor="end" fill="#56b4f7" fill-opacity="0.6" font-size="14" font-family="'Courier New', monospace">© ${botname}</text>
</svg>`;

    let compositor = sharp(Buffer.from(svg)).png();

    if (osaragiBuffer) {
      // Ajuste de tamaño y desplazamiento a la izquierda (left: 1100) para compensar el espacio negro del render original
      const char = await sharp(osaragiBuffer)
        .resize(500, 720, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

      compositor = compositor.composite([
        { input: char, left: 1100, top: 165, blend: 'over' }
      ]);
    }

    const image = await compositor.toBuffer();

    await conn.sendMessage(m.key.remoteJid, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(m.key.remoteJid, {
      image,
      caption: `🖤 *OSARAGI SYSTEM* 🖤\n\n> ⚡ *Latencia:* \`${ping}ms\`\n> 🧠 *RAM:* \`${ramUsage} MB\`\n> 💻 *Host:* Pterodactyl Node\n> 👑 *Dev:* Allen\n\n*// SAKAMOTO DAYS INTERFACE //*`
    }, { quoted: m });

  } catch (e) {
    console.error('PING ERROR:', e);
    await conn.sendMessage(m.key.remoteJid, {
      text: `❌ Error renderizando la interfaz de Osaragi.\n\n${e?.message || e}`
    }, { quoted: m });
  }
};

handler.command = ['ping', 'p', 'latencia'];
export default handler;
