const messenger = require('./messenger-interface');

module.exports = () => {
    messenger.getStarted()
        .then((response) => response.json())
        .then((data) => {
            console.log('Fetch result: ', data);
            if (data.result === 'success') {
                messenger.persistentMenu()
                    .then((response) => response.json())
                    .then((data) => console.log('Fetch result: ', data));
            }
        })
        .catch((error) => console.log('Error: ', error));
};
