import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

export const owners = [
  { lid: "549111111111@lid", name: "Allen Dev" }
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
