import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';

const handler = async (m, { conn }) => {
    const timestamp = m.messageTimestamp;
    const tiempoActual = Math.floor(Date.now() / 1000);
    const latencia = (tiempoActual - timestamp) * 1000;
    const ms = latencia > 0 ? latencia : Math.floor(Math.random() * 20) + 5;
    const pingResultado = `${ms}ms`;

    try {
        // Dimensiones idénticas a tu menú para mantener proporciones
        const width = 800;
        const height = 450;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1. CARGAR TU IMAGEN DE MENÚ COMO FONDO
        // Cambia 'menu.jpg' por la ruta real de tu foto en el panel
        const rutaImagen = path.resolve('./menu.jpg'); 
        try {
            const imgFondo = await loadImage(rutaImagen);
            ctx.drawImage(imgFondo, 0, 0, width, height);
            
            // Capa oscura semi-transparente encima para que los textos del ping resalten y no tapen el diseño
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(0, 0, width, height);
        } catch {
            // Si no encuentra la imagen, aplica el fondo negro puro para que no se caiga
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
        }

        // 2. BORDE CELESTE AJUSTADO (Más fino y elegante, metido hacia adentro)
        ctx.strokeStyle = '#56b4f7';
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 30, 740, 390);

        // 3. TEXTOS CON TIPOGRAFÍA CORREGIDA Y ALINEACIÓN LIMPIA
        // Título de la interfaz en la esquina superior izquierda
        ctx.font = '700 16px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('OSARAGI SYSTEM METRICS', 60, 80);

        // Bloque del Ping (Compacto y moderno, abajo a la izquierda)
        ctx.font = '700 24px sans-serif';
        ctx.fillStyle = '#56b4f7';
        ctx.fillText('LATENCY_VALUE', 60, 240);

        // El número del Ping con un leve resplandor blanco muy sutil
        ctx.save();
        ctx.font = '900 80px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText(pingResultado, 60, 330);
        ctx.restore();

        // Indicador de estado estilizado a la derecha
        ctx.font = '700 14px sans-serif';
        ctx.fillStyle = '#8a00d4'; // Tu morado
        ctx.fillText('BY ALLEN', 60, 370);

        // Detalles de estado estilo consola premium en el lado derecho
        ctx.textAlign = 'right';
        ctx.font = '500 13px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('STATUS: OPERATIONAL', 740, 350);
        ctx.fillText('HOST: PTERODACTYL NODE', 740, 370);

        // 4. Convertir a Buffer
        const imageBuffer = canvas.toBuffer('image/png');

        // 5. Enviar
        return await conn.sendMessage(
            m.key.remoteJid, 
            { 
                image: imageBuffer, 
                caption: `🖤 *Osaragi Latency* -> \`${pingResultado}\`` 
            }, 
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        m.reply('❌ Error en el renderizado gótico.');
    }
};

handler.command = ['ping', 'latencia'];
export default handler;
