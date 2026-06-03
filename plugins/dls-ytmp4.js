import axios from 'axios';

const handler = async (m, { conn, from, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`*⚠️ Uso correcto del comando:*\n${usedPrefix + command} <texto o enlace de YouTube>`);
    }

    const query = args.join(' ');
    await m.reply('⏳ _Procesando tu solicitud en la API, por favor espera..._');

    try {
        const apiBaseUrl = 'https://tester-web.onrender.com';

        const response = await axios.get(`${apiBaseUrl}/api/download`, {
            params: {
                url: query,
                type: 'mp4'
            }
        });

        const data = response.data;

        if (!data.status) {
            return m.reply(`❌ Error: ${data.message}`);
        }

        const infoTexto = `*🎧 ⫷ ⓄⓈⒶⒼⒶⓇⒾ ⒹⓄⓌⓁⓄⒶⒹ ⫸ 🎧*

> ✦ *𝑻𝒊́𝒕𝒖𝒍𝒐::* ${data.title}
> ✦ *𝑪𝒂𝒏𝒂𝒍:* ${data.author}
> ✦ *𝑫𝒖𝒓𝒂𝒄𝒊𝒐́𝒏:* ${data.duration}
> ☁️ *Api: AllenApi*
> https://tester-web.onrender.com`;

        await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption: infoTexto
        }, { quoted: m });

        await conn.sendMessage(from, {
            video: { url: data.result },
            mimetype: 'video/mp4',
            fileName: `${data.title}.mp4`,
            caption: `🎬 *${data.title}*`
        }, { quoted: m });

    } catch (error) {
        console.error('Error en el comando play:', error);
        m.reply('❌ No se pudo descargar el video. Intenta más tarde.');
    }
};

handler.command = ['play', 'ytmp4', 'video'];
export default handler;
