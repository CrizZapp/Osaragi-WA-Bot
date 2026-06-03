import { execSync } from 'child_process';
import chalk from 'chalk';

const handler = async (m, { conn, args }) => {
    const repoUrl = 'https://github.com/CrizZapp/Osaragi-WA-Bot.git';
    
    // Verificamos si escribiste "#update force"
    const isForce = args && args[0]?.toLowerCase() === 'force';

    if (isForce) {
        await m.reply('🚀 *Ejecutando actualización forzada...* Descartando cambios locales del panel.');
        try {
            // Trae los datos de GitHub y sobreescribe TODO lo que esté trackeado
            execSync(`git fetch ${repoUrl}`);
            const stdout = execSync('git reset --hard FETCH_HEAD');
            let output = stdout.toString().trim();

            await m.reply(`✅ *Actualización forzada con éxito:*\n\n> ${output}\n\n♻️ *Reiniciando servidor...*`);
            
            console.log(chalk.hex("#00FF7F")(`\n[UPDATE FORCE] Reseteado a la última versión de GitHub. Reiniciando...`));
            setTimeout(() => { process.exit(0); }, 1500);
            return;
        } catch (error) {
            console.error(error);
            return await m.reply('❌ *Error en el formateo forzado:* ' + error.message);
        }
    }

    // --- MODO NORMAL (Si solo pones #update) ---
    await m.reply('🕒 *Conectando con el repositorio...*');

    try {
        const stdout = execSync(`git pull ${repoUrl}`);
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
            const status = execSync('git status --porcelain').toString();
            if (status.length > 0) {
                const conflictedFiles = status
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const filePath = line.slice(3).trim();
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
                    .filter(Boolean);

                if (conflictedFiles.length > 0) {
                    return await m.reply(`❌ *Conflictos de código detectados:*\n\nModificaste archivos directamente en el panel que chocan con GitHub:\n\n${conflictedFiles.join('\n')}\n\n*💡 Solución:* Si querés borrar tus cambios del panel y traer lo de GitHub, usa:\n> *#update force*`);
                }
            }
            
            await m.reply('❌ *Error al intentar actualizar:* ' + error.message);
            
        } catch (err) {
            await m.reply('❌ *Ocurrió un error inesperado en el protocolo.*');
        }
    }
};

handler.command = ['update', 'actualizar', 'fix'];
export default handler;
