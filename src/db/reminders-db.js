const mysql = require('mysql');
const util = require('util');

const con = mysql.createConnection({
    host: "moc-chatbot.cqhgzhav2kxu.us-west-2.rds.amazonaws.com",
    user: "tiffcj",
    password: "moc-chatbot123!",
    database: "default"
});

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     sql="";
//     con.query(sql, function (err, result) {
//         if (err) throw err;
//         console.log("Result: " + result);
//     });
// });

const executeQuery = (query, callback) => {
    // con.connect(function(err) {
    //     if (err) throw err;
    //     console.log("Connected!");
    //     con.query(query, function (err, result) {
    //         if (err) throw err;
    //         console.log("Result: " + result);
    //         // con.end();
    //     });
    // });

    // if (!con) {
    //     con.connect(function(err) {
    //         if (err) throw err;
    //         console.log("Connected!");
    //     });
    // } else {
        con.query(query, function (err, result) {
            if (err) throw err;
            console.log("Result: " + JSON.stringify(result));
            if (callback) {
                callback(result);
            }
        });
    // }
};

module.exports.addReminder = (userId, action, datetime) => {
    const query = util.format("INSERT INTO reminders (userId, action, datetime, snoozedCount, deleted) " +
        "VALUES ('%s', '%s', '%s', 0, FALSE);", userId, action, (new Date(datetime)).toISOString());
    return executeQuery(query);
};

module.exports.deleteReminder = (userId, action, datetime) => {
    let date = datetime;
    if (datetime !== '') {
        date = new Date(datetime).toISOString();
    }

    const query = util.format("UPDATE reminders SET deleted=TRUE WHERE userId='%s' AND (action='%s' OR datetime='%s');",
        userId, action, date);
    return executeQuery(query);
};

module.exports.snoozeReminder = (userId, action) => {
    const query = util.format("UPDATE reminders SET datetime=DATE_ADD(datetime, INTERVAL 5 MINUTE) WHERE userId='%s' AND action='%s';",
        userId, action);
    console.log(query);
    return executeQuery(query);
};

// module.exports.getAllReminders = (userId) => {
//     const query = util.format("SELECT action, datetime FROM reminders WHERE userId='%s' AND deleted=FALSE;", userId);
//     console.log(query);
//     return executeQuery(query);
// };

module.exports.getAllUpcomingReminders = (callback) => {
    executeQuery("SELECT * FROM reminders WHERE deleted=FALSE AND datetime BETWEEN " +
        "NOW() AND DATE_ADD(NOW(), INTERVAL 10 MINUTE);", callback);
};
