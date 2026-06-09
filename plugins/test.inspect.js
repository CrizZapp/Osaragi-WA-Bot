import fs from 'fs';
import path from 'path';

const handler = async (m, { args }) => {
    if (!args[0]) {
        return m.reply('Uso: #inspect <link>');
    }

    let url = args[0];

    // Añade https:// si no lo puso
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    try {
        const res = await fetch(url);

        if (!res.ok) {
            return m.reply(`Error al acceder a la página: ${res.status}`);
        }

        const html = await res.text();

        // Obtener un nombre para el archivo
        const u = new URL(url);

        let nombre = u.hostname.replace(/^www\./, '');

        // Si quieres usar el último segmento del link:
        if (u.pathname !== '/' && u.pathname) {
            const segmento = u.pathname.split('/').filter(Boolean).pop();
            if (segmento) nombre = segmento;
        }

        nombre = nombre.replace(/[^a-zA-Z0-9._-]/g, '_');

        const archivo = `${nombre}.html`;
        const ruta = path.join('./tmp', archivo);

        fs.mkdirSync('./tmp', { recursive: true });
        fs.writeFileSync(ruta, html);

        await m.reply(`HTML guardado como: ${archivo}`);

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
        m.reply('No se pudo inspeccionar la página.');
    }
};

handler.command = ['inspect'];

export default handler;
