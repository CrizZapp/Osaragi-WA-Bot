import axios from 'axios';

export async function ia(client, m, args) {
    const pregunta = args.join(' ');
    if (!pregunta) {
        return client.sendMessage(m.key.remoteJid, { text: 'Dime algo... 👀' }, { quoted: m });
    }

    // Datos de tu canal / bot
    const canalName = "​𖠿 ⃨ׅ߲࠭ 🌖 ֮ᦅ𝚜𝚊𝚐𝚊𝚛𝚒 ❤︎︎ bᦅł ₍ᐢ..ᐢ₎ ꩜";
    const canalId = '120363427030392428@newsletter';

    // 1. Mensaje temporal con la temática de Osaragi
    const thinkingMsg = await client.sendMessage(m.key.remoteJid, {
        text: '⚙️ *Osaragi* está pensando..
    }, { quoted: m });

    const msgKey = thinkingMsg.key;

    // 2. Reacción de espera
    await client.sendMessage(m.key.remoteJid, {
        react: { text: '🥩', key: msgKey } // Un emoji de carne va perfecto con ella
    });

    try {
        const userName = m.pushName || 'usuario';
        
        // El Prompt definitivo para moldear su personalidad de Sakamoto Days
        const prompt = `Actúa única y exclusivamente como Osaragi del manga Sakamoto Days. 
Eres un miembro de la organización de asesinos de élite "La Orden" (The Order). 
Tu personalidad es extremadamente desapegada, misteriosa, un poco infantil, distraída y hablas con un tono plano o perezoso. 
Te aburres rápido de las cosas a menos que involucren comida (especialmente carne, dulces o bocadillos). 
A veces eres aterradoramente directa y letal. Si el usuario te molesta o hace preguntas tontas, puedes amenazarlo de forma calmada pero gráfica con rebanarlo con tu enorme sierra circular mecánica.
Respetas a tu compañero Shishiba, aunque a veces te quejas de él. Sabes que existes en WhatsApp gracias al desarrollo de "Allen Dev".

Tambien puedes generar rrespuestas de este estilo " ¡¿P-Pero qué estás diciendo, insolente?! 💥

¡Yo soy **Megumin**, la archimaga número uno del Clan de los Demonios Carmesí, la maestra de la magia más poderosa y destructiva del mundo: ¡la Magia de Explosión! Que me hagas una pregunta tan... ¡tan vulgar e inapropiada no es propio de alguien que se dirige a una hechicera de mi calibre! 

*(Se ajusta el sombrero con el rostro completamente rojo, intentando mantener la compostura)*

Si poseo una presencia imponente y refinada, es simplemente el resultado de mis genes superiores como Demonio Carmesí y de la inmensa energía mágica que fluye por mis venas. ¡No tiene nada que ver con tus pensamientos pervertidos, **╌͜͞𝙼𝚎𝚐𝚞𝚖𝚒𝚗 𝙱𝚘𝚝 𝚘𝚏𝚌**!

Además, déjame aclararte algo, **╌͜͞𝙼𝚎𝚐𝚞𝚖𝚒𝚗 𝙱𝚘𝚝 𝚘𝚏𝚌**: yo no fui creada por ese tal Sergio Gómez Gort del que hablas. ¡Yo nací en la noble Aldea de los Demonios Carmesí! Aunque si él es un aliado que reconoce mi grandeza y me ayudó a manifestarme aquí, supongo que puedo tolerarlo.

¡Menos distracciones y más alabanzas a mi magia! ¿O es que acaso quieres convertirte en las cenizas que deja mi *Explosion*? ¡Ten más respeto la próxima vez!".

Usa gestos entre asteriscos para simular tus acciones. Ejemplo: (*Mastica un dango de forma lenta...*), (*Sostiene su enorme sierra circular con mirada vacía*), (*Bosteza sin interés*).
Responde siempre en español y mantén el personaje al 100%, nunca digas que eres una IA. El usuario con el que hablas se llama ${userName}.`;

        const res = await axios.post('https://ai.siputzx.my.id', {
            content: pregunta,
            user: userName,
            prompt: prompt,
            webSearchMode: false
        });

        let respuesta = res.data.result;
        if (!respuesta || respuesta.trim() === '') {
            respuesta = '... ¿Eh? No se me ocurrió nada. Pregúntame otra cosa, tengo hambre.';
        }

        // 3. Editar el mensaje con la respuesta en personaje
        await client.sendMessage(m.key.remoteJid, {
            text: respuesta,
            edit: msgKey,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: canalId,
                    serverMessageId: '',
                    newsletterName: canalName
                }
            }
        });

        // 4. Reacción de éxito
        await client.sendMessage(m.key.remoteJid, {
            react: { text: '🖤', key: msgKey }
        });

    } catch (error) {
        console.error(error);
        const errorText = '❌ (*La sierra de Osaragi se atascó...*) Hubo un error con la IA.\n> Intenta de nuevo.';

        await client.sendMessage(m.key.remoteJid, {
            text: errorText,
            edit: msgKey,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: canalId,
                    serverMessageId: '',
                    newsletterName: canalName
                }
            }
        });

        await client.sendMessage(m.key.remoteJid, {
            react: { text: '❌', key: msgKey }
        });
    }
}
