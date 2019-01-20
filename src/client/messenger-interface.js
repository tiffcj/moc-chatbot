const fetch = require('node-fetch');
const dialogflow = require('dialogflow');
const service = require('../service/reminders');
const moment = require('moment');

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

module.exports.getStarted = () => {
    return fetch(`https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(
                {
                    get_started: {
                        payload: "get-started"
                    }
                }
            ),
        }
    );
};

module.exports.persistentMenu = () => {
    return fetch(`https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(
                {
                    "persistent_menu":[
                        {
                            "locale":"default",
                            "composer_input_disabled": false,
                            "call_to_actions":[
                                {
                                    "title":"Create reminder",
                                    "type": "postback",
                                    "payload": "add-reminder"
                                },
                                {
                                    "title": "Get all reminders for today",
                                    "type": "postback",
                                    "payload": "get-reminders"
                                }
                            ]
                        }
                    ]
                }
            ),
        }
    );
};

const sendTextMessage = (userId, text, isAlert) => {
    // console.log(text);
    // console.log(userId);
    // console.log(isAlert);
    let msg;
    if (isAlert) {
        msg = {"attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Reminder: " + text,
                    "buttons": [
                        {
                            "type": "postback",
                            "payload": "confirm_" + text,
                            "title": "Confirm"
                        },
                        {
                            "type": "postback",
                            "payload": "snooze_" + text,
                            "title": "Snooze"
                        }
                    ]
                }
            }
        };
    } else {
        msg = {"text": text};
    }

    return fetch(`https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
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
                message: msg,
            }),
        }
    ).then((response) => response.json())
        .then((data) => console.log('Fetch result: ', data))
        .catch((error) => console.log('Error: ', error));
};

const processIntent = (intent, userId) => {
    // console.log(parameters);
    // let datetime = parameters.fields.datetime.stringValue;
    // if (datetime !== '') {
    //     datetime = parameters.fields.datetime.structValue.fields.date_time.stringValue;
    // }
    const name = intent.intent.displayName;
    const parameters = intent.parameters;

    let callback = (reminders) => {
        sendTextMessage(userId, intent.fulfillmentText, false)
    };

    if (name === 'add-reminder') {
        service.addReminder(userId, parameters.fields.action.stringValue, parameters.fields.datetime.stringValue || parameters.fields.datetime.structValue.fields.date_time.stringValue, callback);
    } else if (name === 'delete-reminder') {
        service.deleteReminder(userId, parameters.fields.action.stringValue, parameters.fields.datetime.stringValue, callback);
    } else if (name === 'get-reminders') {
        // console.log("GET: " + JSON.stringify(parameters));
        let startTime, endTime;
        if (parameters.fields.date_period.kind === 'structValue') {
            startTime = parameters.fields.date_period.structValue.fields.startDate.stringValue;
            endTime = parameters.fields.date_period.structValue.fields.endDate.stringValue;
        } else if (parameters.fields.time_period.kind === 'structValue') {
            startTime = parameters.fields.time_period.structValue.fields.startTime.stringValue;
            endTime = parameters.fields.time_period.structValue.fields.endTime.stringValue;
        } else if (parameters.fields.datetime.stringValue) {
            startTime = parameters.fields.datetime.stringValue;
        }

        let callback = (reminders) => {
            let str = 'Your reminders are:\n';
            reminders.forEach(function (reminder) {
                str+='- ' + reminder.action + ' on ' + moment.utc(reminder.datetime).local().format('MMMM Do YYYY [at] h:mm a') + '\n';
            });
            sendTextMessage(userId, str, false)
        };

        service.getAllReminders(userId, startTime, endTime, callback);
    }
};

module.exports.sendAlert = (userId, msg) => {
    sendTextMessage(userId, msg, true);
};

module.exports.processMessage = (event) => {
    const userId = event.sender.id;
    const message = event.message.text;

    sendToNLP(userId, message);
};

const sendToNLP = (userId, message) => {

    console.log(JSON.stringify(config));

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: languageCode,
            }
        }
    };

    sessionClient.detectIntent(request)
        .then(responses => {
            // console.log(responses);
            // console.log("-----");
            const result = responses[0].queryResult;
            // console.log(result);

            if (result.allRequiredParamsPresent && result.intent.displayName !== 'about-reminders') {
                processIntent(result, userId);
            } else {
                sendTextMessage(userId, result.fulfillmentText, false);
            }
        })
        .catch(err => console.error('Error:', err));
};

module.exports.processPayload = (event) => {
    const userId = event.sender.id;
    const payload = event.postback.payload;
    const tokens = payload.split('_');
    const type = tokens[0];
    const action = tokens[1];

    // console.log("here");
    // console.log(tokens);

    if (type === 'snooze' && action) {
        //TODO: snooze from both text & button
        service.snoozeReminder(userId, action, (queryResult) => {
            sendTextMessage(userId, "Reminder snoozed for 5 minutes", false)
        });
    } else if (type === 'confirm') {
        //TODO: set confirm flag, add to queries
        sendTextMessage(userId, "Reminder confirmed", false);
    } else if (type === 'add-reminder' || type === 'get-started' || type === 'get-reminders') {
        // console.log("here2");
        sendToNLP(userId, event.postback.title);
    }
};