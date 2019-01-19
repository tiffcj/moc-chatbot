require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const bodyParser = require('body-parser');
const verifyWebhook = require('./verify-webhook');
const messageWebhook = require('./message-webhook');
const alertReminders = require('./alert-reminders');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(5000, () => console.log('Express server is listening on port 5000'));

app.get('/', verifyWebhook);

app.post('/', messageWebhook);

const minutes = 1;
setInterval(function() {
    // console.log("I Iam doing my 1 minute check");
    alertReminders();
    // processMessage.sendMsg(1561640790605157, "HELLO!");
}, 10 * 1000);