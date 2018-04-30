/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "eval",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        eval(message.substring(12));
        recv.sendMessage({
            to: channel,
            message: "Executed"
        });
    }
};