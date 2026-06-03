import { execSync } from 'child_process';
import chalk from 'chalk';

const handler = async (m, { conn }) => {
    await m.reply('🕒 *Conectando con el repositorio...*');

    try {
        // Traemos lo nuevo de GitHub
        const stdout = execSync('git pull https://github.com/CrizZapp/Osaragi-WA-Bot.git');
        let output = stdout.toString().trim();

        if (output.includes('Already up to date.')) {
            return await m.reply('✨ *El sistema ya está actualizado a la última versión.*');
        }

        await m.reply(`✅ *Actualización exitosa:*\n\n> ${output}\n\n♻️ *Reiniciando servidor...*`);
        
        console.log(chalk.hex("#00FF7F")(`\n[UPDATE] Reiniciando por actualización...`));
        setTimeout(() => { process.exit(0); }, 1500);

    } catch (error) {
        console.error(chalk.hex("#FF4500")(`[UPDATE ERROR]`), error);
        
        try {
            // Revisamos el status de Git
            const status = execSync('git status --porcelain').toString();
            
            if (status.length > 0) {
                // Filtramos las carpetas y archivos que cambian solos en el servidor
                const conflictedFiles = status
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const filePath = line.slice(3).trim();
                        // Ignoramos todo el ruido del entorno
                        if (
                            filePath.includes('.npm/') ||
                            filePath.includes('node_modules/') ||
                            filePath.includes('database.json') ||
                            filePath.includes('session/') ||
                            filePath.includes('tmp/') ||
                            filePath.includes('package-lock.json')
                        ) {
                            return null;
                        }
                        return `*→ ${filePath}*`;
                    })
                    .filter(Boolean); // Elimina los nulos

                // Si después de filtrar queda algún archivo de código real (como index.js o handler.js)
                if (conflictedFiles.length > 0) {
                    return await m.reply(`❌ *Conflictos de código detectados:*\n\nModificaste archivos directamente en el panel que chocan con GitHub:\n\n${conflictedFiles.join('\n')}\n\n*¿Cómo solucionarlo?*\nSube esos cambios a tu GitHub antes de actualizar, o usa \`#update force\` (si decides implementar la opción de forzar).`);
                }
            }
            
            // Si el error no fue por un conflicto de archivos de código, muestra el error común
            await m.reply('❌ *Error al intentar actualizar:* ' + error.message);
            
        } catch (err) {
            await m.reply('❌ *Ocurrió un error inesperado en el protocolo.*');
        }
    }
};

handler.command = ['update', 'actualizar', 'fix'];
export default handler;
