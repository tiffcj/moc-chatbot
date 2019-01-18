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

const executeQuery = (query) => {
    // con.connect(function(err) {
    //     if (err) throw err;
    //     console.log("Connected!");
    //     con.query(query, function (err, result) {
    //         if (err) throw err;
    //         console.log("Result: " + result);
    //         // con.end();
    //     });
    // });

    if (!con) {
        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
        });
    } else {
        con.query(query, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result.toString());
        });
    }
};

module.exports.addReminder = (userId, action, datetime) => {
    const query = util.format("INSERT INTO reminders (userId, action, datetime, snoozedCount) " +
        "VALUES (%s, '%s', '%s', %d);", userId, action, (new Date(datetime)).toISOString(), 0);
    console.log(query);
    executeQuery(query);
};

module.exports.deleteReminder = (userId, action, datetime) => {
    const query = util.format("DELETE FROM reminders WHERE userId=%s AND (action='%s' OR datetime='%s'",
        userId, action, (new Date(datetime)).toISOString());
    console.log(query);
    executeQuery(query);
};
