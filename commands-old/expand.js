/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Expand",
    usage: "expand <word>",
    accessLevel: 0,
    commands: ["expand"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        recv.sendMessage({
            to: channel,
            message:  message.replace(args[0], "").split("").join(" ")
        });
    }
};