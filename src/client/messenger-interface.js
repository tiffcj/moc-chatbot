const fetch = require('node-fetch');
const dialogflow = require('dialogflow');
const service = require('../service/reminders');

const projectId = 'reminders-chatbot';
const sessionId = '123456';
const languageCode = 'en-US';

const config = {
    credentials: {
        private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
    }
};

const sessionClient = new dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const { FACEBOOK_ACCESS_TOKEN } = process.env;

const sendTextMessage = (userId, text) => {
    console.log(text);
    let body = {
        messaging_type: 'RESPONSE',
        recipient: {
            id: userId
        },
        message: {
            text
        },
    };
    return fetch(
        `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(body),
        }
    );
};

const sendReminderAlert = (userId, action) => {
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

// const sendReminderAlert = (userId, action) => {
//     console.log("here");
//     return fetch(
//         `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             method: 'POST',
//             body: JSON.stringify({
//                 messaging_type: 'RESPONSE',
//                 recipient: {
//                     id: userId
//                 },
//                 message: {
//                     "attachment":{
//                         "type": "template",
//                         "payload": {
//                             "template_type": "button",
//                             "text": "Reminder: " + action,
//                             "buttons":[
//                                 {
//                                     "type": "postback",
//                                     "payload": {
//                                         "text": "confirm",
//                                         "action": action
//                                     },
//                                     "title": "Confirm"
//                                 },
//                                 {
//                                     "type": "postback",
//                                     "payload": {
//                                         "text": "snooze",
//                                         "action": action
//                                     },
//                                     "title": "Snooze"
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             })
//         }
//     );
// };

const processIntent = (name, userId, parameters) => {
    // console.log(parameters);
    const action = parameters.fields.action.stringValue;

    // let datetime = parameters.fields.datetime.stringValue;
    // if (datetime !== '') {
    //     datetime = parameters.fields.datetime.structValue.fields.date_time.stringValue;
    // }

    if (name === 'add-reminder') {
        return service.addReminder(userId, action, parameters.fields.datetime.stringValue || parameters.fields.datetime.structValue.fields.date_time.stringValue);
    } else if (name === 'delete-reminder') {
        return service.deleteReminder(userId, action, parameters.fields.datetime.stringValue);
    }
};

module.exports.sendMsg = (userId, msg) => {
    sendTextMessage(userId, msg);
};

module.exports.sendAlert = (userId, msg) => {
    sendReminderAlert(userId, msg);
};

module.exports.processMessage = (event) => {
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
                processIntent(result.intent.displayName, userId, result.parameters);
            }

            return sendTextMessage(userId, result.fulfillmentText);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
};

module.exports.processPayload = (event) => {
    const userId = event.sender.id;
    const payload = event.postback.payload;

    if (payload.text === 'snooze' && payload.action) {
    }
};