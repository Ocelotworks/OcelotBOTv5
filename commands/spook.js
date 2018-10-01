module.exports = {
    name: "Spook",
    usage: "spook <user>",
    categories: ["fun"],
    requiredPermissions: [],
    commands: ["spook", "spooked"],
    init: async function(bot){
        bot.setSpookyPresence = async function(){
            const result = await bot.database.getSpookedServers();
            bot.client.user.setPresence({
                game: {
                    name: `👻 !spook ~ ${result.total[0]['COUNT(*)']} SPOOKED.`,
                    type: "WATCHING"
                }
            });
        };

        bot.client.on("ready", async function(){
            bot.logger.log("Setting spooky presence");
            await bot.setSpookyPresence();
        })



    },
    run: async function(message, args, bot){
        if(!message.guild){
            message.channel.send("This command cannot be used in a DM or group.");
        }else if(args[1]){
           const canSpook = await bot.database.canSpook(message.author.id, message.guild.id);
            if (!canSpook) {
                message.channel.send(":ghost: You are unable to spook. Type !spook to see who is currently spooked.")
            }else if (!message.mentions || !message.mentions.users || message.mentions.users.size === 0) {
                message.channel.send(":ghost: To spook someone you must @mention them.");
            }else if(message.mentions.users.first().bot){
                message.channel.send(":ghost: Bots can't get spooked!");
            }else if(message.mentions.users.first().presence.status === "offline"){
                message.channel.send(":ghost: You can't spook someone who's offline!");
            }else{
                const target = message.mentions.users.first();
                message.channel.send(`:ghost: **<@${target.id}> has been spooked!**\nThey are now able to spook anyone else on the server.\n**The person who is spooked at midnight on the 31st of October loses!**`);
                await bot.database.spook(target.id, message.author.id, message.guild.id);
                await bot.setSpookyPresence();
            }
        }else{
            const result = await bot.database.getSpooked(message.guild.id);
            if(result[0]){
                message.channel.send(`:ghost: <@${result[0].spooked}> is currently spooked.\nThey are able to spook anyone else on the server with !spook @user.\n**The person who is spooked at midnight on the 31st of October loses!**`)
            }else{
                message.channel.send(`:ghost: Nobody is currently spooked! Spook someone with !spook @user\n**The person who is spooked at midnight on the 31st of October loses!**`)
            }
        }
    }
};