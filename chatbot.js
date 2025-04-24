const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

const userStates = new Map();

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('Tu é bão! Bot iniciado.'));
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

const sendTypingAndMessage = async (chat, message, delayTime = 1500) => {
    await delay(delayTime);
    await chat.sendStateTyping();
    await delay(delayTime);
    await client.sendMessage(chat.id._serialized, message);
};

const enviarMenu = async (msg, name = null) => {
    const chat = await msg.getChat();
    const user = msg.from;
    
    const currentState = userStates.get(user) || {};
    userStates.set(user, {
        ...currentState,
        inMenu: true,
        awaitingFreeResponse: false,

    }); 

    const saudacao = name ? `Olá, ${name.split(" ")[0]}! 👋` : 'Olá! 👋';

    await sendTypingAndMessage(chat, saudacao);
    
    await sendTypingAndMessage (chat, `Você está falando com o atendimento automático da equipe *Saúde dos Ativos*.`);
    await sendTypingAndMessage (chat, `Estamos aqui para te ajudar com suporte técnico, dúvidas e/ou atualizações nos servidores.`);
    await sendTypingAndMessage(chat, 
            `Para começar, escolha uma das opções abaixo ou digite o número correspondente. 👇\n\n` +
            `*1* - 🛠️ Criação de equipamentos CAS\n` +
            `*2* - 🗑️ Exclusão de equipamentos CAS\n` +
            `*3* - 🤔 Dúvidas em manutenções CAS\n` +
            `*4* - 🖥️ OPPro, SmartMine ou OAS\n` +
            `*5* - 📝 Outro`);
};

const respostasMenu = {
    '1': [
        'Vamos criar um novo equipamento CAS!',
        'Por favor, copie e preencha os dados abaixo e envie aqui no chat: 👇',
        '👷‍♂️ Nome técnico:\n🔖 TAG:\n🚗 Placa:\n📦 Modelo:\n⚙️ CAS Legacy ou CAS10:\n🔁 Ponto de ré:\n📍 Servidor:',
        'Se deseja voltar ao menu principal, responda com "menu". '
    ],
    '2': [
        'Vamos seguir com a exclusão de um equipamento.',
        'Copie e preencha os dados abaixo para continuarmos com a exclusão: 👇',
        '👷‍♂️ Nome técnico:\n🔖 TAG:\n📦 Modelo:\n⚙️ CAS Legacy ou CAS10:\n📍 Servidor:\n🔄 Será transferido? ',
        'Se deseja voltar ao menu principal, responda com "menu". '
    ],
    '3': [
        'Vamos entender sua dúvida sobre manutenções CAS.',
        'Preencha as informações abaixo para que possamos te ajudar com mais agilidade: 👇',
        ' 📍 Servidor:\n🧠 Sistema usado:\n❓ Descreva sua dúvida ou problema:',
        'Se deseja voltar ao menu principal, responda com "menu". '
    ],
    '4': [
        'Suporte para OPPro, SmartMine ou OAS.',
        'Por favor, preencha as informações abaixo para podermos entender melhor sua solicitação: 👇',
        '⚙️ Sistema (OPPro / SmartMine / OAS):\n❗ Descreva o problema:\n📍 Local:',
        'Se deseja voltar ao menu principal, responda com "menu". '
    ],
    '5': [
        '👌 Tranquilo! Me diga brevemente do que você precisa e vamos te ajudar o mais rápido possível',
        'Deseja voltar ao menu principal? Responda com "menu" '
    ],
    'menu': ['Reenviando o menu principal...']
};

client.on('message', async msg => {
    if (!msg.from.endsWith('@c.us')) return;

    try {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const user = msg.from;
        const content = (msg.body || '').toLowerCase().trim();
        const now = Date.now();

        if (content.includes('e2e_notification') || content.includes('notification_template')) {
            return;
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
            const mediaTypes = {
                image: { artigo: 'sua', nome: 'foto' },
                video: { artigo: 'seu', nome: 'vídeo' },
                audio: { artigo: 'seu', nome: 'áudio' },
                sticker: { artigo: 'sua', nome: 'figurinha' },
                document: { artigo: 'seu', nome: 'documento' },
                voice: { artigo: 'sua', nome: 'mensagem de voz' },
                ptt: { artigo: 'sua', nome: 'mensagem de voz' }
            };
        
            const tipo = mediaTypes[msg.type] || { artigo: 'seu', nome: msg.type };
        
            await sendTypingAndMessage(
                chat,
                `❗ *Atenção:*\n\nRecebemos ${tipo.artigo} ${tipo.nome}, mas nosso atendimento funciona apenas por mensagens de texto.`
            );
            await enviarMenu(msg, contact.pushname);
            return;
        }

        if (!userState.inMenu && !userState.awaitingFreeResponse) {
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
                await sendTypingAndMessage(chat,
                    `❌ *Opção inválida.*\n\n` +
                    `Por favor, escolha uma das opções válidas do menu inicial, digitando apenas o número correspondente.\n` +
                    `👉 Ex: *1* para criação de equipamentos CAS`);
                await enviarMenu(msg, contact.pushname);
            }
            return;
        }

        if (userState.awaitingFreeResponse) {
            userState.awaitingFreeResponse = false;
            userState.muteUntil = now + 10 * 60 * 1000;
            userStates.set(user, userState);

            await sendTypingAndMessage(chat, '✅ Mensagem recebida! Nossa equipe entrará em contato em breve.');
            return;
        }

        await enviarMenu(msg, contact.pushname);
    } catch (error) {
        console.error('Erro:', error);
    }
});
