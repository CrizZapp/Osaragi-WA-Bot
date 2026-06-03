import fs from "fs";
import pino from "pino";
import * as baileys from "@whiskeysockets/baileys";

const {
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} = baileys;

const makeWASocket = baileys.default;

export default async function (m, { conn, args, command }) {
    if (command !== "code") return;

    const numero = args[0]?.replace(/\D/g, "");

    if (!numero) {
        return m.reply(
`❐ *_VINCULACIÓN DE SUB-BOT_*

Uso:
#code 59812345678`
        );
    }

    try {
        const sessionPath = `./subbots/${numero}`;

        if (!fs.existsSync("./subbots")) {
            fs.mkdirSync("./subbots");
        }

        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        const { state, saveCreds } =
            await useMultiFileAuthState(sessionPath);

        const { version } =
            await fetchLatestBaileysVersion();

        const subSock = makeWASocket({
            version,
            logger: pino({ level: "silent" }),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    pino({ level: "silent" })
                )
            }
        });

        subSock.ev.on("creds.update", saveCreds);

        const code = await subSock.requestPairingCode(numero);

        const texto = `❐ *_VINCULACIÓN DE SUB-BOT_*

✩ Sigue estos pasos para ser Sub-Bot de *Osaragi*:

1 » Abre WhatsApp en tu celular.
2 » Ve a Configuración o Dispositivos vinculados.
3 » Toca en *Vincular un dispositivo*.
4 » Elige *Vincular con el número de teléfono*.
5 » Escribe el código de abajo.

> ⚠️ *Atención:* Este código expira rápido.

🔑 *Código:* ${code}`;

        const msg = await conn.sendMessage(
            m.key.remoteJid,
            { text: texto },
            { quoted: m }
        );

        setTimeout(async () => {
            try {
                await conn.sendMessage(
                    m.key.remoteJid,
                    { delete: msg.key }
                );
            } catch {}
        }, 60000);

    } catch (e) {
        console.error(e);
        m.reply("Error al generar el código.");
    }
}

export const command = ["code"];
