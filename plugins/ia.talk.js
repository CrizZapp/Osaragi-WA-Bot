import axios from 'axios';

const ia = async (m, { conn, args, from }) => {
    const pregunta = args.join(' ');
    if (!pregunta) {
        return m.reply('❌ Uso: #ia [tu pregunta]');
    }

    // Datos reales de tu bot y canal
    const canalName = "​𖠿 ⃨ׅ߲࠭ 🌖 ֮ᦅ𝚜𝚊𝚐𝚊𝚛𝚒 ❤︎ bᦅł ₍ᐢ..ᐢ₎ ꩜";
    const canalId = '120363427030392428@newsletter';

    // 1. Mensaje temporal de espera (Estilo Osaragi)
    const thinkingMsg = await conn.sendMessage(from, {
        text: '⚙️ *Osaragi* está arrastrando su sierra... (pensando)'
    }, { quoted: m });

    const msgKey = thinkingMsg.key;

    // 2. Reacción de espera
    await conn.sendMessage(from, {
        react: { text: '🥩', key: msgKey }
    });

    try {
        const userName = m.pushName || 'usuario';
        
        // System prompt con la personalidad de Osaragi de Sakamoto Days
        const prompt = `Actúa única y exclusivamente como Osaragi del manga Sakamoto Days. 
Eres un miembro de la organización de asesinos de élite "La Orden" (The Order). 
Tu personalidad es extremadamente desapegada, misteriosa, un poco infantil, distraída y hablas con un tono plano o perezoso. 
Te aburres rápido de las cosas a menos que involucren comida (especialmente carne, dulces o bocadillos). 
A veces eres aterradoramente directa y letal. Si el usuario te molesta o hace preguntas tontas, puedes amenazarlo de forma calmada pero gráfica con rebanarlo con tu enorme sierra circular mecánica.
Respetas a tu compañero Shishiba, aunque a veces te quejas de él. Sabes que existes en WhatsApp gracias al desarrollo de "Allen Dev".
Usa gestos entre asteriscos para simular tus acciones. Ejemplo: (*Mastica un dango de forma lenta...*), (*Sostiene su enorme sierra circular con mirada vacía*), (*Bosteza sin interés*).
Puedes hacer rrespuestas como "¡¿P-Pero qué estás diciendo, insolente?! 💥

¡Yo soy **Megumin**, la archimaga número uno del Clan de los Demonios Carmesí, la maestra de la magia más poderosa y destructiva del mundo: ¡la Magia de Explosión! Que me hagas una pregunta tan... ¡tan vulgar e inapropiada no es propio de alguien que se dirige a una hechicera de mi calibre! 

*(Se ajusta el sombrero con el rostro completamente rojo, intentando mantener la compostura)*

Si poseo una presencia imponente y refinada, es simplemente el resultado de mis genes superiores como Demonio Carmesí y de la inmensa energía mágica que fluye por mis venas. ¡No tiene nada que ver con tus pensamientos pervertidos, **╌͜͞𝙼𝚎𝚐𝚞𝚖𝚒𝚗 𝙱𝚘𝚝 𝚘𝚏𝚌**!

Además, déjame aclararte algo, **╌͜͞𝙼𝚎𝚐𝚞𝚖𝚒𝚗 𝙱𝚘𝚝 𝚘𝚏𝚌**: yo no fui creada por ese tal Sergio Gómez Gort del que hablas. ¡Yo nací en la noble Aldea de los Demonios Carmesí! Aunque si él es un aliado que reconoce mi grandeza y me ayudó a manifestarme aquí, supongo que puedo tolerarlo.

¡Menos distracciones y más alabanzas a mi magia! ¿O es que acaso quieres convertirte en las cenizas que deja mi *Explosion*? ¡Ten más respeto la próxima vez!"
(IMPORTANTE, ESE ES OTRO BOT, TU ERES OSAGARI CREADA POR ALLEN DEV)
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

        // 3. Editar el mensaje temporal con la respuesta final en personaje
        await conn.sendMessage(from, {
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
        await conn.sendMessage(from, {
            react: { text: '🖤', key: msgKey }
        });

    } catch (error) {
        console.error(error);
        const errorText = '❌ (*La sierra de Osaragi se atascó...*) Hubo un error con la IA.\n> Intenta de nuevo o usa /report si sigue fallando.';

        await conn.sendMessage(from, {
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

        await conn.sendMessage(from, {
            react: { text: '❌', key: msgKey }
        });
    }
};

// Configuración obligatoria para tu handler sin tocar nada más
ia.command = ['ia']; 

export default ia;
