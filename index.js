const {DisconnectReason, useMultiFileAuthState} = require('@adiwajshing/baileys');
const makeWASocket = require('@adiwajshing/baileys').default;

const startSock = async() => {

    try {
        // file for whatsapp auth when scanning
        const {state, saveState} = await useMultiFileAuthState('auth.json');
        
        const sock = makeWASocket({
            printQRInTerminal: true,
            auth: state
        });

        // error di sini
        sock.ev.on('creds.update', saveState);

        console.log("ngetest: state ", state);
        console.log("ngetest: savestate ", saveState);
        
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
                if(shouldReconnect) {
                    console.log("ngetest: reconnect");

                    startSock();
                }
            } else if(connection === 'open') {
                console.log("ngetest: open");

                console.log('connection : ' + JSON.stringify(connection));
            }
        });

        sock.ev.on('messages.upsert', async m => {
            // console.log(JSON.stringify(m, undefined, 2))

            // console.log('replying to', m.messages[0].key.remoteJid)
            // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
        });
    } catch (error) {
        console.log("ngetest: eror nih");

        console.error("Error message: ", error);
    }
}

startSock();