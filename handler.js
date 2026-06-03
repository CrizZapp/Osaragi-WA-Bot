import chalk from 'chalk';
import { jidDecode } from '@whiskeysockets/baileys';

// 1. La función mágica la ponemos afuera del handler para que esté disponible
const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return decode.user && decode.server ? decode.user + '@' + decode.server : jid;
    } else return jid;
};

// 2. Un único handler que procesa todo
export const handler = async (sock, m) => {
    if (!m || !m.message) return;

    const conn = sock;
    const from = m.key.remoteJid; 
    
    // ACÁ APLICAMOS LA MAGIA: Limpiamos el sender antes de usarlo
    let rawSender = m.key.participant || m.key.remoteJid;
    const sender = decodeJid(rawSender);

    if (typeof global.onlyOwnersGroup === 'undefined') {
        global.onlyOwnersGroup = false; 
    }

    const gruposPermitidos = [
        "120363427856069992@g.us",
        "120363427856070000@g.us" 
    ];

    if (global.onlyOwnersGroup && !gruposPermitidos.includes(from)) {
        return;
    }

    const body =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        m.message.imageMessage?.caption ||
        '';

    const usedPrefix = '#'; 
    
    m.reply = async (text, options = {}) => {
        return await conn.sendMessage(from, {
            text,
            ...options
        }, {
            quoted: m
        });
    };

    if (!body.startsWith(usedPrefix)) return;

    const [cmdName, ...args] = body
        .slice(usedPrefix.length)
        .trim()
        .split(' ');

    const command = cmdName.toLowerCase();

    const plugin = Object.values(global.plugins).find(p => 
        p?.command &&
        (
            Array.isArray(p.command)
                ? p.command.includes(command)
                : p.command === command
        )
    );

    if (plugin) {
        try {
            await plugin(m, { 
                conn,
                from,
                sender, // ¡Acá el sender ya viaja limpiecito al plugin!
                usedPrefix,
                args,
                command
            });

        } catch (e) {
            console.error(
                chalk.red(`[ERROR EN ${command.toUpperCase()}]`),
                e
            );

            m.reply('Ocurrió un error al ejecutar el comando.');
        }
    }
};
