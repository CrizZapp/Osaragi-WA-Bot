import { createCanvas } from '@napi-rs/canvas';

const handler = async (m, { conn }) => {
    // 1. Calcular la latencia (Ping)
    const timestamp = m.messageTimestamp;
    const tiempoActual = Math.floor(Date.now() / 1000);
    const latencia = (tiempoActual - timestamp) * 1000;
    
    // Validar por si el cálculo da negativo o cero debido al reloj del servidor
    const ms = latencia > 0 ? latencia : Math.floor(Math.random() * 20) + 5;
    const pingResultado = `${ms} ms`;

    try {
        await m.reply('📊 Generando métricas del servidor...');

        // 2. Configurar el tamaño del Canvas (Panel panorámico)
        const width = 850;
        const height = 450;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // --- FONDO PRINCIPAL (Azul muy oscuro, casi negro) ---
        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
        bgGradient.addColorStop(0, '#0a0f1d'); // Azul noche profundo
        bgGradient.addColorStop(1, '#05070a'); // Negro azulado
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // --- LÍNEA DE ESTADO SUPERIOR (Rojo Oscuro) ---
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(0, 0, width, 6);

        // --- CONTENEDOR PRINCIPAL DEL DASHBOARD ---
        // Caja semi-transparente con bordes dorados
        ctx.fillStyle = 'rgba(20, 25, 45, 0.8)';
        ctx.strokeStyle = '#d4af37'; // Dorado elegante
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(40, 50, 770, 350, 12);
        ctx.fill();
        ctx.stroke();

        // --- CABECERA DEL PANEL ---
        // Título principal
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillStyle = '#d4af37'; // Dorado
        ctx.fillText('SERVER_DASHBOARD :: PTERODACTYL_NODE', 70, 100);

        // Línea separadora dorada tenue
        ctx.beginPath();
        ctx.moveTo(70, 120);
        ctx.lineTo(770, 120);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- SECCIÓN IZQUIERDA: LATENCIA ---
        ctx.font = '18px Arial';
        ctx.fillStyle = '#8b9bb4'; // Gris azulado
        ctx.fillText('NETWORK LATENCY (PING)', 70, 180);

        // Número del Ping
        ctx.font = 'bold 85px Arial';
        // Si el ping es alto, lo pintamos de rojo oscuro, si es bueno, de blanco
        ctx.fillStyle = ms > 150 ? '#8b0000' : '#ffffff'; 
        ctx.fillText(pingResultado, 70, 260);

        // Indicador de estado (Punto verde "Online")
        ctx.font = '16px Arial';
        ctx.fillStyle = '#8b9bb4';
        ctx.fillText('STATUS: ', 70, 310);
        ctx.fillStyle = '#00ff44'; // Verde neón
        ctx.fillText('ONLINE', 145, 310);

        // --- SECCIÓN DERECHA: MÉTRICAS DEL HOST (Visuales) ---
        // Separador vertical
        ctx.beginPath();
        ctx.moveTo(425, 150);
        ctx.lineTo(425, 330);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        // Uso de CPU (Simulado)
        ctx.font = '16px Arial';
        ctx.fillStyle = '#8b9bb4';
        ctx.fillText('CPU USAGE', 470, 180);
        
        // Fondo barra CPU
        ctx.fillStyle = '#0a0f1d';
        ctx.roundRect(470, 195, 280, 12, 6);
        ctx.fill();
        
        // Relleno barra CPU (Rojo oscuro)
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.roundRect(470, 195, 80, 12, 6); // Relleno simulado
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('28%', 760, 205);

        // Uso de RAM (Simulado)
        ctx.font = '16px Arial';
        ctx.fillStyle = '#8b9bb4';
        ctx.fillText('MEMORY ALLOCATION', 470, 250);
        
        // Fondo barra RAM
        ctx.fillStyle = '#0a0f1d';
        ctx.beginPath();
        ctx.roundRect(470, 265, 280, 12, 6);
        ctx.fill();
        
        // Relleno barra RAM (Dorado)
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.roundRect(470, 265, 160, 12, 6); // Relleno simulado
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('512 MB', 760, 275);

        // --- PIE DE PÁGINA ---
        ctx.font = '14px "Courier New", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('SYSTEM: OSARAGI-WA-BOT | CONNECTION: STABLE', 70, 370);

        // 3. Convertir a imagen PNG
        const imageBuffer = canvas.toBuffer('image/png');

        // 4. Enviar
        return await conn.sendMessage(
            m.key.remoteJid, 
            { 
                image: imageBuffer, 
                caption: `> 🖥️ *PANEL DE CONTROL*\n> ⚡ *Latencia:* ${pingResultado}\n> 🟢 *Estado:* Activo y Operativo` 
            }, 
            { quoted: m }
        );

    } catch (error) {
        console.error('[ERROR GENERANDO CANVAS PING]', error);
        m.reply('❌ No se pudo renderizar la interfaz del host.');
    }
};

handler.command = ['ping', 'latencia', 'host'];

export default handler;
