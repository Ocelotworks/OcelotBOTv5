/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "presence",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        recv.setMessage(message.substring(16));
        recv.sendMessage({
            to: channel,
            message: "Presence message set."
        });
    }
};