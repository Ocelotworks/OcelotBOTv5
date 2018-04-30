/**
 * Created by Peter on 09/06/2017.
 */
module.exports = {
    name: "Invite Bot",
    usage: "invite",
    accessLevel: 0,
    commands: ["invite", "joinserver", "addbot"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        recv.sendMessage({
            to: channel,
            message: "https://discordapp.com/oauth2/authorize?client_id=171640650721132544&scope=bot&permissions=52288"
        });
    }
};