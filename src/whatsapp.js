const { DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const makeWASocket = require('@adiwajshing/baileys').default;
const cron = require('node-cron');

const {
    mainMenu,
    getCommands,
    getVocab,
    getVocabReview,
    getGrammar,
    getGrammarReview,
    getProgress,
    stopSubscription,
    translate,
    addNewUser,
    getAllUser
} = require('./api');



const startSock = async () => {

    // file for whatsapp auth when scanning
    const { state, saveCreds } = await useMultiFileAuthState('auth.json');

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update, connection2) => {
        let _a, _b;
        let connection = update.connection, lastDisconnect = update.lastDisconnect;

        if (connection === 'close') {
            console.log("ngetest: connection close");

            const shouldReconnect = ((_b = (_a = lastDisconnect.error) === null
                || _a === void 0 ? void 0 : _a.output) === null
                || _b === void 0 ? void 0 : _b.statusCode) !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if (shouldReconnect) {
                console.log("ngetest: reconnect");

                startSock();
            }
        } else if (connection === 'open') {
            console.log("ngetest: open");

            console.log('connection : ' + JSON.stringify(connection));
        }
    });

    sock.ev.on('messages.upsert', async m => {
        // LOGIC untuk BOT WhatsApp
        const msg = m.messages[0];
        console.log("There's a message: " + JSON.stringify(msg));

        if (!msg.key.fromMe && m.type === 'notify') {
            if (msg.key.remoteJid.includes('@s.whatsapp.net')) {

                if (msg.message.templateButtonReplyMessage?.selectedId == 'start-subscription' || msg.message.conversation.toLowerCase().includes('/start')) {

                    const sentMsg = await sock.sendMessage(msg.key.remoteJid, { text: 'Great! What\'s your name?\n\n*Write your answer in this format:*\nMy name is _your-name-here_' }, { quoted: msg });

                } else if (msg.message.templateButtonReplyMessage?.selectedId == 'info' || msg.message.conversation.toLowerCase().includes('/info')) {

                    const sentMsg = await sock.sendMessage(msg.key.remoteJid, { text: `Subscription is *_free_*!\n\nHere are what I can do for you:\n\n🍦 *VOCABULARY*\n[1] 1671 words, level TOPIK I\n[2] 2662 words, level TOPIK II\n[3] 5667 common vocabs\n\nI send 5 vocabs at 9 AM, 11 AM, 1 PM, 3 PM, and 5 PM everyday.\n\nAt 6 PM and 7 PM, I send 10 random vocabs you've already learned to review.\n\n\n🍦 *GRAMMAR*\n[1] 849 grammars\n[2] Examples for each grammar\n\nI send 2 grammars and example for each everyday at 8 PM and 9 PM. \n\n\n🍦 *TRANSLATOR*\nUse these format to translate:\n[1] Eng to Kor: _write-anything-here_\n[2] Kor to Eng: _write-anything-here_\n\nAnyway, you can use translation feature without subscription.\n\n-------\n\nJust answer */start* if you want to subscribe! :)` }, { quoted: msg });

                } else if (msg.message.conversation.toLowerCase() === '/menu') {
                    getCommands(sock, msg);
                } else if (msg.message.conversation.toLowerCase().includes('my name is')) {
                    addNewUser(sock, msg);
                    //getVocab(sock, msg);
                } else if (msg.message.conversation.toLowerCase() === '/stop') {
                    stopSubscription(sock, msg);
                } else if (msg.message.conversation.toLowerCase().includes('eng to kor')) {
                    translate(sock, msg, "en", "ko");
                } else if (msg.message.conversation.toLowerCase().includes('kor to eng')) {
                    translate(sock, msg, "ko", "en");
                } else if (msg.message.conversation.toLowerCase() === '/vocab') {
                    getVocab(sock, msg);
                } else if (msg.message.conversation.toLowerCase() === '/vocab-review') {
                    getVocabReview(sock, msg);
                } else if (msg.message.conversation.toLowerCase() === '/grammar') {
                    getGrammar(sock, msg);
                } else if (msg.message.conversation.toLowerCase() === '/grammar-review') {
                    getGrammarReview(sock, msg);
                } else if (msg.message.conversation.toLowerCase() === '/progress') {
                    getProgress(sock, msg);
                } else {
                    mainMenu(sock, msg);
                }

            }
        }
    });


    // get vocab 0 9,11,13,15,17 * * *
    cron.schedule('0 9,11,13,15,17 * * *', async () => {

        let all_user_data = await getAllUser();
        let msg = {
            key: {
                remoteJid: ""
            }
        };
        for (let i = 0; i <= all_user_data.length; i++) {
            msg.key.remoteJid = String(all_user_data[i].number).concat("@s.whatsapp.net");
            await getVocab(sock, msg);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });

    // get vocab-review 0 18,19 * * *
    cron.schedule('0 18,19 * * *', async () => {

        let all_user_data = await getAllUser();
        let msg = {
            key: {
                remoteJid: ""
            }
        };
        for (let i = 0; i <= all_user_data.length; i++) {
            msg.key.remoteJid = String(all_user_data[i].number).concat("@s.whatsapp.net");
            await getVocabReview(sock, msg);
        }

    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });

    // get grammar 0 20,21 * * *
    cron.schedule('0 20,21 * * *', async () => {

        let all_user_data = await getAllUser();
        let msg = {
            key: {
                remoteJid: ""
            }
        };
        for (let i = 0; i <= all_user_data.length; i++) {
            msg.key.remoteJid = String(all_user_data[i].number).concat("@s.whatsapp.net");
            await getGrammar(sock, msg);
        }

    }), {
        scheduled: true,
        timezone: "Asia/Jakarta"
    };
}

module.exports = { startSock };