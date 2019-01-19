const fetch = require('node-fetch');

const projectId = 'reminders-chatbot';
const sessionId = '123456';
const languageCode = 'en-US';

const dialogflow = require('dialogflow');

const service = require('./reminders-service');

const config = {
    credentials: {
        private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
    }
};

const sessionClient = new dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const { FACEBOOK_ACCESS_TOKEN } = process.env;

const sendTextMessage = (userId, action) => {
    console.log(action);
    return fetch(
        `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                messaging_type: 'RESPONSE',
                recipient: {
                    id: userId
                },
                message: {
                    action
                },
            }),
        }
    );
};

const sendRemindersAlert = (userId, text) => {
    console.log(text);
    return fetch(
        `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                messaging_type: 'RESPONSE',
                recipient: {
                    id: userId
                },
                message: {
                    text
                },
            }),
        }
    );
};

const processIntent = (name, userId, parameters) => {
    console.log(parameters);
    const action = parameters.fields.action.stringValue;

    // let datetime = parameters.fields.datetime.stringValue;
    // if (datetime !== '') {
    //     datetime = parameters.fields.datetime.structValue.fields.date_time.stringValue;
    // }

    if (name === 'add-reminder') {
        return service.addReminder(userId, action, parameters.fields.datetime.stringValue || parameters.fields.datetime.structValue.fields.date_time.stringValue);
    } else if (name === 'delete-reminder') {
        return service.deleteReminder(userId, action, parameters.fields.datetime.stringValue);
    } else if (name === 'get-reminder') {
        return service.getAllReminders(userId);
    }
};

module.exports.sendMsg = (userId, msg) => {
    sendTextMessage(userId, msg);
};

module.exports.sendAlert = (userId, msg) => {
    sendRemindersAlert(userId, msg);
};

module.exports.process = (event) => {
    const userId = event.sender.id;
    const message = event.message.text;

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: languageCode,
            }
        }
    };

    sessionClient
        .detectIntent(request)
        .then(responses => {
            // console.log(responses);
            // console.log("-----");
            const result = responses[0].queryResult;
            // console.log(result);

            if (result.allRequiredParamsPresent && result.intent.displayName !== 'about-reminders') {
                const res = processIntent(result.intent.displayName, userId, result.parameters);
                // console.log(res);
            }

            return sendTextMessage(userId, result.fulfillmentText);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
};