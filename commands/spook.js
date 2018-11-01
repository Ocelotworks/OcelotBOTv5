const Discord = require('discord.js');
const end = new Date(1541030400000);
module.exports = {
    name: "Spook",
    usage: "spook <user>",
    categories: ["fun"],
    requiredPermissions: [],
    commands: ["spook", "spooked"],
    init: async function(bot){
        // bot.setSpookyPresence = async function(){
        //     const result = await bot.database.getSpookedServers();
        //     bot.client.user.setPresence({
        //         game: {
        //             name: `👻 !spook ~ ${result.total[0]['COUNT(*)']} SPOOKED.`,
        //             type: "WATCHING"
        //         }
        //     });
        // };
        //
        // bot.client.on("ready", async function ready(){
        //     bot.logger.log("Setting spooky presence");
        //     await bot.setSpookyPresence();
        //
        //     bot.spooked = {};
        //
        //     const spookedResult = await bot.database.getSpooked();
        //
        //     for(let i = 0; i < spookedResult.length; i++){
        //         const spook = spookedResult[i];
        //         if(bot.client.guilds.has(spook.server) && !bot.spooked[spook.server]){
        //             bot.spooked[spook.server] = {
        //                 user: spook.spooked,
        //                 timer: setTimeout(bot.generateNewSpook, 8.64e+7, spook.server) //24 Hours
        //             }
        //         }
        //     }
        //     bot.logger.log("This shard has "+Object.keys(bot.spooked).length+" spooked servers.");
        // });
        //
        // bot.spookReactChance = 0.6;
        //
        // bot.client.on("message", function(message){
        //    if(bot.spooked && message.guild && bot.spooked[message.guild.id]){
        //        // noinspection EqualityComparisonWithCoercionJS
        //        if(bot.spooked[message.guild.id].user == message.author.id){
        //            clearTimeout(bot.spooked[message.guild.id].timer);
        //            bot.spooked[message.guild.id].timer = setTimeout(bot.generateNewSpook, 8.64e+7, message.guild.id);
        //            // if(message.channel.permissionsFor(bot.client.user).has("ADD_REACTIONS") && Math.random() > bot.spookReactChance){
        //            //      bot.logger.log(`Reacting to message in ${message.guild.name} (${message.guild.id})`);
        //            //      message.react("👻");
        //            // }
        //        }
        //    }
        // });


        // bot.generateNewSpook = async function generateNewSpook(server, left){
        //     bot.logger.warn("Generating new spook for "+server);
        //     if (!bot.client.guilds.has(server)) {
        //         bot.logger.warn("Spooked server no longer exists.");
        //     }else{
        //         const guild = bot.client.guilds.get(server);
        //         const lastSpook = await bot.database.getSpooked(server);
        //         let channel = guild.channels.find(function(channel){
        //            return (channel.name.indexOf("general") > -1 || channel.name.indexOf("main") > -1) && channel.permissionsFor(bot.client.user).has("SEND_MESSAGES");
        //         });
        //         if(!channel) {
        //             const availableChannels = guild.channels.filter(function (guildChannel) {
        //                 return guildChannel.type === "text" && guildChannel.permissionsFor(bot.client.user).has("SEND_MESSAGES");
        //             });
        //             channel = availableChannels.random(1)[0];
        //         }
        //         const lastMessages = (await channel.fetchMessages({limit: 50})).filter(function(message){
        //             return !message.author.bot && message.guild.members.has(message.author.id);
        //         });
        //         const randomMessage = lastMessages.random(1)[0];
        //         let target;
        //         if(randomMessage){
        //             target = randomMessage.author;
        //         }else{
        //             const onlineUsers = guild.members.filter(function(member){
        //                 return !member.user.bot && member.id !== lastSpook[0].spooked && member.user.presence.status !== "offline"
        //             });
        //             if(onlineUsers.size === 0){
        //                 bot.logger.warn(`Couldn't generate a new spook for ${guild.name} (${guild.id})`);
        //                 return;
        //             }
        //             target = onlineUsers.random(1);
        //         }
        //
        //         if(!target){
        //             bot.logger.warn("No target found");
        //             return;
        //         }
        //
        //         bot.logger.log("New target is "+target.id);
        //         bot.logger.log(`Spooked server name is ${guild.name} (${guild.id}) - notifying in ${channel.name} (${channel.id})`);
        //         if(left)
        //             channel.send(`:ghost: The spooked user has left the server.\n**The spook passes to <@${target.id}>!**`);
        //         else
        //             channel.send(`:ghost: The spooked user (<@${lastSpook[0].spooked}>) has not spoken for 24 hours.\n**The spook passes to <@${target.id}>!**`);
        //
        //         await bot.database.spook(target.id, lastSpook[0].spooked, server, lastSpook[0].spookedUsername, target.username);
        //         if(bot.spooked[server].timer)
        //             clearTimeout(bot.spooked[server].timer);
        //         bot.spooked[server] = {
        //             user: target.id,
        //             timer: setTimeout(bot.generateNewSpook, 8.64e+7, server) //24 Hours
        //         };
        //     }
        // };

        // bot.client.on("guildMemberRemove", async function guildMemberRemove(member){
        //     const guild = member.guild;
        //     const result = await bot.database.getSpooked(guild.id);
        //     if(result[0] && result[0].spooked == member.id){
        //         bot.logger.log("Spooked user left");
        //         bot.generateNewSpook(guild.id, true);
        //     }
        // });



        // bot.spookSanityCheck = async function spookSanityCheck(){
        //     bot.logger.log("Sanity checking spooks...");
        //     const servers = await bot.database.getParticipatingServers();
        //     for(let i = 0; i < servers.length; i++){
        //         const serverID = servers[i].server;
        //         if(bot.client.guilds.has(serverID)){
        //             const spooked = await bot.database.getSpooked(serverID);
        //             const guild = bot.client.guilds.get(serverID);
        //             const members = guild.members;
        //             if(!guild.members.has(spooked[0].spooked) || guild.members.get(spooked[0].spooked).bot){
        //                 bot.logger.log("Spooked user no longer exists for "+serverID);
        //                 bot.generateNewSpook(serverID, true);
        //             }
        //         }
        //     }
        // };
        //
        // bot.spookSanityCheck();


        bot.doSpookEnd = async function doSpookEnd(){
            // const now = new Date();
            //
            // bot.logger.warn("***TRIGGERING SPOOK END***");
            //
            // bot.logger.log("Notifying Servers...");
            // const servers = await bot.database.getParticipatingServers();
            // for(let i = 0; i < servers.length; i++){
            //     const server = servers[i];
            //     if(bot.client.guilds.has(server.server)){
            //         bot.sendSpookEnd(server.server);
            //     }
            // }


            bot.logger.log("Allocating Badges...");
            const users = await bot.database.getParticipatingUsers();
            for(let j = 0; j < users.length; j++) {
                const userRow = users[j];
                if (!await bot.database.hasBadge(userRow.spooker, 2)) {
                    bot.logger.log("Given spook participant badge to "+userRow.spooker);
                    await bot.database.giveBadge(userRow.spooker, 2);
                }

                if (userRow.spooker !== userRow.spooked && !await bot.database.hasBadge(userRow.spooked, 2)) {
                    bot.logger.log("Given spook participant badge to "+userRow.spooked);
                    await bot.database.giveBadge(userRow.spooked, 2);
                }
            }

            // bot.logger.log("Setting the presence...");
            // const serverCount  = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
            // bot.presenceMessage = "Thank you for playing!";
            // bot.client.user.setPresence({
            //     game: {
            //         name: `Thank you for playing! | ${serverCount} servers.`,
            //         type: "LISTENING"
            //     }
            // });
            //
            // bot.spooked = [];


        };

        bot.sendSpookEnd = async function sendSpookSend(id, channel){
            if(!bot.client.guilds.has(id))return;
            const server = bot.client.guilds.get(id);
            const spooked = await bot.database.getSpooked(id);
            if(!spooked[0]){
                bot.logger.warn(`${server.name} (${server.id}) didn't participate in the spooking.`);
            }else {
                const loser = spooked[0].spooked;
                bot.logger.log(`Sending spook end for ${server.name} (${server.id})`);
                let eligibleChannels;
                if (!channel) {
                    eligibleChannels = server.channels.filter(function (channel) {
                        return channel.permissionsFor(bot.client.user).has("SEND_MESSAGES");
                    });
                }
                const targetChannel = channel || eligibleChannels.first();
                bot.logger.log(`Target channel for ${server.name} (${server.id}) is ${targetChannel.name} (${targetChannel.id})`);

                const spookStats = await bot.database.getSpookStats(id);

                let embed = new Discord.RichEmbed();
                embed.setColor(0xd04109);
                embed.setTitle("The Spooking Has Ended.");
                embed.setTimestamp(new Date());
                embed.setFooter("Happy Halloween!", "https://cdn.discordapp.com/avatars/146293573422284800/a3ba7bf8004a9446239e0113b449a30c.png?size=128");
                embed.setDescription(`Thank you all for participating.\n**<@${loser}> is the loser!**\nIf you enjoyed this halloween event please consider [voting for OcelotBOT](https://discordbots.org/bot/146293573422284800/vote).`);
                embed.addField("Total Spooks", spookStats.totalSpooks, true);
                embed.addField("Most Spooked User", `<@${spookStats.mostSpooked.spooked}> (${spookStats.mostSpooked['COUNT(*)']} times)`, true);
                embed.addField("Longest Spook", `<@${spookStats.longestSpook.spooked}> (Spooked for ${bot.util.prettySeconds(spookStats.longestSpook.diff)})`);
                embed.addField("Spook Graph", "Below is a graph of all the spooks on this server.\nOr click [here](https://ocelot.xyz/graph.png) for a graph of all the spooks across all servers.");
                embed.setImage("http://ocelot.xyz/graph.php?server="+id+"&end=true");
                targetChannel.send("", embed);


                if(!await bot.database.hasBadge(loser, 1))
                    await bot.database.giveBadge(loser, 1);
            }
        };




    },
    run: async function(message, args, bot){
        if(end-new Date() <= 0){
            bot.sendSpookEnd(message.guild.id, message.channel);
            return;
        }
        if(!message.guild){
            message.channel.send("This command cannot be used in a DM or group.");
        }else if(args.length > 1){
           const canSpook = await bot.database.canSpook(message.author.id, message.guild.id);
            if (!canSpook) {
                message.channel.send(":ghost: You are unable to spook. Type !spook to see who is currently spooked.")
            }else if(message.content.indexOf("@everyone") > -1 || message.content.indexOf("@here") > -1){
                message.channel.send(":ghost: Seriously? You can't spook everyone....");
            }else if (!message.mentions || !message.mentions.users || message.mentions.users.size === 0) {
                message.channel.send(":ghost: To spook someone you must @mention them.");
            }else if(message.mentions.users.first().bot){
                message.channel.send(":ghost: Bots can't get spooked!");
            }else if(message.mentions.users.first().presence.status === "offline"){
                message.channel.send(":ghost: You can't spook someone who's offline!");
            }else{
                const target = message.mentions.users.first();
                // noinspection EqualityComparisonWithCoercionJS
                if(target.id == message.author.id){
                    message.channel.send(":ghost: You can't spook yourself!");
                }else {
                    const result = await bot.database.getSpookCount(target.id, message.guild.id);
                    message.channel.send(`:ghost: **<@${target.id}> has been spooked for the ${bot.util.getNumberPrefix(result[0]['COUNT(*)']+1)} time!**\nThey are now able to spook anyone else on the server.\n**The person who is spooked at midnight on the 31st of October loses!**`);
                    await bot.database.spook(target.id, message.author.id, message.guild.id, message.author.username, target.username);
                    await bot.setSpookyPresence();
                    if (bot.spooked[message.guild.id])
                        clearTimeout(bot.spooked[message.guild.id].timer);
                    bot.spooked[message.guild.id] = {
                        user: target.id,
                        timer: setTimeout(bot.generateNewSpook, 8.64e+7, message.guild.id) //24 Hours
                    };
                }
            }
        }else{
            const now = new Date();
            const result = await bot.database.getSpooked(message.guild.id);
            if(result[0]){
                message.channel.send(`:ghost: <@${result[0].spooked}> is currently spooked.\nThey are able to spook anyone else on the server with !spook @user.\n**The spooking ends in ${bot.util.prettySeconds((end-now)/1000)}**`)
            }else{
                message.channel.send(`:ghost: Nobody is currently spooked! Spook someone with !spook @user\n**The person who is spooked at midnight on the 31st of October loses!**`)
            }
        }
    }
};