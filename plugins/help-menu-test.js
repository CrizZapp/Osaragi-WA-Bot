import { sendList } from '../config.js';

const menuPlugin = async (m, { conn, from, sender }) => {
  // Baileys nos da el @lid en sender, así que extraemos el nombre real del payload
  const userName = m.pushName || "Usuario";

  const sections = [
    {
      title: "📌 PRINCIPAL",
      rows: [
        {
          header: "Información",
          title: "🆔 Mi ID",
          description: "Ver tu identificador de cuenta",
          id: "#miid"
        },
        {
          header: "Sistema",
          title: "⚡ Ping",
          description: "Ver velocidad de respuesta del bot",
          id: "#ping"
        }
      ]
    },
    {
      title: "⚙️ CONFIGURACIÓN",
      rows: [
        {
          title: "📊 Estado del bot",
          id: "#status"
        }
      ]
    }
  ];

  // Usamos userName en lugar del intento fallido de sacar el número
  const textoMenu = `° ₊‧Ƹ̵̡Ӝ̵̨̄Ʒ Bienvenido ૮3 ‧₊°\nhola ${userName}! ( ˶>w<˶)\nespero que estés teniendo un buen día! ✿\n\n◇ Comandos disponibles ◇`;

  await sendList(
    conn,
    from,
    textoMenu,
    "Osaragi Bot • 2026",
    "🗂️ Toca aqui ✿", 
    sections,
    './banner.jpg' 
  );
};

menuPlugin.command = ['menu', 'help'];

export default menuPlugin;
