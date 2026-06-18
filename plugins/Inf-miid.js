import { getGroupName, sendCarousel } from '../config.js';

const miidPlugin = async (m, { conn, from, sender }) => {
  const userName = m.pushName || "Usuario";
  const groupName = await getGroupName(conn, from);

  const cards = [
    {
      title: "Identificación de Cuenta",
      text: `👤 Nombre: ${userName}\n\n🆔 Identificador:\n${sender}\n\n🌍 Origen: ${groupName}`,
      footer: "Osaragi Bot • 2026",
      image: './banner.jpg', // Asegúrate de tener esta imagen en la raíz o cambiar la ruta
      buttons: [
        {
          // Este tipo de botón permite copiar texto directamente al portapapeles
          type: "cta_copy",
          params: { 
            display_text: "📋 Copiar ID", 
            copy_code: sender 
          }
        },
        {
          type: "cta_url",
          params: { 
            display_text: "Soporte Técnico", 
            url: "https://github.com", 
            merchant_url: "https://github.com" 
          }
        }
      ]
    }
  ];

  await sendCarousel(
    conn, 
    from, 
    "*SISTEMA DE VERIFICACIÓN OSARAGI*", 
    "CrizZap system v1.1", 
    cards
  );
};

// Aquí definimos los nombres del comando para que tu handler los encuentre
miidPlugin.command = ['miid', 'id'];

export default miidPlugin;
