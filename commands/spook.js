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

        bot.client.on("ready", async function ready(){
            bot.logger.log("Setting spooky presence");
            await bot.setSpookyPresence();

            bot.spooked = {};

            const spookedResult = await bot.database.getSpooked();

            for(let i = 0; i < spookedResult.length; i++){
                const spook = spookedResult[i];
                if(bot.client.guilds.has(spook.server) && !bot.spooked[spook.server]){
                    bot.spooked[spook.server] = {
                        user: spook.spooked,
                        timer: setTimeout(bot.generateNewSpook, 8.64e+7, spook.server) //24 Hours
                    }
                }
            }
            bot.logger.log("This shard has "+Object.keys(bot.spooked).length+" spooked servers.");



        });


        bot.client.on("message", function(message){
           if(bot.spooked && message.guild && bot.spooked[message.guild.id]){
               // noinspection EqualityComparisonWithCoercionJS
               if(bot.spooked[message.guild.id].user == message.author.id){
                   clearTimeout(bot.spooked[message.guild.id].timer);
                   bot.spooked[message.guild.id].timer = setTimeout(bot.generateNewSpook, 8.64e+7, message.guild.id);
               }
           }
        });


        bot.generateNewSpook = async function generateNewSpook(server, left){
            bot.logger.warn("Generating new spook for "+server);
            if (!bot.client.guilds.has(server)) {
                bot.logger.warn("Spooked server no longer exists.");
            }else{
                const guild = bot.client.guilds.get(server);
                const lastSpook = await bot.database.getSpooked(server);
                const availableChannels = guild.channels.filter(function(guildChannel){
                    return guildChannel.type === "text" && guildChannel.permissionsFor(bot.client.user).has("SEND_MESSAGES");
                });
                const channel = availableChannels.random(1)[0];
                const lastMessages = (await channel.fetchMessages({limit: 50})).filter(function(message){
                    return !message.author.bot && message.guild.members.has(message.author.id);
                });
                const target = lastMessages.random(1)[0].author;
                bot.logger.log("New target is "+target.id);
                bot.logger.log(`Spooked server name is ${guild.name} - notifying in ${channel.name} (${channel.id})`);
                if(left)
                    channel.send(`:ghost: The spooked user has left the server.\n**The spook passes to <@${target.id}>!**`);
                else
                    channel.send(`:ghost: The spooked user (<@${lastSpook[0].spooked}>) has not spoken for 24 hours.\n**The spook passes to <@${target.id}>!**`);

                await bot.database.spook(target.id, lastSpook[0].spooked, server, target.username, lastSpook[0].spookedUsername);
                if(bot.spooked[server].timer)
                    clearTimeout(bot.spooked[server].timer);
                bot.spooked[server] = {
                    user: target.id,
                    timer: setTimeout(bot.generateNewSpook, 8.64e+7, server) //24 Hours
                };
            }
        };

        bot.client.on("guildMemberRemove", async function guildMemberRemove(member){
            const guild = member.guild;
            const result = await bot.database.getSpooked(guild.id);
            if(result[0] && result[0].spooked !== member.id){
                bot.logger.log("Spooked user left");
                bot.generateNewSpook(guild.id, true);
            }
        });

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
                await bot.database.spook(target.id, message.author.id, message.guild.id, message.author.username, target.username);
                await bot.setSpookyPresence();
                if(bot.spooked[message.guild.id])
                    clearTimeout(bot.spooked[message.guild.id].timer);
                bot.spooked[message.guild.id] = {
                    user: target,
                    timer: setTimeout(bot.generateNewSpook, 8.64e+7, message.guild.id) //24 Hours
                };
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