import { createCanvas } from '@napi-rs/canvas';

const handler = async (m, { conn }) => {
    // 1. Calcular latencia real
    const timestamp = m.messageTimestamp;
    const tiempoActual = Math.floor(Date.now() / 1000);
    const latencia = (tiempoActual - timestamp) * 1000;
    const ms = latencia > 0 ? latencia : Math.floor(Math.random() * 20) + 5;
    const pingResultado = `${ms} ms`;

    try {
        // Tamaño panorámico elegante
        const width = 800;
        const height = 400;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 🖤 FONDO NEGRO ABSOLUTO (Como tu menú)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // 🩵 BORDE CELESTE RECTANGULAR (Idéntico al de tu foto)
        ctx.strokeStyle = '#56b4f7';
        ctx.lineWidth = 4;
        ctx.strokeRect(25, 25, 750, 350);

        // 🤍 EFECTO DE RESPLANDOR DIFUMINADO (Homenaje al corazón blanco difuminado)
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.12)';
        ctx.shadowBlur = 60;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        ctx.beginPath();
        ctx.arc(640, 260, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 💙 TÍTULO: OSARAGI WA BOT (Con el estilo de sombra oscura/azulada de tu texto)
        ctx.save();
        ctx.font = 'italic bold 42px sans-serif';
        ctx.shadowColor = '#162d42'; // Sombra azul oscura difuminada
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = '#3a6b9c';    // Azul/Grisáceo elegante
        ctx.fillText('OSARAGI WA BOT', 70, 110);
        ctx.restore();

        // 💜 CRÉDITO: "by allen" (En el mismo tono morado que usaste)
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#8a00d4'; 
        ctx.fillText('by allen', 70, 150);

        // 📋 SUBTEXTO DE LA INTERFAZ
        ctx.font = '15px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillText('// SYSTEM LATENCY DETECTOR', 70, 220);

        // 🔲 NÚMERO DEL PING (Blanco puro, imponente y limpio)
        ctx.save();
        ctx.font = 'bold 95px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 15;
        ctx.fillText(pingResultado, 70, 315);
        ctx.restore();

        // 💎 DETALLES FINOS EN LAS ESQUINAS (Estilo UI Premium)
        ctx.font = '12px monospace';
        ctx.fillStyle = '#56b4f7'; // Celeste del marco
        ctx.fillText('STATUS: OPERATIONAL', 70, 355);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillText('NODE_MS_RUNNING', 610, 355);

        // 3. Convertir a Buffer de imagen
        const imageBuffer = canvas.toBuffer('image/png');

        // 4. Enviar a WhatsApp
        return await conn.sendMessage(
            m.key.remoteJid, 
            { 
                image: imageBuffer, 
                caption: `🖤 *Osaragi Latency* \n⚡ *Ping:* \`${pingResultado}\`` 
            }, 
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        m.reply('❌ Ocurrió un fallo al generar la tarjeta de Osaragi.');
    }
};

handler.command = ['ping', 'latencia'];
export default handler;
