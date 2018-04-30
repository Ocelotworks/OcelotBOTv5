/**
 * Created by Peter on 11/07/2017.
 */
module.exports = {
    id: "sayto",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        recv.sendMessage({
            to: args[2],
            message: message.substring(message.indexOf(args[3]))
        });
    }
};