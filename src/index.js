const { DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const { default: axios } = require('axios');
const { text } = require('body-parser');
const makeWASocket = require('@adiwajshing/baileys').default;

const {cronJob} = require('./cron.js');

const BASE_URL = "https://script.google.com/macros/s/AKfycbwl-xKtkanJDeX-vJbPdMrq1IllvMnz-3u8V2utNd5jCqD3fxP1oVz5IqNiBJCaJgpNlQ/exec?";
const TRANSLATOR_URL = "https://text-translator2.p.rapidapi.com/translate";

const COMMANDS = [
    "/start",
    "/stop",
    "/info",
    "/progress",
    "/vocab",
    "/vocab-review",
    "/grammar",
    "/grammar-review",
    "eng to kor: _translate-anything_",
    "kor to eng: _translate-anything_"
];


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
                    mainMenu(sock, msg)
                }

            }
        }
    });

    // cron.schedule('* * * * *', () => {
    //     console.log('Cron job jalan');
    //     // code to send message to user

    // });

}

async function mainMenu(sock, msg) {

    axios.get(`${BASE_URL}action=get-user-detail&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
        then((response) => {
            console.log("Progress resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;
            if (success) {

                sock.sendMessage(msg.key.remoteJid, { text: 'Try */menu* to see available commands, or maybe */progress* to check your progress.' });

            } else {

                sock.sendMessage(msg.key.remoteJid, { text: `안녕하세요!\n\n Hola, nice to meet you.\n\n_Just answer */start* if you want to use me! Or */info* for further detail_` });

                const templateButtons = [
                    { index: 1, quickReplyButton: { displayText: 'Start!😆', id: "start-subscription" } },
                    { index: 2, quickReplyButton: { displayText: 'Info💬', id: "info" } },
                ]

                const templateMessage = {
                    text: `I help people to learn Korean. I can send vocabs and grammar every several hours, everyday.`,
                    footer: 'Lingo K',
                    templateButtons: templateButtons
                }

                sock.sendMessage(msg.key.remoteJid, templateMessage)

            }
        }).catch(function (error) {
            console.error(error);
        });
}

async function getCommands(sock, msg) {
    let text = `Sure, here are the command list.\n\n`;

    for (let i = 0; i < COMMANDS.length; i++) {
        text = text.concat(`[${i + 1}] ${COMMANDS[i]}\n`);
    }

    const sentMsg = await sock.sendMessage(msg.key.remoteJid, { text: text });
}

async function getVocab(sock, msg) {
    axios.get(`${BASE_URL}action=get-vocab&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
        then((response) => {
            console.log("Get vocab resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;

            if (success) {
                let text = `🍦 *VOCABULARIES*\n\n`;

                for (let i = 0; i < data.length; i++) {
                    text = text.concat(`[${data[i].id}]\n${data[i].korean}: ${data[i].english}\n\n`);
                }

                sock.sendMessage(msg.key.remoteJid, { text: text });
            } else {
                sock.sendMessage(msg.key.remoteJid, { text: message });
            }
        }).catch(function (error) {
            console.error(error);
        });;
}

async function getVocabReview(sock, msg) {
    axios.get(`${BASE_URL}action=get-vocab-review&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
        then((response) => {
            console.log("Get vocab resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;

            if (success) {
                let text = `🍦 *IT'S TIME FOR REVIEW!*\n\nDo you remember these words?\n\n`;

                for (let i = 0; i < data.length; i++) {
                    text = text.concat(`[${i + 1}]\n${data[i].korean}\n\n`);
                }

                text = text.concat(`Scroll down to see the answer😆\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n`);

                for (let i = 0; i < data.length; i++) {
                    text = text.concat(`[${i + 1}]\n${data[i].korean}: ${data[i].english}\n\n`);
                }

                text = text.concat(`\nDid you get it right?😲 Keep learning!`);

                sock.sendMessage(msg.key.remoteJid, { text: text });
            } else {
                sock.sendMessage(msg.key.remoteJid, { text: message });
            }
        }).catch(function (error) {
            console.error(error);
        });;

}

