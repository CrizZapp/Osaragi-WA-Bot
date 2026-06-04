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

    console.log("[CODE] 1 - comando ejecutado");

    const numero = args[0]?.replace(/\D/g, "");

    if (!numero) {
        return m.reply("Uso:\n#code 598XXXXXXXX");
    }

    try {

        const authPath = `./subbots/${numero}`;

        if (!fs.existsSync("./subbots")) {
            fs.mkdirSync("./subbots");
        }

        console.log("[CODE] 2 - carpeta ok");

        const { state, saveCreds } =
            await useMultiFileAuthState(authPath);

        console.log("[CODE] 3 - auth state ok");

        const { version } =
            await fetchLatestBaileysVersion();

        console.log("[CODE] 4 - version", version);

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

        console.log("[CODE] 5 - socket creado");

        subBot.ev.on("creds.update", saveCreds);

        subBot.ev.on("connection.update", (update) => {
            console.log("[SUBBOT UPDATE]", update);

            const { connection, lastDisconnect } = update;

            if (connection === "open") {
                console.log(`[SUBBOT] ${numero} conectado`);
            }

            if (connection === "close") {
                const reason =
                    new Boom(lastDisconnect?.error)
                        ?.output?.statusCode;

                console.log("[SUBBOT CLOSE]", reason);
            }
        });

        setTimeout(async () => {

            try {

                console.log("[CODE] 6 - solicitando pairing");

                const code =
                    await subBot.requestPairingCode(numero);

                console.log("[CODE] 7 - code generado", code);

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
                console.error("[PAIRING ERROR]", e);

                m.reply(`❌ Error:\n${e.message}`);
            }

        }, 5000);

    } catch (e) {
        console.error("[CODE ERROR]", e);

        m.reply(`❌ Error:\n${e.message}`);
    }
};

handler.command = ["code"];

export default handler;
