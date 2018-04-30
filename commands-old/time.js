/**
 * Created by Peter on 02/07/2017.
 */
const moment = require("moment-timezone");
module.exports = {
    name: "Time",
    usage: "time [timezone]",
    accessLevel: 0,
    commands: ["time", "thetime"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        var m = moment(),
            timezone = args[1],
            now = timezone ? m.tz(timezone) : m,
            emoji = `:clock${now.format("h")}${(now.get("m") >= 30) ? "30" : ""}:`;

        if(now.format("hh:mm") == "04:20")emoji = ":weed:";

        if(now.format("hh:mm") == "05:05") {
            recv.sendMessage({
                to: channel,
                message: `${emoji} I'm going back to **${now.format("hh:mm:ss YYYY-MM-DD z")}** whether it's a 7 hour flight or a 45 minute drive.`
            });
        }else if(now.format("hh:mm") == "09:11"){
            recv.sendMessage({
                to: channel,
                message: `:airplane_arriving: :office: :office: The time is **${now.format("hh:mm:ss YYYY-MM-DD z")}**`
            });
        }else{
            recv.sendMessage({
                to: channel,
                message: `${emoji} The time is **${now.format("hh:mm:ss YYYY-MM-DD z")}**`
            });
        }

    }
};