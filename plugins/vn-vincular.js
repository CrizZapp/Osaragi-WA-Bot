import * as baileys from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";

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

        // Evento para guardar credenciales en su respectiva carpeta
        subSock.ev.on("creds.update", saveCreds);

        // Si no está registrado, pedimos el código de vinculación
        if (!subSock.authState.creds.registered) {
            // Un pequeño delay para asegurar que el socket inicializó bien antes de pedir el código
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

                    // Enviamos el código
                    let sentMsg = await m.reply(mensaje);

                    // Borrar el mensaje después de 60 segundos
                    setTimeout(async () => {
                        try {
                            await conn.sendMessage(m.key.remoteJid, { delete: sentMsg.key });
                        } catch (e) {
                            console.log("Error al borrar el mensaje de código:", e);
                        }
                    }, 60000);

                } catch (err) {
                    console.error("Error al solicitar pairing code para sub-bot:", err);
                    m.reply("❌ Error al generar el código. Asegúrate de que el número no esté ya vinculado y tenga el formato correcto.");
                }
            }, 2000);
        } else {
            m.reply(`✅ El número ${number} ya tiene una sesión activa en la carpeta /sub-bots/${number}.`);
        }

        // Manejo básico de conexión del sub-bot
        subSock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const reason = new baileys.Boom(lastDisconnect?.error)?.output?.statusCode;
                console.log(`[SUB-BOT ${number}] Desconectado. Razón: ${reason}`);
                
                // Si el usuario cierra sesión desde su cel, borramos su carpeta
                if (reason === DisconnectReason.loggedOut) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    console.log(`[SUB-BOT ${number}] Sesión eliminada por loggedOut.`);
                }
            } else if (connection === "open") {
                console.log(`[SUB-BOT ${number}] Conectado exitosamente.`);
                await conn.sendMessage(m.key.remoteJid, { text: `✅ ¡Sub-Bot para *${number}* conectado con éxito!` }, { quoted: m });
            }
        });

        // Aquí deberías redirigir los mensajes del sub-bot a tu handler general
        // subSock.ev.on("messages.upsert", async (chatUpdate) => { ... });

    } catch (e) {
        console.error(e);
        m.reply("❌ Ocurrió un error crítico al intentar inicializar el sub-bot.");
    }
};

handler.command = ['code'];
export default handler;
