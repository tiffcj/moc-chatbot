const messenger = require('./messenger-interface');

// Receives events from messenger
module.exports = (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && event.message.text) {
                    messenger.processMessage(event);
                }
                if (event.postback && event.postback.payload) {
                    messenger.processPayload(event);
                }
            });
        });

        res.status(200).end();
    }
};