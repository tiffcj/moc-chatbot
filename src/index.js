require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const bodyParser = require('body-parser');
const verifyWebhook = require('./client/verify-webhook');
const messageWebhook = require('./client/message-webhook');
const alertScript = require('./alert-script');
const setUp = require('./client/messenger-setup');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(5000, () => console.log('Express server is listening on port 5000'));

app.get('/', verifyWebhook);

app.post('/', messageWebhook);

setUp();

//TODO: change
const MINUTES = 1;
setInterval(function() {
    alertScript();
    // messenger.sendMsg(1561640790605157, "HELLO!!!");
    // messenger.sendAlert(1561640790605157, "HELLO5!");
}, 20 * 1000);

//TODO: get started change
//TODO: fix intents