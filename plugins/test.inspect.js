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
        // Petición directa imitando un navegador real al 100% para engañar al hosting
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Cache-Control': 'max-age=0',
                'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1'
            },
            responseType: 'text',
            timeout: 12000
        });

        const html = res.data;

        // Nombre del archivo basado en la URL
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

        // Enviar por WhatsApp
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
        if (e.response) {
            return m.reply(`❌ Error al acceder: ${e.response.status} ${e.response.statusText}`);
        }
        console.error(e);
        m.reply('❌ No se pudo obtener el HTML.');
    }
};

handler.command = ['inspect'];

export default handler;
