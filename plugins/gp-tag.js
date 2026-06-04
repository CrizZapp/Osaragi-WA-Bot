const plugin = async (m, { sock, from, args }) => {

    if (!from.endsWith("@g.us"))
        return m.reply("❌ Este comando solo funciona en grupos.");

    if (!args.length)
        return m.reply("Debes escribir algo.\nEj: #tag Hola a todos!");

    const groupMeta = await sock.groupMetadata(from);
    const participants = groupMeta.participants.map(p => p.id);

    const msgText = args.join(" ");

    await sock.sendMessage(from, {
        text: msgText,
        mentions: participants
    }, { quoted: m });
};

plugin.command = ['tag'];

export default plugin;
