const plugin = async (m, { sender }) => {
    // 'sender' ya viene filtrado desde tu handler principal
    return m.reply(`╭─❍ 「 🆔 𝗧𝗨 𝗜𝗗 」\n┃ \n┃ ✧ \`${sender}\`\n┃ \n╰─────────────⬣\n\n*Nota:* Mantén presionado el ID de arriba para copiarlo de forma más fácil.`);
};

plugin.command = ['miid', 'myid', 'id'];

export default plugin;
