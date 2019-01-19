const db = require('../db/reminders-db.js');

module.exports.addReminder = (userId, action, datetime, callback) => {
    db.addReminder(userId, action, datetime, callback);
};

module.exports.deleteReminder = (userId, action, datetime, callback) => {
    db.deleteReminder(userId, action, datetime, callback);
};

module.exports.getAllUpcomingReminders = (callback) => {
    db.getAllUpcomingReminders(callback);
};

module.exports.snoozeReminder = (userId, action, callback) => {
    db.snoozeReminder(userId, action, callback);
};