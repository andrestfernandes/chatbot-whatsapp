const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();
 
const userStates = new Map();
const delay = ms => new Promise(res => setTimeout(res, ms));
 
async function sendTypingAndMessage(chat, message, delayTime = 1500) {
    await delay(delayTime);
    await chat.sendStateTyping();
    await delay(delayTime);
    await chat.sendMessage(message);
}
 
async function enviarMenu(msg, nome = null) {
    const chat = await msg.getChat();
    const user = msg.from;
 
    userStates.set(user, {
        inMenu: true,
        awaitingFreeResponse: false
    });
 
    const saudacao = nome ? `Olá, ${nome.split(" ")[0]}! 👋` : 'Olá! 👋';
 
    await sendTypingAndMessage(chat, saudacao);
    await sendTypingAndMessage(chat, `Você está falando com o atendimento automático da equipe *Saúde dos Ativos*.`);
    await sendTypingAndMessage(chat, `Estamos aqui para te ajudar com suporte técnico, dúvidas e/ou atualizações nos servidores.`);
    await sendTypingAndMessage(chat,
        `Para começar, escolha uma das opções abaixo ou digite o número correspondente. 👇\n\n` +
        `*1* - 🛠️ Criação de equipamentos CAS\n` +
        `*2* - 🗑️ Exclusão de equipamentos CAS\n` +
        `*3* - 🤔 Dúvidas em manutenções CAS\n` +
        `*4* - 🖥️ OPPro, SmartMine ou OAS\n` +
        `*5* - 📝 Outro`);
}
 
const respostasMenu = {
    '1': [
        'Vamos criar um novo equipamento CAS!',
        'Por favor, copie e preencha os dados abaixo e envie aqui no chat: 👇',
        '👷‍♂️ Nome técnico:\n🔖 TAG atual:\n🔖 TAG anterior:\n🚗 Placa:\n📦 Modelo:\n⚙️ CAS Legacy ou CAS10:\n🔁 Ponto de ré:\n📍 Servidor:',
        'Se deseja voltar ao menu principal, responda com "menu".'
    ],
    '2': [
        'Vamos seguir com a exclusão de um equipamento.',
        'Copie e preencha os dados abaixo para continuarmos: 👇',
        '👷‍♂️ Nome técnico:\n🔖 TAG:\n📦 Modelo:\n⚙️ CAS Legacy ou CAS10:\n📍 Servidor:\n🔄 Será transferido?',
        'Se deseja voltar ao menu principal, responda com "menu".'
    ],
    '3': [
        'Vamos entender sua dúvida sobre manutenções CAS.',
        'Preencha as informações abaixo: 👇',
        '📍 Servidor:\n🧠 Sistema usado:\n❓ Descreva sua dúvida ou problema:',
        'Se deseja voltar ao menu principal, responda com "menu".'
    ],
    '4': [
        'Suporte para OPPro, SmartMine ou OAS.',
        'Por favor, preencha as informações: 👇',
        '⚙️ Sistema (OPPro / SmartMine / OAS):\n❗ Descreva o problema:\n📍 Local:',
        'Se deseja voltar ao menu principal, responda com "menu".'
    ],
    '5': [
        '👌 Tranquilo! Me diga brevemente do que você precisa.',
        'Se deseja voltar ao menu principal, responda com "menu".'
    ]
};
 
client.on('qr', qr => qrcode.generate(qr, { small: true }));
 
client.on('ready', () => {
    console.log('Tu é bão! Bot iniciado.');
});
 
client.on('message', async msg => {
    if (!msg.from.endsWith('@c.us')) return;
 
    try {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const user = msg.from;
        const content = (msg.body || '').toLowerCase().trim();
        const now = Date.now();
 
        // alteração feita 28/04    
        
        if (msg.type !== 'chat' || msg.body || content.includes('e2e_notification') || content.includes('notification_template')) 
            {
            if (msg.type !== 'chat') 
            {
                return;
            } 
            console.log();
        }

        let userState = userStates.get(user);
        if (!userState) {
            userState = { inMenu: false, awaitingFreeResponse: false, muteUntil: 0 };
            userStates.set(user, userState);
        }
 
        if (userState.muteUntil && now < userState.muteUntil) {
            return;
        }
 
        if (msg.type !== 'chat') {
            await sendTypingAndMessage(chat, `❗ *Atenção:*\n\nRecebemos sua mídia, mas nosso atendimento funciona apenas por mensagens de texto.`);
            await enviarMenu(msg, contact.pushname);
            return;
        }
 
        if (content === 'menu') {
            await enviarMenu(msg, contact.pushname);
            return;
        }
 
        if (userState.inMenu) {
            if (respostasMenu[content]) {
                userState.inMenu = false;
                userState.awaitingFreeResponse = true;
                userStates.set(user, userState);
 
                for (const msgPart of respostasMenu[content]) {
                    await sendTypingAndMessage(chat, msgPart);
                }
            } else {
                await sendTypingAndMessage(chat, `❌ *Opção inválida.*\n\nEscolha uma das opções válidas.`);
                await enviarMenu(msg, contact.pushname);
            }
            return;
        }
 
        if (userState.awaitingFreeResponse) {
            userState.awaitingFreeResponse = false;
            userState.muteUntil = now + 15 * 60 * 1000; // Mute por 15 minutos
            userStates.set(user, userState);
 
            await sendTypingAndMessage(chat, '✅ Mensagem recebida! Nossa equipe entrará em contato em breve.');
            return;
        }
 
        await enviarMenu(msg, contact.pushname);
    } catch (error) {
        console.error('Erro:', error);
    }
});
 
client.initialize();
