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
            console.log(startTime);
            start = moment(startTime).local().startOf('day').format();
            end = moment(startTime).local().endOf('day').format();
            console.log(start);
            console.log(end);
        }
        db.getAllRemindersByTimeRange(userId, start, end, callback);
    }
};
//2019-01-19T12:00:00-06:00