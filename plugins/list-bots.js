export default async function bots(m, { conn, usedPrefix, command }) {
    try {
        // Obtenemos todas las sesiones registradas en Firebase
        const snapshot = await global.dbFirebase.ref('sessions').once('value');
        const sessions = snapshot.val() || {};

        let activeSubBots = 0;
        let totalSubBots = 0;
        let subBotsList = '';

        // Iteramos sobre las sesiones para contar y listar las que están activas
        for (const [sessionId, data] of Object.entries(sessions)) {
            totalSubBots++;
            if (data.status === 'connected') {
                activeSubBots++;
                // Agregamos el número a la lista
                subBotsList += `├ 📱 +${data.phoneNumber || 'Desconocido'}\n`;
            }
        }

        // Total general (Main bot + Sub-bots activos)
        const totalBots = activeSubBots + 1;

        // Construimos el mensaje de respuesta
        let replyText = `🤖 *PANEL DE BOTS ACTIVOS* 🤖\n`;
        replyText += `──────────────────\n\n`;
        replyText += `👑 *Bot Principal (Osaragi):* Activo ✅\n`;
        replyText += `⚙️ *Sub-Bots en línea:* ${activeSubBots} de ${totalSubBots} registrados\n`;
        replyText += `📊 *Total de bots operando:* ${totalBots}\n\n`;

        // Si hay sub-bots conectados, mostramos la lista de números
        if (activeSubBots > 0) {
            replyText += `*Sub-Bots Conectados:*\n`;
            replyText += `┌─────────────────\n`;
            replyText += subBotsList;
            replyText += `└─────────────────`;
        } else {
            replyText += `*No hay sub-bots conectados en este momento.*`;
        }

        await m.reply(replyText);

    } catch (error) {
        console.error(`[ERROR EN COMANDO ${command.toUpperCase()}]`, error);
        await m.reply('❌ Ocurrió un error al intentar consultar la base de datos de Firebase.');
    }
}

// Definimos los comandos que activarán este plugin
bots.command = ['bots', 'subbots', 'listabots'];
