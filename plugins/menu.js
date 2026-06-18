import { getGroupName, sendCarousel } from '../config.js';

const miidPlugin = async (m, { conn, from, sender }) => {
  try {
    const userName = m.pushName || "Usuario";
    const groupName = await getGroupName(conn, from);

    const cards = [
      {
        title: "*〇ׁ ˳ּ𑁍 ׁ✹ ⋆☤ ᗰᗴᑎᑌ ♕ OՏᗩᘜᗩᖇI ☤⋆ ✺˳ּ ׁ〇*",
        text: `👤 Usuario: ${userName}\n\n🧸 Grupo: ${groupName}`,
        footer: "𝓞𝓈𝓪𝓰𝖆𝖗𝖎 • 2026",
        
        // ⚠️ ASEGURATE de que esta imagen exista. Si querés ir a lo seguro, poné una URL como en tu prueba.
        image: './banner.jpg', 
     
        buttons: [
          {
            type: "quick_reply",
            params: {
              display_text: "🧨 𝐋𝐚𝐭𝐞𝐧𝐜𝐢𝐚 ✨️",
              id: "#ping"
            }
          },
          {
            type: "cta_copy",
            params: {
              display_text: "📋 𝐂𝐨𝐩𝐢𝐚𝐫",
              copy_code: "Allen es God :D"
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

    // Llamamos a la función sin pasarle el 'm' para evitar que falle el quotedMsg
    await sendCarousel(
      conn, 
      from, 
      "𐔌՞. .՞𐦯 𝒮𝓎𝓈𝓉𝑒𝓂𝒶 𝒹𝑒 𝓜𝖊𝖓𝖚 𝓞𝓈𝓪𝓰𝖆𝖗𝖎", 
      "𑁍˳ּ𝓞𝓈𝓪𝓰𝖆𝖗𝖎˳ּ𑁍", 
      cards
    );

  } catch (error) {
    // Si sigue fallando, esto te va a decir exactamente por qué en la consola.
    console.error("Error crítico al ejecutar el plugin miid:", error);
  }
};

miidPlugin.command = ['menu', 'help'];

export default miidPlugin;
