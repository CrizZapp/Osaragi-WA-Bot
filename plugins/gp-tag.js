import chalk from 'chalk';

const plugin = async (m, { sock, from, args }) => {

    // validar grupo
    if (!from.endsWith("@g.us"))
        return m.reply("❌ Este comando solo funciona en grupos.");

    // validar texto
    if (!args.length)
        return m.reply("Debes escribir algo.\nEj: #tag hola a todos!");

    try {
        // obtener metadata del grupo
        const groupMeta = await sock.groupMetadata(from);

        if (!groupMeta?.participants?.length)
            return m.reply("❌ No se pudieron obtener los participantes.");

        const participants = groupMeta.participants.map(p => p.id);

        const msgText = args.join(" ");

        await sock.sendMessage(from, {
            text: msgText,
            mentions: participants
        }, { quoted: m });

    } catch (e) {
        console.error(chalk.red("[TAG ERROR]"), e);
        m.reply("❌ Ocurrió un error al ejecutar el comando.");
    }
};

plugin.command = ['tag'];

export default plugin;
