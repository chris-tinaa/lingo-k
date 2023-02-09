const cron = require('node-cron');

const cronJob = () => {
  cron.schedule('* * * * * *', () => {
    console.log('running a task every minute');
  });
}

module.exports = {
  cronJob,
};