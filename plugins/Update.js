import { execSync } from 'child_process';
import chalk from 'chalk';

const handler = async (m, { conn }) => {
    const repoUrl = 'https://github.com/CrizZapp/Osaragi-WA-Bot.git';
    
    await m.reply('> ⏰️ Actualizando bot');

    try {
        // Hacemos el force directamente por defecto
        execSync(`git fetch ${repoUrl}`);
        const stdout = execSync('git reset --hard FETCH_HEAD');
        let output = stdout.toString().trim();

        await m.reply(`> *Already to update.*\n\nVersion: ${output}\n\n♻️ *Reiniciando..*`);
        
        console.log(chalk.hex("#00FF7F")(`\n[UPDATE] Código actualizado desde GitHub. Reiniciando...`));
        
        // Apaga el bot y el panel lo vuelve a prender
        setTimeout(() => { process.exit(0); }, 1500);

    } catch (error) {
        console.error(chalk.hex("#FF4500")(`[UPDATE ERROR]`), error);
        await m.reply('❌ *Ocurrió un error fatal al intentar sincronizar:* ' + error.message);
    }
};

handler.command = ['update', 'actualizar', 'fix'];
export default handler;
