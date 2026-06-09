import fs from 'fs';
import path from 'path';
import axios from 'axios';

const handler = async (m, { args, conn }) => {
    if (!args[0]) return;

    let url = args[0];
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    try {
        const res = await axios.get(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, {
            responseType: 'text',
            timeout: 10000
        });

        const html = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);

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
        console.error(e);
    }
};

handler.command = ['inspect'];

export default handler;
