const mysql = require('mysql');
const util = require('util');

const con = mysql.createConnection({
    host: "moc-chatbot.cqhgzhav2kxu.us-west-2.rds.amazonaws.com",
    user: "tiffcj",
    password: "moc-chatbot123!",
    database: "default",
    dateStrings : true
});

const executeQuery = (query, callback) => {
    con.query(query, function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Query result: " + JSON.stringify(result));
        if (callback) {
            callback(result);
        }
    });
};

module.exports.addReminder = (userId, action, datetime, callback) => {
    // console.log("in database: " + toUTCDate(datetime));

    const query = util.format("INSERT INTO reminders (userId, action, datetime, snoozedCount, deleted) " +
        "VALUES ('%s', '%s', '%s', 0, FALSE);", userId, action, toUTCDate(datetime));
    console.log("QUERY: " + query);
    executeQuery(query, callback);
};

module.exports.deleteReminder = (userId, action, datetime, callback) => {
    let date = datetime;
    if (date !== '') {
        date = toUTCDate(datetime);
    }

    const query = util.format("UPDATE reminders SET deleted=TRUE WHERE userId='%s' AND (LOWER(action)=LOWER('%s') OR datetime='%s');",
        userId, action, date);
    executeQuery(query, callback);
};

module.exports.snoozeReminder = (userId, action, callback) => {
    const query = util.format("UPDATE reminders SET datetime=DATE_ADD(datetime, INTERVAL 5 MINUTE) WHERE userId='%s' AND LOWER(action)=LOWER('%s') AND deleted=FALSE;",
        userId, action);
    executeQuery(query, callback);
};

module.exports.getAllRemindersByTimeRange = (userId, startTime, endTime, callback) => {
    const query = util.format("SELECT action, datetime FROM reminders WHERE userId='%s' AND deleted=FALSE " +
        "AND datetime BETWEEN '%s' AND '%s';", userId, toUTCDate(startTime), toUTCDate(endTime));
    console.log("QUERY: " + query);
    return executeQuery(query, callback);
};

module.exports.getAllReminders = (userId, callback) => {
    const query = util.format("SELECT action, datetime FROM reminders WHERE userId='%s' AND deleted=FALSE;", userId);
    console.log("QUERY2: " + query);
    return executeQuery(query, callback);
};

module.exports.getAllUpcomingReminders = (callback) => {
    executeQuery("SELECT * FROM reminders WHERE deleted=FALSE AND datetime BETWEEN " +
        "NOW() AND DATE_ADD(NOW(), INTERVAL 1 MINUTE);", callback);
};

const toUTCDate = (date) => {
    return (new Date(date)).toISOString();
};