import * as baileys from "@whiskeysockets/baileys";
import { makeWASocket } from './lib/simple.js';
import pino from "pino";
import { Boom } from "@hapi/boom";
import figlet from "figlet";
import chalk from "chalk";
import { exec } from "child_process";
import readline from "readline";
import fs from "fs";

// Agrega esto justo después de tus imports y antes de cualquier otra cosa
global.opts = {
    legacy: false // Esto evita que falle al buscar la propiedad 'legacy'
};


const { 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason 
} = baileys;

const clrSystem = chalk.hex("#8A2BE2"); 
const clrSuccess = chalk.hex("#00FF7F");
const clrAlert = chalk.hex("#FF4500"); 
const clrInfo = chalk.hex("#00FFFF");

const dbPath = './database.json';
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: {}, chats: {}, characters: {} }));
}

global.db = { data: JSON.parse(fs.readFileSync(dbPath, 'utf-8')) };

setInterval(() => {
  fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
}, 30000);

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, (answer) => { rl.close(); resolve(answer); }));
};

global.plugins = {};
const loadPlugins = async () => {
  const pluginFolder = "./plugins";
  if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder);
  const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith(".js"));
  
  const anchoCaja = 54;
  console.log(clrSystem("┌──────────────────────────────────────────────────────┐"));
  console.log(clrSystem("│") + chalk.bold("  🔌 Cargando módulos del sistema...".padEnd(anchoCaja)) + clrSystem("│"));
  
  for (const file of pluginFiles) {
    const module = await import(`./plugins/${file}`);
    global.plugins[file] = module.default;
  }
  
  console.log(clrSystem("├──────────────────────────────────────────────────────┤"));
  console.log(clrSystem("│") + clrSuccess(`  ✨ [PLUGINS] Total cargados con éxito: [ ${Object.keys(global.plugins).length} ]`.padEnd(anchoCaja)) + clrSystem("│"));
  console.log(clrSystem("└──────────────────────────────────────────────────────┘\n"));
};

const showBanner = () => {
  return new Promise((resolve) => {
    figlet("Osaragi Bot", { font: "Slant" }, (err, data) => {
      if (!err) console.log(clrSystem(data));
      console.log(clrInfo(" ⚡ Powered by Allen Dev\n"));
      resolve();
    });
  });
};

// Cache para no saturar las peticiones a WhatsApp
const lidCache = new Map();

async function resolveLidToRealJid(sock, lidJid, groupJid) {
    if (!lidJid?.endsWith("@lid") || !groupJid?.endsWith("@g.us")) return lidJid?.includes("@") ? lidJid : `${lidJid}@s.whatsapp.net`;
    
    if (lidCache.has(lidJid)) return lidCache.get(lidJid);
    
    try {
        const metadata = await sock.groupMetadata(groupJid);
        const participant = metadata.participants.find(p => p.lid?.split('@')[0] === lidJid.split('@')[0]);
        
        if (participant?.phoneNumber) {
            lidCache.set(lidJid, participant.phoneNumber);
            return participant.phoneNumber;
        }
    } catch (e) {
        console.error("Error resolviendo LID:", e);
    }
    return lidJid;
}


async function startBot() {
  console.clear();
  await showBanner();
  await loadPlugins();

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "20.0.0"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });

  if (!sock.authState.creds.registered) {
    console.log(clrInfo("┌──────────────────────────────────────────────────────┐"));
    console.log(clrInfo("│") + chalk.bold(" 📱 SOLICITUD DE VINCULACIÓN".padEnd(54)) + clrInfo("│"));
    console.log(clrInfo("└──────────────────────────────────────────────────────┘"));
    
    let number = await question(clrInfo("  ➤ Introduce tu número de WhatsApp (Ej: 549...): "));
    number = number.replace(/[^0-9]/g, "");
    if (!number) process.exit(1);
    
    console.log(chalk.gray("\n  ⏳ Generando código de emparejamiento seguro..."));
    const code = await sock.requestPairingCode(number);
    const codeStr = `         ${code}         `; 
    
    console.log("\n" + clrSuccess("  ┌──────────────────────────────────────────────────┐"));
    console.log(clrSuccess("  │") + chalk.bold.white("          🔑 TU CÓDIGO DE VINCULACIÓN".padEnd(50)) + clrSuccess("│"));
    console.log(clrSuccess("  ├──────────────────────────────────────────────────┤"));
    console.log(clrSuccess("  │" + " ".repeat(50) + "│"));
    console.log(clrSuccess("  │") + " ".repeat(13) + chalk.bold.bgHex("#222").hex("#00FF7F")(codeStr) + " ".repeat(14) + clrSuccess("│"));
    console.log(clrSuccess("  │" + " ".repeat(50) + "│"));
    console.log(clrSuccess("  └──────────────────────────────────────────────────┘\n"));
  }

  sock.ev.on("messages.upsert", async (chatUpdate) => {
    const m = chatUpdate.messages[0];
    if (!m.message) return;
    const { handler } = await import("./handler.js");
    await handler(sock, m, chatUpdate);
  });

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(clrAlert(`\n ⚠️ [CONEXIÓN] Cerrada. Razón: ${reason}. Reconectando...`));
      if (reason !== DisconnectReason.loggedOut) startBot();
      else process.exit(0);
    }
    if (connection === "open") {
      console.log(clrSuccess("┌──────────────────────────────────────────────────────┐"));
      console.log(clrSuccess("│") + chalk.bold(" 🎉 ¡Bot conectado con éxito!".padEnd(54)) + clrSuccess("│"));
      console.log(clrSuccess("└──────────────────────────────────────────────────────┘\n"));
      exec("rm -rf tmp && mkdir tmp");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

startBot();
