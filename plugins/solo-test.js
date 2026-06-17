import { getGroupName, sendCarousel } from '../config.js';

export default async (sock, m, from, senderLid) => {
  const userName = m.pushName || "Usuario Transmitiendo";
  const groupName = await getGroupName(sock, from);

  const cards = [
    {
      title: "Identificación de Cuenta",
      text: `👤 Nombre: ${userName}\n\n🆔 LID:\n${senderLid}\n\n🌍 Origen: ${groupName}`,
      footer: "Osaragi Bot • 2026",
      image: './banner.jpg',
      buttons: [
        {
          type: "quick_reply",
          params: { display_text: "Confirmar Identidad", id: "#id_verificado" }
        },
        {
          type: "cta_url",
          params: { display_text: "Soporte Técnico", url: "https://github.com", merchant_url: "https://github.com" }
        }
      ]
    }
  ];

  await sendCarousel(
    sock, 
    from, 
    "*SISTEMA DE VERIFICACIÓN OSARAGI*", 
    "CrizZap system v1.1", 
    cards
  );
};
