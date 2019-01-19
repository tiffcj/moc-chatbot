const messenger = require('./messenger-interface');

module.exports = (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                // console.log("Event: " + JSON.stringify(event));
                if (event.message && event.message.text) {
                    messenger.processMessage(event);
                }
                // if (event.postback && event.postback.payload) {
                //     messenger.processPayload(event);
                // }
            });
        });

        res.status(200).end();
    }
};