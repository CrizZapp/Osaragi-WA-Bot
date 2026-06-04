const handler = async (m, { conn, from, args }) => {
    const status = args[0]?.toLowerCase();
    if (status === 'on') {
        global.botStatus[from] = true;
        m.reply('✅ Bot activado.');
    } else if (status === 'off') {
        global.botStatus[from] = false;
        m.reply('💤 Bot desactivado.');
    }
};
handler.command = ['bot'];
export default handler;
