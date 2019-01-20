require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const bodyParser = require('body-parser');
const verifyWebhook = require('./client/verify-webhook');
const messageWebhook = require('./client/message-webhook');
const alertScript = require('./alert-script');
const messengerSetup = require('./client/messenger-setup');

// Setting up webhook
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Express server is listening on port ' + port));

app.get('/', verifyWebhook);

app.post('/', messageWebhook);

// Setting up messenger get started button and menu
messengerSetup();

// Setting up alert reminders script
const MINUTES = 1;
setInterval(function() {
    alertScript();
}, MINUTES * 60 * 1000);