import { sendList } from '../config.js';

const menuPlugin = async (m, { conn, from, sender }) => {
  const userName = m.pushName || "Usuario";

  // Estructura estricta: Solo title, description e id dentro de los rows
  const sections = [
    {
      title: "📌 PRINCIPAL",
      rows: [
        {
          title: "🆔 Mi ID",
          description: "Ver tu identificador de cuenta",
          id: "#miid"
        },
        {
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
          description: "Ver recursos del sistema y uptime",
          id: "#status"
        }
      ]
    }
  ];

  const textoMenu = `° ₊‧Ƹ̵̡Ӝ̵̨̄Ʒ Bienvenido ૮3 ‧₊°\nhola ${userName}! ( ˶>w<˶)\nespero que estés teniendo un buen día! ✿\n\n◇ Comandos disponibles ◇`;

  await sendList(
    conn,
    from,
    textoMenu,
    "Osagari Bot • 2026",
    "🗂️ Toca aqui ✿", 
    sections,
    './banner.jpg',
    m // Pasamos el mensaje original para citarlo y evitar fallos de desencriptación
  );
};

menuPlugin.command = ['menu', 'help'];

export default menuPlugin;
