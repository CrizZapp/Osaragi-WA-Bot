const handler = async (m, { conn, args }) => {

    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us"))
        return m.reply("❌ Solo funciona en grupos.");

    if (!args.length)
        return m.reply("Ejemplo: #tag hola a todos");

    const groupMeta = await conn.groupMetadata(from);
    const participants = groupMeta?.participants?.map(p => p.id);

    if (!participants || !participants.length)
        return m.reply("❌ No se pudieron obtener los participantes.");

    await conn.sendMessage(from, {
        text: args.join(" "),
        mentions: participants
    }, { quoted: m });

};

handler.command = ['tag'];

export default handler;
