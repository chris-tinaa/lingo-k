const cron = require('node-cron');

const startCronJob = () => {
  cron.schedule('* * * * * *', () => {
    console.log('running a task every minute');
  });
}

module.exports = {
  startCronJob,
};