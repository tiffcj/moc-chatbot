const db = require('../db/reminders-db.js');
const moment = require('moment');

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

module.exports.getAllReminders = (userId, startTime, endTime, callback) => {
    let start = startTime, end = endTime;

    if (!start && !end) {
        db.getAllReminders(userId, callback);
    } else {
        if (!end) {
            start = moment(startTime).startOf('day');
            end = moment(startTime).endOf('day');
        }
        db.getAllRemindersByTimeRange(userId, start, end, callback);
    }
};
//2019-01-19T12:00:00-06:00