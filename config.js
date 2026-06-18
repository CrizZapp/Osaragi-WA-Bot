import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

export const owners = [
  { lid: "212210794119298@lid", name: "Allen </>" }
];

export const isOwner = (senderLid) => {
  const ownerData = owners.find(o => o.lid === senderLid);
  return {
    check: !!ownerData,
    name: ownerData ? ownerData.name : null
  };
};

export const getAdmins = (participants) => {
  const admins = [];
  for (const participant of participants) {
    if (participant.admin === 'admin' || participant.admin === 'superadmin') {
      admins.push(participant.id);
    }
  }
  return admins;
};

export const getGroupName = async (sock, jid) => {
  try {
    const metadata = await sock.groupMetadata(jid);
    return metadata.subject;
  } catch (error) {
    return "Grupo Desconocido";
  }
};

export const sendCarousel = async (sock, jid, mainText, mainFooter, cardsData, quotedMsg = null) => {
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

    // Construcción limpia del header de la tarjeta para evitar errores de parseo
    const cardHeader = { hasMediaAttachment: hasMedia };
    if (card.title) cardHeader.title = card.title;
    if (hasMedia) cardHeader.imageMessage = imageMessage;

    formattedCards.push({
      header: cardHeader,
      body: { text: card.text || "" },
      footer: { text: card.footer || "Osagari Bot" },
      nativeFlowMessage: { buttons }
    });
  }

  const msg = generateWAMessageFromContent(jid, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: { text: mainText },
          footer: { text: mainFooter },
          carouselMessage: { cards: formattedCards }
        }
      }
    }
  }, { userJid: sock.user.id, quoted: quotedMsg });

  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
};

export const sendList = async (sock, jid, text, footer, buttonText, sections, imagePath = null, quotedMsg = null) => {
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

  // Construcción limpia del header global
  const msgHeader = { hasMediaAttachment: hasMedia };
  if (hasMedia) msgHeader.imageMessage = imageMessage;

  const msg = generateWAMessageFromContent(jid, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          header: msgHeader,
          body: { text: text },
          footer: { text: footer },
          nativeFlowMessage: { buttons }
        }
      }
    }
  }, { userJid: sock.user.id, quoted: quotedMsg });

  await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
};
