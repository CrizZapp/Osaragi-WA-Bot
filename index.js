import * as baileys from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import figlet from "figlet";
import chalk from "chalk";
import { exec } from "child_process";
import readline from "readline";
import fs from "fs";

const { 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason 
} = baileys;
const makeWASocket = baileys.default;


const clrSystem = chalk.hex("#8A2BE2"); 
const clrSuccess = chalk.hex("#00FF7F");
const clrAlert = chalk.hex("#FF4500"); 
const clrInfo = chalk.hex("#00FFFF");


const dbPath = './database.json';
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: {}, chats: {}, characters: {} }));
}

global.db = {
  data: JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
};

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
  const loadText = "  🔌 Cargando módulos del sistema...";
  console.log(clrSystem("│") + chalk.bold(loadText.padEnd(anchoCaja)) + clrSystem("│"));
  
  for (const file of pluginFiles) {
    const module = await import(`./plugins/${file}`);
    global.plugins[file] = module.default;
  }
  
  console.log(clrSystem("├──────────────────────────────────────────────────────┤"));
  const pluginText = `  ✨ [PLUGINS] Total cargados con éxito: [ ${Object.keys(global.plugins).length} ]`;
  console.log(clrSystem("│") + clrSuccess(pluginText.padEnd(anchoCaja)) + clrSystem("│"));
  console.log(clrSystem("└──────────────────────────────────────────────────────┘\n"));
};

const showBanner = () => {
  return new Promise((resolve) => {
    figlet("Osaragi Bot", { font: "Slant" }, (err, data) => {
      if (!err) {
        console.log(clrSystem(data));
      }
      console.log(clrInfo(" ⚡ Powered by Allen Dev\n"));
      resolve();
    });
  });
};



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
    const anchoCaja = 54;
    console.log(clrInfo("┌──────────────────────────────────────────────────────┐"));
    const vincText = " 📱 SOLICITUD DE VINCULACIÓN";
    console.log(clrInfo("│") + chalk.bold(vincText.padEnd(anchoCaja)) + clrInfo("│"));
    console.log(clrInfo("└──────────────────────────────────────────────────────┘"));
    
    let number = await question(clrInfo("  ➤ Introduce tu número de WhatsApp (Ej: 549...): "));
    number = number.replace(/[^0-9]/g, "");
    if (!number) process.exit(1);
    
    console.log(chalk.gray("\n  ⏳ Generando código de emparejamiento seguro..."));
    const code = await sock.requestPairingCode(number);
    
   
    const codeStr = `         ${code}         `; 
    const espacioIzq = " ".repeat(13);
    const espacioDer = " ".repeat(14);

    console.log("\n" + clrSuccess("  ┌──────────────────────────────────────────────────┐"));
    const titleCode = "          🔑 TU CÓDIGO DE VINCULACIÓN";
    console.log(clrSuccess("  │") + chalk.bold.white(titleCode.padEnd(50)) + clrSuccess("│"));
    console.log(clrSuccess("  ├──────────────────────────────────────────────────┤"));
    console.log(clrSuccess("  │" + " ".repeat(50) + "│"));
    console.log(clrSuccess("  │") + espacioIzq + chalk.bold.bgHex("#222").hex("#00FF7F")(codeStr) + espacioDer + clrSuccess("│"));
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
      const anchoCaja = 54;
      console.log(clrSuccess("┌──────────────────────────────────────────────────────┐"));
      const successText = " 🎉 ¡Bot conectado con éxito!";
      console.log(clrSuccess("│") + chalk.bold(successText.padEnd(anchoCaja)) + clrSuccess("│"));
      console.log(clrSuccess("└──────────────────────────────────────────────────────┘\n"));
      exec("rm -rf tmp && mkdir tmp");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

startBot();
