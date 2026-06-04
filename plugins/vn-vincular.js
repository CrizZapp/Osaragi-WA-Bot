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

    await m.reply(`ARGS:\n${JSON.stringify(args)}`);

    const numero = args[0]?.replace(/\D/g, "");

    if (!numero) {
        return m.reply("Uso:\n#code 598XXXXXXXX");
    }

    await m.reply(`NUMERO:\n${numero}`);
};

handler.command = ["code"];

export default handler;
