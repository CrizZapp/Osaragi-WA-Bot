import fs from 'fs';
import path from 'path';

// Asegúrate de extraer 'conn' aquí para poder enviar el documento
const handler = async (m, { args, conn }) => {
    if (!args[0]) {
        return m.reply('Uso: #inspect <link>');
    }

    let url = args[0];

    // Añade https:// si el usuario no lo pone
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    try {
        // Hacemos el fetch, pero con HEADERS para evitar el error 403
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                // Este User-Agent simula ser Google Chrome en Windows
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
                'Connection': 'keep-alive'
            }
        });

        if (!res.ok) {
            return m.reply(`Error al acceder a la página: ${res.status} ${res.statusText}`);
        }

        const html = await res.text();

        // Obtener un nombre base para el archivo
        const u = new URL(url);
        let nombre = u.hostname.replace(/^www\./, '');

        // Usar el último segmento del link si existe
        if (u.pathname !== '/' && u.pathname) {
            const segmento = u.pathname.split('/').filter(Boolean).pop();
            if (segmento) nombre = segmento;
        }

        // Limpiar el nombre para que no tenga caracteres inválidos en Windows/Linux
        nombre = nombre.replace(/[^a-zA-Z0-9._-]/g, '_');

        const archivo = `${nombre}.html`;
        const tmpDir = path.resolve('./tmp');
        const ruta = path.join(tmpDir, archivo);

        // Crear la carpeta tmp si no existe
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Guardar el archivo HTML
        fs.writeFileSync(ruta, html);

        // Enviar el archivo como documento en WhatsApp
        await conn.sendMessage(
            m.key.remoteJid,
            {
                document: fs.readFileSync(ruta),
                fileName: archivo,
                mimetype: 'text/html'
            },
            { quoted: m }
        );

        // Eliminar el archivo para no saturar tu almacenamiento
        fs.unlinkSync(ruta);

    } catch (e) {
        console.error('[ERROR EN INSPECT]', e);
        m.reply('No se pudo inspeccionar la página. Asegúrate de que el enlace funcione o no tenga un bloqueo antibots estricto (como Cloudflare).');
    }
};

handler.command = ['inspect'];

export default handler;
