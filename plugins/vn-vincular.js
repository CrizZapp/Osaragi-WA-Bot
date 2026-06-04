import * as baileys from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";

const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason } = baileys;
const makeWASocket = baileys.default;

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`*⚠️ Formato incorrecto.*\nUsa: ${usedPrefix}${command} <número>\nEjemplo: ${usedPrefix}${command} 5491112345678`);
    }

    const number = args[0].replace(/[^0-9]/g, "");
    
    // Crear directorio principal de sub-bots si no existe
    if (!fs.existsSync('./sub-bots')) {
        fs.mkdirSync('./sub-bots');
    }

    const sessionPath = `./sub-bots/${number}`;
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        // Creamos el NUEVO socket para el Sub-Bot
        const subSock = makeWASocket({
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

        // Evento para guardar credenciales
        subSock.ev.on("creds.update", saveCreds);

        // Pedimos el código de vinculación si no está registrado
        if (!subSock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const code = await subSock.requestPairingCode(number);
                    
                    const mensaje = `
❐ *_VINCULACIÓN DE SUB-BOT_*

✩ Sigue estos pasos para ser Sub-Bot de *Osaragi*:

1 » Abre WhatsApp en tu celular.
2 » Ve a Configuración o Dispositivos vinculados.
3 » Toca en *Vincular un dispositivo*.
4 » Elige *Vincular con el número de teléfono*.
5 » Escribe el código de abajo.

> *${code}*

> ⚠️ *Atención:* Este código expira rápido.
                    `.trim();

                    let sentMsg = await m.reply(mensaje);

                    // Borrar el mensaje después de 60 segundos por seguridad
                    setTimeout(async () => {
                        try {
                            await conn.sendMessage(m.key.remoteJid, { delete: sentMsg.key });
                        } catch (e) {
                            console.log("El mensaje del código ya fue eliminado o no se pudo borrar.");
                        }
                    }, 60000);

                } catch (err) {
                    console.error("Error al solicitar pairing code para sub-bot:", err);
                    m.reply("❌ Error al generar el código. Asegúrate de que el número tenga el formato correcto.");
                }
            }, 2000);
        } else {
            m.reply(`✅ El número ${number} ya tiene una sesión activa.`);
        }

        // Manejo de conexión del sub-bot
        subSock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const reason = new baileys.Boom(lastDisconnect?.error)?.output?.statusCode;
                console.log(`[SUB-BOT ${number}] Desconectado. Razón: ${reason}`);
                
                if (reason === DisconnectReason.loggedOut) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    console.log(`[SUB-BOT ${number}] Sesión eliminada por cierre desde el celular.`);
                }
            } else if (connection === "open") {
                console.log(`[SUB-BOT ${number}] Conectado exitosamente.`);
                await conn.sendMessage(m.key.remoteJid, { text: `✅ ¡Sub-Bot para *${number}* conectado con éxito!` }, { quoted: m });
            }
        });

        // 🔥 AQUÍ ESTÁ LA SOLUCIÓN: Conectamos el sub-bot a tu handler.js
        subSock.ev.on("messages.upsert", async (chatUpdate) => {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            
            try {
                // Importamos el handler dinámicamente asegurando la ruta desde la raíz del proyecto
                const handlerPath = path.join(process.cwd(), 'handler.js');
                const { handler: mainHandler } = await import(`file://${handlerPath}`);
                
                // Le pasamos el subSock al handler para que responda desde el número vinculado
                await mainHandler(subSock, msg, chatUpdate);
            } catch (err) {
                console.error(`[SUB-BOT ${number}] Error ejecutando el handler:`, err);
            }
        });

    } catch (e) {
        console.error(e);
        m.reply("❌ Ocurrió un error crítico al intentar inicializar el sub-bot.");
    }
};

handler.command = ['code'];
export default handler;
