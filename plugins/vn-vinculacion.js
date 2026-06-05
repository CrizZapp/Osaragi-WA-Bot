const codePlugin = async (m, { args }) => {
    if (!args || args.length === 0) {
        return m.reply("❌ Ingresa un número válido.\n\n*Ejemplo:* `#code 549112345678`");
    }

    const phoneNumber = args.join('').replace(/[^0-9]/g, "");
    if (!phoneNumber) {
        return m.reply("❌ El formato es incorrecto. Ingresa solo números.");
    }

    const sessionId = "session_" + Date.now();
    const sessionRef = global.dbFirebase.ref(`sessions/${sessionId}`);

    // 1. Enviar instrucciones primero
    await m.reply(
        "📋 *INSTRUCCIONES DE VINCULACIÓN*\n\n" +
        "1. Te llegará una notificación de WhatsApp en tu barra de estado.\n" +
        "2. En unos instantes te daré el código de emparejamiento.\n" +
        "3. ⚠️ *¡Pilas!* Tenés solo 60 segundos para usarlo antes de que se destruya."
    );

    try {
        // 2. Registrar la petición en tu Firebase
        await sessionRef.set({
            phoneNumber: phoneNumber,
            status: 'pending_code'
        });

        let timeoutAsignado = false;

        const handleSnapshot = async (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            // 3. Cuando el servidor genera el pairingCode, se lo mandamos
            if (data.status === 'awaiting_connection' && data.pairingCode && !timeoutAsignado) {
                timeoutAsignado = true; // Evita duplicar el temporizador

                await m.reply(`🔑 *TU CÓDIGO DE VINCULACIÓN:*\n\n> *${data.pairingCode}*\n\nIngresalo ya mismo.`);

                // 4. Eliminar el código y la sesión a los 60 segundos exactos
                setTimeout(async () => {
                    sessionRef.off('value', handleSnapshot); // Apaga el listener
                    await sessionRef.remove(); // Borra el nodo de Firebase por seguridad
                    m.reply("🛑 El código de vinculación expiró y fue eliminado.");
                }, 60 * 1000);
            }

            // Si se conecta con éxito antes del minuto
            if (data.status === 'connected') {
                m.reply("🎉 ¡Sub-Bot conectado con éxito!");
                sessionRef.off('value', handleSnapshot);
            }

            // Si falla o se cancela la conexión antes del minuto
            if (data.status === 'disconnected') {
                m.reply("⚠️ La conexión fue rechazada o falló.");
                sessionRef.off('value', handleSnapshot);
                await sessionRef.remove();
            }
        };

        // Activamos la escucha
        sessionRef.on('value', handleSnapshot);

    } catch (error) {
        console.error("[ERROR EN CODE PLUGIN]", error);
        m.reply("❌ Error al conectar con Firebase.");
    }
};

codePlugin.command = ['code'];

export default codePlugin;
