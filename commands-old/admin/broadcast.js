/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "broadcast",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        for(var i in bot.servers){
            recv.sendMessage({
                to: Object.keys(bot.servers[i].channels)[0],
                message: ":bangbang: BROADCAST: "+message.substring(17)
            });
        }
    }
};