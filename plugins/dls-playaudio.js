import axios from 'axios';

const handler = async (m, { conn, from, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`*⚠️ Uso correcto del comando:*\n${usedPrefix + command} <texto o enlace de YouTube>`);
    }

    const query = args.join(' ');
    await m.reply('> ⏳ *Buscando...* ');

    try {
        const apiBaseUrl = 'https://tester-web.onrender.com'; 
        
        const response = await axios.get(`${apiBaseUrl}/api/download`, {
            params: {
                url: query,
                type: 'mp3'
            }
        });

        const data = response.data;

        if (!data.status) {
            return m.reply(`❌ Error: ${data.message}`);
        }



  const infoTexto = `
*🎧 ⫷ ⓄⓈⒶⒼⒶⓇⒾ ⒹⓄⓌⓁⓄⒶⒹ ⫸ 🎧*

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
            audio: { url: data.result }, 
            mimetype: 'audio/mp4',
            fileName: `${data.title}.mp3`
        }, { quoted: m });

    } catch (error) {
        console.error('Error en el comando playaudio:', error);
        m.reply('❌ No se pudo descargar el contenido. Intenta más tarde.');
    }
};

handler.command = ['playaudio', 'ytmp3', 'audio'];
export default handler;
