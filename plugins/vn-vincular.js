import fs from "fs";
import pino from "pino";
import * as baileys from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

const {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason
} = baileys;

const makeWASocket = baileys.default;

const handler = async (m, { conn, from, args }) => {

    const numero = args[0]?.replace(/\D/g, "");

    if (!numero) {
        return m.reply("Uso:\n#code 598XXXXXXXX");
    }

    const authPath = `./subbots/${numero}`;

    if (!fs.existsSync("./subbots")) {
        fs.mkdirSync("./subbots");
    }

    async function startSubBot() {

        const { state, saveCreds } =
            await useMultiFileAuthState(authPath);

        const { version } =
            await fetchLatestBaileysVersion();

        const subBot = makeWASocket({
            version,
            logger: pino({ level: "silent" }),
            browser: ["Ubuntu", "Chrome", "20.0.0"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    pino({ level: "fatal" })
                )
            },
            markOnlineOnConnect: true,
            syncFullHistory: false
        });

        subBot.ev.on("creds.update", saveCreds);

        if (!subBot.authState.creds.registered) {

            setTimeout(async () => {
                try {

                    const code =
                        await subBot.requestPairingCode(numero);

                    const enviado = await conn.sendMessage(
                        from,
                        {
                            text: `❐ *_VINCULACIÓN DE SUB-BOT_*

✩ Sigue estos pasos para ser Sub-Bot de *Osaragi*:

1 » Abre WhatsApp en tu celular.
2 » Ve a Configuración o Dispositivos vinculados.
3 » Toca en *Vincular un dispositivo*.
4 » Elige *Vincular con el número de teléfono*.
5 » Escribe el código de abajo.

> ⚠️ *Atención:* Este código expira rápido.

🔑 *Código:* ${code}`
                        },
                        { quoted: m }
                    );

                    setTimeout(async () => {
                        try {
                            await conn.sendMessage(from, {
                                delete: enviado.key
                            });
                        } catch {}
                    }, 60000);

                } catch (e) {
                    console.error(e);
                }
            }, 5000);
        }

        subBot.ev.on("connection.update", ({ connection, lastDisconnect }) => {

            if (connection === "open") {
                console.log(`[SUBBOT] ${numero} conectado`);
            }

            if (connection === "close") {

                const reason =
                    new Boom(lastDisconnect?.error)
                        ?.output?.statusCode;

                if (reason !== DisconnectReason.loggedOut) {
                    startSubBot();
                }
            }
        });
    }

    startSubBot();
};

handler.command = ["code"];

export default handler;
