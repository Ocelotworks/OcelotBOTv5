module.exports = {
    name: "Set Presence",
    usage: "setPresence [message]",
    commands: ["setpresence"],
    run:  async function(message, args, bot){
        bot.presenceMessage = args[3] === "clear" ? null : message.content.substring(message.content.indexOf(args[2]));
        if(bot.client.shard){
            bot.client.shard.send({type: "presence", payload: bot.presenceMessage})
        }else{
            const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
            bot.client.user.setPresence({
                activity: {
                    name: `${bot.presenceMessage && bot.presenceMessage + " | "} ${serverCount} servers.`,
                    type: "LISTENING"
                }
            });
        }
    }
};