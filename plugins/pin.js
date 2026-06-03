import fetch from 'node-fetch';

const pinterestPlugin = async (m, { conn, from, args, command, usedPrefix }) => {

    if (!args || args.length === 0) {
        return m.reply(`Por favor, ingresa un término de búsqueda.\nEjemplo: ${usedPrefix}${command} momasos`);
    }

   
    let limit = 5; 
    let queryArgs = [...args];

  
    const lastArg = args[args.length - 1];

    if (!isNaN(lastArg)) {
        limit = parseInt(lastArg);

     
        if (limit > 10) limit = 10;

        queryArgs.pop();
    }

    const query = queryArgs.join(' ');

    await m.reply('Buscando... ⏳');

    try {

        const apiUrl = `https://tester-web.onrender.com/api/pinterest?query=${encodeURIComponent(query)}&limit=${limit}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.results || data.results.length === 0) {
            return m.reply('No se encontraron resultados para tu búsqueda.');
        }

        for (const result of data.results) {

            const caption =
`*☆ Título:* ${result.titulo || 'Sin título'}
*☆ Autor:* ${result.autor || 'Desconocido'}
*☆ Likes:* ${result.likes || 0}
*◇ Api:* https://tester-web.onrender.com/api/pinterest`;

            if (result.tipo === 'imagen') {

                await conn.sendMessage(from, {
                    image: { url: result.descarga },
                    caption
                }, { quoted: m });

            } else if (result.tipo === 'video') {

                await conn.sendMessage(from, {
                    video: { url: result.descarga },
                    caption
                }, { quoted: m });
            }
        }

    } catch (error) {
        console.error(`[ERROR EN PLUGIN ${command.toUpperCase()}]`, error);
        m.reply('Ocurrió un error al intentar conectarse a la API.');
    }
};

pinterestPlugin.command = ['pin', 'pinterest'];

pinterestPlugin.desc = '\n> Busca y descarga contenido de Pinterest';

export default pinterestPlugin;
