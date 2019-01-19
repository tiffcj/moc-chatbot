const service = require('./reminders-service');
const processMessage = require('./process-message');

const sendAlerts = (reminders) => {
    if (reminders) {
        reminders.forEach(function (reminder) {
            processMessage.sendAlert(reminder.userId, reminder.action);
        });
    }
};

module.exports = () => {
    // const reminders = service.getAllUpcomingReminders();
    // console.log(JSON.stringify(reminders));

    service.getAllUpcomingReminders(sendAlerts);
};