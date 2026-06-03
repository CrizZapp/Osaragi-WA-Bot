import { 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason 
} from "@whiskeysockets/baileys";
import * as baileys from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";

const makeWASocket = baileys.default;

// Creamos un array global para mantener vivos los sockets de los sub-bots
if (!global.conns) global.conns = [];

const handler = async (m, { conn, from, sender, usedPrefix, command }) => {
    // Extraemos solo los números del JID (ej: 59899123456)
    const number = sender.split('@')[0];
    const sessionPath = path.join('./sub-bots/', number);

    await m.reply("⏳ *Generando tu código de vinculación...* Espere un momento.");

    // Creamos la carpeta de sesiones si no existe
    if (!fs.existsSync('./sub-bots/')) fs.mkdirSync('./sub-bots/', { recursive: true });
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.0"], // Necesario para que tire código en lugar de QR
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        markOnlineOnConnect: true,
        syncFullHistory: false,
    });

    if (!sock.authState.creds.registered) {
        // Le damos 3 segunditos para que el socket inicialice bien antes de pedir el código
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(number);
                // Le agregamos el guion clásico para que quede estético (XXXX-XXXX)
                code = code?.match(/.{1,4}/g)?.join("-") || code;

                let msg = `❐ *_VINCULACIÓN DE SUB-BOT_*\n\n`;
                msg += `✩ Sigue estos pasos para ser Sub-Bot de *Osaragi*:\n\n`;
                msg += `1 » Abre WhatsApp en tu celular.\n`;
                msg += `2 » Ve a Configuración o Dispositivos vinculados.\n`;
                msg += `3 » Toca en *Vincular un dispositivo*.\n`;
                msg += `4 » Elige *Vincular con el número de teléfono*.\n`;
                msg += `5 » Escribe el código de abajo.\n\n`;
                msg += `> ⚠️ *Atención:* Este código expira rápido.`;

                await m.reply(msg);
                // Mandamos el código suelto para que el usuario pueda copiarlo fácil con un toque
                await conn.sendMessage(from, { text: code }, { quoted: m });
            } catch (err) {
                console.error("[ERROR SUB-BOT CODE]", err);
                m.reply("❌ Ocurrió un error al generar tu código. ¿Estás seguro de que tu número no está bloqueado o ya vinculado?");
            }
        }, 3000);
    }

    // Manejo de eventos del Sub-Bot
    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut || reason === 401 || reason === 405) {
                // Si lo desvinculan desde su cel, borramos los archivos
                fs.rmSync(sessionPath, { recursive: true, force: true });
                conn.sendMessage(from, { text: `⚠️ La sesión de tu Sub-Bot ha sido cerrada o desvinculada.` });
            } else if (reason === 428 || reason === 515) {
                // Errores de caída temporal, se reinician solos usualmente
                console.log(`[SUB-BOT] Conexión de ${number} cerrada. Reconectando...`);
            }
        }
        
        if (connection === "open") {
            global.conns.push(sock);
            await conn.sendMessage(from, { text: "🎉 ¡Conexión exitosa! Tu número ahora es un Sub-Bot activo." }, { quoted: m });
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // 🔴 MAGIA NEGRA: Redirigimos los mensajes del Sub-Bot a TU handler principal
    sock.ev.on("messages.upsert", async (chatUpdate) => {
        const mSub = chatUpdate.messages[0];
        if (!mSub.message) return;
        try {
            // Importamos dinámicamente tu handler principal para que lo ejecute el sub-bot
            const { handler: mainHandler } = await import("../handler.js");
            await mainHandler(sock, mSub);
        } catch (e) {
            console.error(`[ERROR EN HANDLER SUB-BOT ${number}]`, e);
        }
    });
};

// Asignamos los comandos que disparan este plugin
handler.command = ['code', 'subbot', 'jadibot'];

export default handler;
