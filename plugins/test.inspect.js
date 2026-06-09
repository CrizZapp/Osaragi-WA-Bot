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

    await m.reply('> ⏳ *Extrayendo código fuente...*');

    try {
        // En lugar de ir directo y comernos el 403, llamamos a esta API pública
        // Le pasamos tu link y ella nos devuelve el HTML crudo
        const apiUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        
        const response = await axios.get(apiUrl, { timeout: 15000 });
        const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

        // Obtener nombre para el archivo
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

        // Enviamos el archivo por WhatsApp
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
            return m.reply(`❌ Error de la API proxy: ${e.response.status}`);
        }
        console.error('Error en inspect:', e);
        m.reply('❌ No se pudo extraer el HTML de la página.');
    }
};

handler.command = ['inspect'];

export default handler;
