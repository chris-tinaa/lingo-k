// const cron = require('node-cron');
// const {
//   mainMenu,
//   getCommands,
//   getVocab,
//   getVocabReview,
//   getGrammar,
//   getGrammarReview,
//   getProgress,
//   stopSubscription,
//   translate,
//   addNewUser,
//   getAllUser
// } = require('./api');


// const startSock = async () => {

//   // file for whatsapp auth when scanning
//   const { state, saveCreds } = await useMultiFileAuthState('auth.json');

//   const sock = makeWASocket({
//     printQRInTerminal: true,
//     auth: state
//   });

//   const startCronJob = () => {
//     cron.schedule('* * * * * *', () => {
//       console.log('I need sock here');
//     });
//   }

// }

//   module.exports = {
//     startCronJob
//   };