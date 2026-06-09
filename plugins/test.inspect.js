import fs from 'fs';
import path from 'path';
import axios from 'axios';

const handler = async (m, { args, conn }) => {
    if (!args[0]) {
        return m.reply('Uso: #inspect <link>');
    }

    let url = args[0];

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    try {
        // Usamos un proxy crudo que no filtra ni altera la respuesta
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        
        const res = await axios.get(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            responseType: 'text',
            timeout: 15000
        });

        // Aseguramos que sea texto
        const html = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);

        // Armamos el nombre del archivo
        const u = new URL(url);
        let nombre = u.hostname.replace(/^www\./, '');

        if (u.pathname !== '/' && u.pathname) {
            const segmento = u.pathname.split('/').filter(Boolean).pop();
            if (segmento) nombre = segmento;
        }

        nombre = nombre.replace(/[^a-zA-Z0-9._-]/g, '_');
        const archivo = `${nombre}.html`;
        
        const tmpDir = path.resolve('./tmp');
        const ruta = path.join(tmpDir, archivo);

        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        fs.writeFileSync(ruta, html);

        // Mandamos el archivo de una
        await conn.sendMessage(
            m.key.remoteJid,
            {
                document: fs.readFileSync(ruta),
                fileName: archivo,
                mimetype: 'text/html'
            },
            { quoted: m }
        );

        fs.unlinkSync(ruta);

    } catch (e) {
        // Mensaje de error directo con el código exacto
        const status = e.response ? e.response.status : (e.code || 'Desconocido');
        console.error(e);
        m.reply(`❌ Error crudo: ${status}\nSi sigue tirando error, la URL no permite extracción externa de ninguna forma.`);
    }
};

handler.command = ['inspect'];

export default handler;
