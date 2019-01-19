const db = require('./../db/reminders-db.js');

module.exports.addReminder = (userId, action, datetime) => {
    db.addReminder(userId, action, datetime);
};

module.exports.deleteReminder = (userId, action, datetime) => {
    db.deleteReminder(userId, action, datetime);
};

module.exports.getAllUpcomingReminders = (callback) => {
    db.getAllUpcomingReminders(callback);
};