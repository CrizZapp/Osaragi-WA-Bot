import chalk from 'chalk';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Definir el dueño permitido
    
    // 3. Validar que haya escrito un mensaje
    if (!args.length) {
        return m.reply(`Debes escribir un mensaje.\nEjemplo: *${usedPrefix}${command} Hola a todos!*`);
    }

    const mensajeBroadcast = args.join(" ");

    // 4. Avisar que el proceso comenzó (puede tardar un poco)
    await m.reply("📣 Iniciando el broadcast en todos los grupos... Por favor espera.");

    try {
        // 5. Obtener la lista de todos los chats de grupo del bot
        // Nota: Dependiendo de tu versión de Baileys, 'groupFetchAllParticipating' es el método más confiable.
        const todosLosGrupos = await conn.groupFetchAllParticipating();
        const gruposIds = Object.keys(todosLosGrupos);

        if (gruposIds.length === 0) {
            return m.reply("El bot no está en ningún grupo actualmente.");
        }

        // 6. Armar la plantilla con el diseño solicitado
        const textoFinal = `🗣🌐 B R O D C A S T 🌐🗣\n\n🔔 *Aviso:* ${mensajeBroadcast}\n\n𝒪𝐒𝘼𝙶𝐀𝐑𝙞  _*Bot*_`;

        let exitosos = 0;
        let fallidos = 0;

        // 7. Enviar el mensaje grupo por grupo
        for (const grupoId of gruposIds) {
            try {
                // Obtener metadata para sacar la lista de participantes del grupo actual
                const metadata = todosLosGrupos[grupoId] || await conn.groupMetadata(grupoId);
                const participantes = metadata.participants.map(p => p.id);

                // Enviar el broadcast mencionando a todos
                await conn.sendMessage(grupoId, {
                    text: textoFinal,
                    mentions: participantes
                });

                exitosos++;
                // Pequeña pausa de 1.5 segundos entre grupos para evitar que WhatsApp bloquee al bot por Spam
                await new Promise(resolve => setTimeout(resolve, 1500)); 

            } catch (error) {
                console.error(chalk.red(`[ERROR BROADCAST EN GRUPO ${grupoId}]:`), error);
                fallidos++;
            }
        }

        // 8. Informar al dueño el resultado
        await m.reply(`✅ *Broadcast finalizado*\n\n📈 Enviado con éxito a: *${exitosos}* grupos.\n❌ Falló en: *${fallidos}* grupos.`);

    } catch (e) {
        console.error(chalk.red("[ERROR GENERAL EN BROADCAST]"), e);
        m.reply("Ocurrió un error general al intentar recopilar los grupos.");
    }
};

// Configuración del comando para tu sistema de plugins
handler.command = ['bd', 'broadcast', 'brodcast']; // Soporta los tres formatos

export default handler;
