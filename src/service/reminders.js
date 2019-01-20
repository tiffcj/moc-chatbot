const db = require('../db/reminders-db.js');

module.exports.addReminder = (userId, action, datetime, callback) => {
    // console.log("In service: " + datetime);
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
            start = (new Date(startTime)).setHours(0, 0, 0, 0);
            end = (new Date(startTime)).setHours(23, 59, 59, 999);
        }
        console.log((new Date(start)).toISOString());
        console.log((new Date(end)).toISOString());

        db.getAllRemindersByTimeRange(userId, start, end, callback);
    }
};