async function getGrammar(sock, msg) {
    axios.get(`${BASE_URL}action=get-grammar&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
        then((response) => {
            console.log("Get grammar resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;

            if (success) {
                let text = `🍦 *GRAMMAR*\n\n`;

                text = text.concat(`*[${data.grammar.id}] ${data.grammar.kor_title}*\n${data.grammar.eng_title}\n\n*${data.grammar.grammar}*\n${data.grammar.grammar_desc}\n\n\n🔎 *Example*\n\n`);

                for (let i = 0; i < data.example.length; i++) {
                    if (i % 2 != 0) {
                        text = text.concat(`*B:* `);
                    } else {
                        text = text.concat(`*A:* `);
                    }
                    text = text.concat(`${data.example[i].kor_sent}\n`);

                    if (i % 2 != 0) {
                        text = text.concat(`*B:* `);
                    } else {
                        text = text.concat(`*A:* `);
                    }
                    text = text.concat(`${data.example[i].eng_sent}\n\n`);
                }

                sock.sendMessage(msg.key.remoteJid, { text: text });
            } else {
                sock.sendMessage(msg.key.remoteJid, { text: message });
            }
        }).catch(function (error) {
            console.error(error);
        });;
}

async function getGrammarReview(sock, msg) {
    axios.get(`${BASE_URL}action=get-grammar-review&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
        then((response) => {
            console.log("Get vocab resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;

            if (success) {
                let text = `🍦 *GRAMMAR REVIEW!*\n\nDo you still remember this one?\n\n`;

                text = text.concat(`*[${data.grammar.id}] ${data.grammar.kor_title}*\n${data.grammar.eng_title}\n\n*${data.grammar.grammar}*\n${data.grammar.grammar_desc}\n\n\n🔎 *Example*\n\n`);

                for (let i = 0; i < data.example.length; i++) {
                    if (i % 2 != 0) {
                        text = text.concat(`*B:* `);
                    } else {
                        text = text.concat(`*A:* `);
                    }
                    text = text.concat(`${data.example[i].kor_sent}\n`);

                    if (i % 2 != 0) {
                        text = text.concat(`*B:* `);
                    } else {
                        text = text.concat(`*A:* `);
                    }
                    text = text.concat(`${data.example[i].eng_sent}\n\n`);
                }

                sock.sendMessage(msg.key.remoteJid, { text: text });
            } else {
                sock.sendMessage(msg.key.remoteJid, { text: message });
            }
        }).catch(function (error) {
            console.error(error);
        });;
}

async function getProgress(sock, msg) {
    axios.get(`${BASE_URL}action=get-user-detail&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
        then((response) => {
            console.log("Progress resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;

            if (success) {

                let text = `You're doing great job. Keep going!💖\n\n`;

                text = text.concat(`[📌] TOPIK I vocabs: ${data.topik_i_vocab_count}/1671\n\n`);
                text = text.concat(`[📌] TOPIK II vocabs: ${data.topik_ii_vocab_count}/2662\n\n`);
                text = text.concat(`[📌] Common vocabs: ${data.common_vocab_count}/5667\n\n`);
                text = text.concat(`[📌] Grammars: ${data.conv_title_count}/849\n\n`);

                sock.sendMessage(msg.key.remoteJid, { text: text });

            } else {
                sock.sendMessage(msg.key.remoteJid, { text: 'You haven\'t signed up yet☹' });
            }
        }).catch(function (error) {
            console.error(error);
        });
}

function stopSubscription(sock, msg) {
    axios.get(`${BASE_URL}action=stop-subscription&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
        then((response) => {
            console.log("Start resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;

            if (success) {
                sock.sendMessage(msg.key.remoteJid, { text: 'Goodbye, it was fun with you!' }, { quoted: msg });
            } else {
                sock.sendMessage(msg.key.remoteJid, { text: 'You\'re not signed up yet.' }, { quoted: msg });
            }
        }).catch(function (error) {
            console.error(error);
        });
}

function translate(sock, msg, source_language, target_language) {

    const text = msg.message.conversation.toLowerCase()
        .replace("kor to eng", "")
        .replace("eng to kor", "")
        .replace(":", "")
        .replace("=", "")
        .replace(/(?:\r\n|\r|\n)/g, "");

    const encodedParams = new URLSearchParams();
    encodedParams.append("source_language", source_language);
    encodedParams.append("target_language", target_language);
    encodedParams.append("text", text);

    axios.request({
        method: 'POST',
        url: TRANSLATOR_URL,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': 'd7233a1200msh876cb9bc7677956p100679jsndf50e3a59333',
            'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
        },
        data: encodedParams
    }).then(function (response) {
        console.log(response.data);
        sock.sendMessage(msg.key.remoteJid, { text: `${response.data.data.translatedText}` }, { quoted: msg });
    }).catch(function (error) {
        console.error(error);
    });
}

function addNewUser(sock, msg) {
    const name = msg.message.conversation.toLowerCase()
        .replace("my name is ", "")
        .replace(/(?:\r\n|\r|\n)/g, "")
        .replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());

    axios.get(`${BASE_URL}action=start-subscription&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}&name=${name}`).
        then((response) => {
            console.log("Start resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;

            if (success) {
                let str = `${message} Hi ${name}, let's get your first lesson with Lingo K😄\n\nUse */progress* to see your progress anytime! Check other features with */menu*`;
                sock.sendMessage(msg.key.remoteJid, {
                    text: str
                });

                getVocab(sock, msg);

            } else {
                sock.sendMessage(msg.key.remoteJid, {
                    text: `${message}☹`
                });
            }
        }).catch(function (error) {
            console.error(error);
        });;
}

startSock();
cronJob();