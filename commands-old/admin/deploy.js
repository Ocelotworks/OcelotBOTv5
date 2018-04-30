/**
 * Created by Peter on 08/07/2017.
 */
const child_process = require('child_process');
module.exports = {
    id: "deploy",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        recv.sendMessage({
            to: channel,
            message: "Starting deployment..."
        });
        child_process.execFile('node', ['deploy.js']);

    }
};