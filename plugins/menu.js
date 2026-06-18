import { getGroupName, sendCarousel } from '../config.js';

const miidPlugin = async (m, { conn, from, sender }) => {
  const userName = m.pushName || "Usuario";
  const groupName = await getGroupName(conn, from);

  const cards = [
    {
      title: "*〇ׁ ˳ּ𑁍 ׁ✹ ⋆☤ ᗰᗴᑎᑌ ♕ OՏᗩᘜᗩᖇI ☤⋆ ✺˳ּ ׁ〇*",
      text: `👤 Usuario: ${userName}\n\n🆔 Identificador:\n${sender}\n\n🧸Grupo: ${groupName}`,
      footer: "𝓞𝓈𝓪𝓰𝖆𝖗𝖎 • 2026",
      image: './banner.jpg', 
   
      buttons: [
        {
          type: "cta_copy",
          params: { 
            display_text: "📋 𝐓𝐨𝐜𝐚 𝐩𝐚𝐫𝐚 𝐜𝐨𝐩𝐢𝐚𝐫", 
            copy_code: "Allen es God :D"
          }
        },
       {
          type: "cta_copy",
          params: { 
            display_text: "🧸 𝐋𝐚𝐭𝐞𝐧𝐜𝐢𝐚 🧸", 
            copy_code: "#ping"
          }
        },
        {
          type: "cta_copy",
          params: { 
            display_text: "🕹 𝐄𝐬𝐭𝐞 𝐦𝐞𝐧𝐮 🕹", 
            copy_code: "#menu"
          }
        },
        {
          type: "cta_copy",
          params: { 
            display_text: "🕹 𝐏𝐢𝐧𝐞𝐫𝐞𝐬𝐭 𝐬𝐞𝐚𝐫𝐜𝐡 🕹", 
            copy_code: "#pin"
          }
        },
         {
          type: "cta_copy",
          params: { 
            display_text: "🕹 𝐌𝐮𝐬𝐢𝐜𝐚 (𝐀𝐮𝐝𝐢𝐨)🕹", 
            copy_code: "#playaudio"
          }
        },
        {
          type: "cta_copy",
          params: { 
            display_text: "🕹 𝐌𝐮𝐬𝐢𝐜𝐚 (𝐕𝐢𝐝𝐞𝐨) 🕹", 
            copy_code: "#play"
          }
        },
        {
          type: "cta_copy",
          params: { 
            display_text: "🕹 𝐒𝐞𝐫 𝐛𝐨𝐭 🕹", 
            copy_code: "desactivado por el creador"
          }
        },
        {
          type: "cta_copy",
          params: { 
            display_text: "🧸✨️ 𝐈𝐀✨️", 
            copy_code: "#ia"
          }
        },
        {
          type: "cta_url",
          params: { 
            display_text: "🕹 𝐂𝐚𝐧𝐚𝐥 🕹", 
            url: "https://whatsapp.com/channel/0029VbDdtHHBPzjeRStWI41P", 
            merchant_url: "https://whatsapp.com/channel/0029VbDdtHHBPzjeRStWI41P" 
          }
        }
      ]
    }
  ];

  await sendCarousel(
    conn, 
    from, 
    "𐔌՞. .՞𐦯 𝒮𝓎𝓈𝓉𝑒𝓂𝒶 𝒹𝑒 𝓜𝖊𝖓𝖚 𝓞𝓈𝓪𝓰𝖆𝖗𝖎", 
    "𑁍˳ּ𝓞𝓈𝓪𝓰𝖆𝖗𝖎˳ּ𑁍", 
    cards
  );
};


miidPlugin.command = ['help', 'menu'];

export default miidPlugin;
