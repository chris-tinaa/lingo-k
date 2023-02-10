const { default: axios } = require('axios');

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
async function mainMenu(sock, msg) {

    return axios.get(`${BASE_URL}action=get-user-detail&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
        then(async (response) => {
            console.log("Progress resp: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;
            if (success) {

                sock.sendMessage(msg.key.remoteJid, { text: 'Try */menu* to see available commands, or maybe */progress* to check your progress.' });

            } else {

                await sock.sendMessage(msg.key.remoteJid, { text: `안녕하세요!\n\n Hola, nice to meet you.\n\n_Just answer */start* if you want to use me! Or */info* for further detail_` });

                const templateButtons = [
                    { index: 1, quickReplyButton: { displayText: 'Start!😆', id: "start-subscription" } },
                    { index: 2, quickReplyButton: { displayText: 'Info💬', id: "info" } },
                ]

                const templateMessage = {
                    text: `I help people to learn Korean. I can send vocabs and grammar every several hours, everyday.`,
                    footer: 'Lingo K',
                    templateButtons: templateButtons
                }

                await sock.sendMessage(msg.key.remoteJid, templateMessage);

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
    return axios.get(`${BASE_URL}action=get-vocab&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
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
    return axios.get(`${BASE_URL}action=get-vocab-review&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
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
    return axios.get(`${BASE_URL}action=get-grammar&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
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
    return axios.get(`${BASE_URL}action=get-grammar-review&whatsapp=${msg.key.remoteJid.replace("@s.whatsapp.net", "")}`).
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

function getAllUser() {
    return axios.get(`${BASE_URL}action=get-all-user`).
        then((response) => {
            console.log("All User Data: " + JSON.stringify(response.data));
            let { success, data, message } = response.data;

            if (success) {
                return data;
            } else {
                return message;
            }
        }).catch(function (error) {
            console.error(error);
        });
}

module.exports = {
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
};