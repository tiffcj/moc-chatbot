const service = require('./service/reminders');
const messenger = require('./client/messenger-interface');

const sendAlerts = (reminders) => {
    if (reminders) {
        reminders.forEach(function (reminder) {
            messenger.sendMsg(reminder.userId, reminder.action);
        });
    }
};

module.exports = () => {
    service.getAllUpcomingReminders(sendAlerts);
};