import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

// Lista de owners manejada estrictamente por @lid
export const owners = [
  { lid: "549111111111@lid", name: "Allen Dev" }
];

// Valida si el emisor (@lid) es un owner registrado
export const isOwner = (senderLid) => {
  const ownerData = owners.find(o => o.lid === senderLid);
  return {
    check: !!ownerData,
    name: ownerData ? ownerData.name : null
  };
};

// Obtiene los administradores del grupo
export const getAdmins = (participants) => {
  const admins = [];
  for (const participant of participants) {
    if (participant.admin === 'admin' || participant.admin === 'superadmin') {
      admins.push(participant.id);
    }
  }
  return admins;
};

// Obtiene el nombre del grupo de forma segura
export const getGroupName = async (sock, jid) => {
  try {
    const metadata = await sock.groupMetadata(jid);
    return metadata.subject;
  } catch (error) {
    return "Grupo Desconocido";
  }
};

// Envía mensajes interactivos tipo Carrusel (Múltiples tarjetas)
export const sendCarousel = async (sock, jid, mainText, mainFooter, cardsData) => {
  const formattedCards = [];

  for (const card of cardsData) {
    let hasMedia = false;
    let imageMessage = undefined;

    if (card.image) {
      const media = await prepareWAMessageMedia(
        { image: { url: card.image } },
        { upload: sock.waUploadToServer }
      );
      imageMessage = media.imageMessage;
      hasMedia = true;
    }

    const buttons = card.buttons.map(btn => ({
      name: btn.type,
      buttonParamsJson: JSON.stringify(btn.params)
    }));

    formattedCards.push({
      header: {
        title: card.title || "",
        hasMediaAttachment: hasMedia,
        imageMessage: imageMessage
      },
      body: {
        text: card.text || ""
      },
      footer: {
        text: card.footer || "Osaragi Bot"
      },
      nativeFlowMessage: { buttons }
    });
  }

  const msg = generateWAMessageFromContent(jid, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: { text: mainText },
          footer: { text: mainFooter },
          carouselMessage: {
            cards: formattedCards
          }
        }
      }
    }
  }, { userJid: sock.user.id });

  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
};

// Envía mensajes interactivos tipo Lista (Secciones y filas)
export const sendList = async (sock, jid, text, footer, buttonText, sections, imagePath = null) => {
  let hasMedia = false;
  let imageMessage = undefined;

  if (imagePath) {
    const media = await prepareWAMessageMedia(
      { image: { url: imagePath } },
      { upload: sock.waUploadToServer }
    );
    imageMessage = media.imageMessage;
    hasMedia = true;
  }

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: buttonText,
        sections: sections
      })
    }
  ];

  const msg = generateWAMessageFromContent(jid, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            title: "",
            hasMediaAttachment: hasMedia,
            ...(hasMedia && { imageMessage: imageMessage })
          },
          body: { text: text },
          footer: { text: footer },
          nativeFlowMessage: { buttons }
        }
      }
    }
  }, { userJid: sock.user.id });

  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
};
