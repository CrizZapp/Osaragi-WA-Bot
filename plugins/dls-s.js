import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const handler = async (m, { conn, args }) => {
    // Verificar si el mensaje contiene una imagen/video o si responde a una
    const isQuotedImage = m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    const isQuotedVideo = m.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
    const isImage = m.message.imageMessage;
    const isVideo = m.message.videoMessage;

    if (!isImage && !isVideo && !isQuotedImage && !isQuotedVideo) {
        return m.reply('⚠️ Por favor, responde a una imagen/video o envía una con el comando *#s*');
    }

    try {
        await m.reply('⏳ Procesando tu sticker...');

        // Detectar de dónde descargar el archivo
        const messageToDownload = isQuotedImage || isQuotedVideo 
            ? m.message.extendedTextMessage.contextInfo.quotedMessage 
            : m.message;

        // Descargar los bytes de la imagen/video
        const buffer = await downloadMediaMessage(
            { message: messageToDownload },
            'buffer',
            {},
            { logger: console }
        );

        // Si el usuario pone "circle" después del comando
        const esCirculo = args[0]?.toLowerCase() === 'circle';

        // Configuración de la librería con nombre y autor
        const sticker = new Sticker(buffer, {
            pack: 'Mi Bot Pack',       // Nombre del paquete
            author: 'Creador Bot',     // Autor del sticker
            type: esCirculo ? StickerTypes.CIRCLE : StickerTypes.FULL,
            quality: 70
        });

        const stickerBuffer = await sticker.toBuffer();

        // Enviar el sticker resultante al chat
        return await conn.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply('❌ Ocurrió un error al generar el sticker.');
    }
};

// Configuración para que tu handler de plugins lo reconozca
handler.command = ['s', 'sticker']; 

export default handler;
