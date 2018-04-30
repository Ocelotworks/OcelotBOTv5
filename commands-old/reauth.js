/**
 * Created by Peter on 01/07/2017.
 */
const config = require("config");
module.exports = {
    name: "Slack Reauth Tool",
    usage: "reauth",
    accessLevel: 5,
    commands: ["reauth"],
    receivers: ["slack"],
    run: function run(user, userID, channel, message, args, event, bot, recv) {
        recv.sendMessage({
            to: channel,
            message: `https://slack.com/oauth/pick?scope=${encodeURIComponent(args[1])}&client_id=${config.get("Slack.clientID")}`
        });
    }
};