const processMessage = require('./process-message');

// const processPayload = (payload) => {
//     if (payload.text === 'snooze' && payload.action) {
//
//     }
// };

module.exports = (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                console.log("Event: " + JSON.stringify(event));
                if (event.message && event.message.text) {
                    processMessage.process(event);
                }
                // if (event.postback && event.postback.payload) {
                //     const payload = JSON.parse(event.postback.payload);
                //     processPayload(payload);
                // }
            });
        });

        res.status(200).end();
    }
};