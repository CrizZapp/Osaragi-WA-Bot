import { execSync } from 'child_process';
import chalk from 'chalk';

const handler = async (m, { conn, from }) => {
    // Aquí puedes agregar tu validación de dueño si lo necesitas
    // if (!esOwner) return;

    await m.reply('🕒 *Conectando con CrizZapp/Osaragi-WA-Bot...*');

    try {
        // Ejecutamos el git pull apuntando a tu repo
        const stdout = execSync('git pull https://github.com/CrizZapp/Osaragi-WA-Bot.git');
        let output = stdout.toString().trim();

        // Verificamos si ya está al día
        if (output.includes('Already up to date.')) {
            return await m.reply('✨ *El sistema ya se encuentra en la última versión disponible.*');
        }

        // Si se actualizó, mandamos el mensaje y reiniciamos
        await m.reply(`✅ *Actualización exitosa:*\n\n> ${output}\n\n♻️ *Reiniciando el servidor para aplicar los cambios...*`);
        
        console.log(chalk.hex("#00FF7F")(`\n[UPDATE] Actualización aplicada. Reiniciando proceso...`));
        
        // Apagamos el proceso. El panel de Pterodactyl lo reiniciará automáticamente.
        setTimeout(() => {
            process.exit(0);
        }, 1500);

    } catch (error) {
        console.error(chalk.hex("#FF4500")(`[UPDATE ERROR] Fallo al actualizar:`), error);
        
        try {
            // Si hay error, vemos qué archivos locales están haciendo conflicto
            const status = execSync('git status --porcelain').toString();
            
            if (status.length > 0) {
                const conflictedFiles = status
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => `*→ ${line.slice(3)}*`)
                    .join('\n');

                await m.reply(`❌ *Conflictos detectados:*\n\nHay cambios locales en tu servidor que chocan con la actualización de GitHub:\n\n${conflictedFiles}\n\n*Solución:* Borra esos archivos o haz un \`git stash\` desde la consola del panel antes de volver a intentar.`);
            } else {
                await m.reply('❌ *Error al actualizar:* ' + error.message);
            }
        } catch (err) {
            await m.reply('❌ *Ocurrió un error crítico durante el protocolo de actualización.*');
        }
    }
};

handler.command = ['update', 'actualizar', 'fix'];
export default handler;
