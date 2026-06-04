import fs from "fs";
import pino from "pino";
import * as baileys from "@whiskeysockets/baileys";

const {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = baileys;

const makeWASocket = baileys.default;

const handler = async (m, { conn, from, args }) => {

    const numero = args[0]?.replace(/\D/g, "");

    if (!numero) {
        return m.reply("Uso:\n#code 598XXXXXXXX");
    }

    try {

        await m.reply("① Creando carpeta...");

        const authPath = `./subbots/${numero}`;

        if (!fs.existsSync("./subbots")) {
            fs.mkdirSync("./subbots");
        }

        await m.reply("② Cargando auth state...");

        const { state, saveCreds } =
            await useMultiFileAuthState(authPath);

        await m.reply("③ Obteniendo versión de Baileys...");

        const { version } =
            await fetchLatestBaileysVersion();

        await m.reply("④ Creando socket...");

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

        subBot.ev.on("connection.update", (update) => {
            console.log("SUBBOT UPDATE:", update);
        });

        await m.reply("⑤ Socket creado");

        setTimeout(async () => {

            try {

                await m.reply("⑥ Solicitando código...");

                const code =
                    await subBot.requestPairingCode(numero);

                await m.reply(`⑦ Código generado:\n${code}`);

                const texto = `❐ *_VINCULACIÓN DE SUB-BOT_*

✩ Sigue estos pasos para ser Sub-Bot de *Osaragi*:

1 » Abre WhatsApp en tu celular.
2 » Ve a Configuración o Dispositivos vinculados.
3 » Toca en *Vincular un dispositivo*.
4 » Elige *Vincular con el número de teléfono*.
5 » Escribe el código de abajo.

> ⚠️ *Atención:* Este código expira rápido.

🔑 *Código:* ${code}`;

                const enviado = await conn.sendMessage(
                    from,
                    { text: texto },
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
                await m.reply(`ERROR EN PAIRING:\n${e.message}`);
            }

        }, 5000);

    } catch (e) {
        await m.reply(`ERROR GENERAL:\n${e.message}`);
    }
};

handler.command = ["code"];

export default handler;
