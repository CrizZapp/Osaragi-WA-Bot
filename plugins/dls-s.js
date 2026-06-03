import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const handler = async (m, { conn, args }) => {
    // 1. Extraemos el mensaje citado de forma segura (igual que en tu otro bot)
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    // 2. Validamos si hay contenido multimedia en el mensaje o en el citado
    const media = m.message?.imageMessage || m.message?.videoMessage || quoted?.imageMessage || quoted?.videoMessage;

    if (!media) {
        return m.reply('❌ Por favor, responde a una imagen/video o envía una con el comando *#s*');
    }

    try {
        await m.reply('⏳ Fabricando sticker...');

        // 3. Estructuramos el mensaje para downloadMediaMessage según corresponda
        const messageToDownload = quoted 
            ? { message: quoted } 
            : m;

        // Descargar los bytes usando la función de Baileys
        const buffer = await downloadMediaMessage(
            messageToDownload,
            'buffer',
            {},
            { logger: console }
        );

        // Si el usuario pone "circle" después del comando (#s circle)
        const esCirculo = args[0]?.toLowerCase() === 'circle';

        // 4. Configuración de la librería con nombre y autor
        const sticker = new Sticker(buffer, {
            pack: 'VEE-BOT',           // Nombre del paquete
            author: 'Creador Bot',     // Autor del sticker
            type: esCirculo ? StickerTypes.CIRCLE : StickerTypes.FULL,
            quality: 70
        });

        const stickerBuffer = await sticker.toBuffer();

        // Enviar el sticker de vuelta al chat
        return await conn.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply('❌ Ocurrió un error al generar el sticker.');
    }
};

handler.command = ['s', 'sticker']; 

export default handler;
