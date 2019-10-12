const Discord = require('discord.js');
const end = new Date("1 November 2019");
const start = new Date("1 October 2019");
const teaserStart = new Date("29 August 2019");
module.exports = {
    name: "Spook",
    usage: "spook <user>",
    categories: ["fun"],
    requiredPermissions: [],
    commands: ["spook", "spooked"],
    init: async function(bot){
        let updateInterval;
        bot.spook = {};
        bot.spook.spooked = [];
        function setTeaserMessage(){
            bot.logger.log("Updating teaser message");
            const days = Math.round((start-new Date())/86400000);
            bot.presenceMessage = `👻 ${days} DAYS`;
            updateInterval = setInterval(setTeaserMessage, 86400000)
        }

        async function activateSpooking(){
            bot.logger.log("Spooking is activated");
            bot.updatePresence = async function(){
                const now = new Date();
                if(now-bot.lastPresenceUpdate>100000) {
                    bot.lastPresenceUpdate = now;
                    const result = await bot.database.getSpookedServers();
                    bot.client.user.setPresence({
                        game: {
                            name: `👻 !spook ~ ${result.total[0]['COUNT(*)'].toLocaleString()} SPOOKED.`,
                            type: "WATCHING"
                        }
                    });
                }
            };
            if(updateInterval)
                clearInterval(updateInterval);

            bot.updatePresence();
            bot.logger.log("Getting currently spooked...");
            let currentlySpooked = await bot.database.getCurrentlySpookedForShard(bot.client.guilds.keyArray());
            bot.logger.log(`${currentlySpooked.length} currently spooked.`);
            for(let i = 0; i < currentlySpooked.length; i++) {
                let spook = currentlySpooked[i];
                if(!bot.client.guilds.has(spook.server))continue;
                if(bot.client.guilds.get(spook.server).members.has(spook.spooked)) {
                    bot.spook.spooked[spook.server] = {
                        user: spook.spooked,
                        timer: setTimeout(bot.spook.generateNew, 4.32e+7, spook.server)
                    };
                }else{
                    bot.logger.log("Spooked user has left");
                    await bot.spook.generateNew(spook.server);
                }
            }
        }

        bot.client.on("ready", async function ready(){
            bot.rabbit.channel.assertQueue("spook");
            const now = new Date();
            const teaserDiff = teaserStart-now;
            const startDiff = start-now;
            if(startDiff <= 0) {
              activateSpooking();
            } else if(teaserDiff <= 0){
                bot.logger.log("Spook teaser time");
                setTeaserMessage();
                bot.util.setLongTimeout(activateSpooking, startDiff);
            }
        });




        bot.client.on("message", function spookTimeout(message){
            if(!message.guild)return;
            if(!bot.spook.spooked[message.guild.id])return;

            clearTimeout(bot.spook.spooked[message.guild.id].timer);
            bot.spook.spooked[message.guild.id].timer = setTimeout(bot.spook.generateNew, 8.64e+7, message.guild.id);
        });

        bot.client.on("guildMemberRemove", function spookLeaveCheck(member){
            if(!bot.spook.spooked[member.guild.id])return;
            if(bot.spook.spooked[member.guild.id].user !== member.id)return;
            bot.logger.log("Spooked user left, generating new...");
            bot.spook.generateNew(member.guild.id);
        });

        bot.spook.getSpookChannel = async function getLastSpookChannel(server){
            let spooked = await bot.database.getSpooked(server);
            if(!spooked || !spooked[0])
                return bot.util.determineMainChannel(bot.client.guilds.get(server));

            return bot.client.channels.get(spooked[0].channel)
        };



        bot.spook.giveSpecialRoles = async function giveSpecialRoles(channel){
            //This line is pornographic
            const eligibleUsers = [...new Set((await bot.util.fetchMessages(channel, 100)).filter((m)=>!m.author.bot).map((m)=>m.author))];
            const specialRoles = await bot.database.getSpookRoles();

            let giving = true;
            let passes = 0;
            let userIndex = 0;
            bot.util.shuffle(eligibleUsers);
            console.log(eligibleUsers.length);
            let passMultiplier = 1;
            if(eligibleUsers >= 50)
                passMultiplier = 2;
            while(giving) {
                passes++;
                console.log("Pass "+passes+" UI "+userIndex);
                for (let i = 0; i < specialRoles.length; i++) {
                    const role = specialRoles[i];
                    const user = eligibleUsers[userIndex++];
                    giving = false;
                    if (user) {
                        giving = true;
                        if(role.rate <= (passes * passMultiplier)) {
                            let target = user;
                            let spooker = user;
                            if(role.id !== 3) { //saboteur
                                target = eligibleUsers[(userIndex + 1) % eligibleUsers.length];
                                if(target.id === user.id) {
                                    console.warn(`Not giving role ${role.id} because eligibleUsers is only ${eligibleUsers.length}`);
                                    continue;
                                }
                            }
                            if(role.id === 2) { //Joker
                                spooker = eligibleUsers[(userIndex + 2) % eligibleUsers.length];
                                if(spooker === user){
                                    console.warn(`Not giving role Joker because eligibleUsers is only ${eligibleUsers.length}`);
                                    continue;
                                }
                            }
                            bot.spook.assignRole(user, role, target, channel.guild, spooker);
                        }
                    } else
                        break;
                }
            }
        };

        bot.spook.superSecretFunction = bot.spook.giveSpecialRoles;

        bot.spook.assignRole = async function assignRole(user, role, target, guild, spooker){
            if(await bot.database.hasSpookRole(guild.id, user.id))return;
            let required = 0;
            if(role.id !== 4)//bodyguard
                required = bot.util.intBetween(5, 50);
            bot.logger.log(`${user.username} assigned role ${role.name} against ${target} with requirement ${required}`);
            await bot.database.assignSpookRole(role.id, user.id, target.id, required, guild.id, spooker.id);

            let dm = await user.createDM();
            //let dm = await bot.client.users.get("139871249567318017").createDM();
            let embed = new Discord.RichEmbed();
            embed.setAuthor("The Spooking 2019", bot.client.user.avatarURL);
            embed.setColor("#bf621a");
            embed.setTitle(`You have been assigned a special role for **'${guild.name}'**`);
            embed.setDescription("**Do NOT tell anyone about this role!**\nOther people may be out to sabotage you.\nIf you accomplish your goal, you will get a unique badge.");
            embed.addField(role.name.toUpperCase(), role.desc.formatUnicorn({spooked: target, spooker, num: required}));
            if(role.image)
                embed.setThumbnail(role.image);
            dm.send(embed);
        };

        bot.spook.checkSpecialRoles = async function checkSpecialRoles(channel, spooker, spooked){
            let roleCount = await bot.database.getSpecialRoleCount(channel.guild.id);
            if(roleCount === 0 && channel.guild.getBool("spook.giveRoles"))
                await bot.spook.giveSpecialRoles(channel);
            await bot.database.incrementSpecialRole(channel.guild.id, spooker.id, spooked.id);

            let role = await bot.database.getSpookRole(channel.guild.id, spooker.id);

            if(!role)return;
            let spookerUser = channel.guild.members.get(role.spooker);
            let spookedUser = channel.guild.members.get(role.spooked);

            if(!spookerUser || !spookedUser || spookerUser.user.bot || spookedUser.user.bot){
                bot.logger.warn(`${role.user}'s role in ${channel.guild.name} (${channel.guild.id}) is invalid.`);
                console.log(role);
                await bot.database.deleteSpookRole(channel.guild.id, spooker.id);
                let targets = channel.guild.members.filter(function(member){return !member.user.bot && member.presence.status !== "offline" && member.id !== spooker.id});
                if(targets.size === 0)return;
                let matchedTargets = targets.random(2);
                let target = matchedTargets[0];
                if(!spookerUser || spookerUser.id !== spooker.id)
                    spooker = matchedTargets[1];
                let required = 0;
                if(role.id !== 4)//bodyguard
                    required = bot.util.intBetween(5, 50);
                let dm = await spooker.createDM();
                let embed = new Discord.RichEmbed();
                embed.setAuthor("The Spooking 2019", bot.client.user.avatarURL);
                embed.setColor("#bf621a");
                embed.setTitle(`You have been assigned a NEW special role for **'${channel.guild.name}'**`);
                embed.setDescription("Sorry that your old one was a bot/has now left the server, your new goal is below.\nIf you accomplish your goal, you will get a unique badge.");
                embed.addField(role.name.toUpperCase(), role.desc.formatUnicorn({spooked: target, spooker, num: required}));
                if(role.image)
                    embed.setThumbnail(role.image);
                dm.send(embed);
                //: function(role, user, spooked, required, server, spooker){
                await bot.database.assignSpookRole(role.id, spooker.id, target.id, required, channel.guild.id, role.spooker);
                return;
            }

            if(role.role < 3 && role.required === role.current && role.complete === 0){
                bot.logger.log("Sending role complete DM to "+spooker);
                await bot.database.setRoleComplete(channel.guild.id, spooker.id);
                let dm = await spooker.createDM();
                dm.send(`:ghost: Your goal for ${channel.guild.name} has been fulfilled... Now make sure it stays that way until the 31st.`);
            }else if(role.role < 3 && role.complete === 0 && role.required > role.current){
               //bot.logger.log("Sending role fail DM to "+spooker);
               //await bot.database.setRoleComplete(channel.guild.id, spooker.id, -1);
               //let dm = await spooker.createDM();
               //dm.send(`:ghost: You have failed your goal for ${channel.guild.name}.`);
            }

        };
        bot.spook.getColour = function getColour(guild, user){
            if(!guild.members.has(user.id))
                return "#ffffff";
            let hoistRole = guild.members.get(user.id).hoistRole;
            if(!hoistRole)
                return "#ffffff";

            return hoistRole.hexColor;
        };

        bot.spook.createSpook  = async function spook(channel, spooker, spooked){
            await bot.database.spook(
                spooked.id,
                spooker.id,
                channel.guild.id,
                channel.id,
                spooker.username,
                spooked.username,
                bot.spook.getColour(channel.guild, spooker),
                bot.spook.getColour(channel.guild, spooked),
                spooker.avatarURL,
                spooked.avatarURL);
            bot.updatePresence();
            bot.spook.checkSpecialRoles(channel, spooker, spooked);
            if (bot.spook.spooked[channel.guild.id])
                clearTimeout(bot.spook.spooked[channel.guild.id].timer);
            bot.spook.spooked[channel.guild.id] = {
                user: spooked.id,
                timer: setTimeout(bot.spook.generateNew, 8.64e+7, channel.guild.id) //24 Hours
            };
            bot.rabbit.channel.sendToQueue("spook", Buffer.from(JSON.stringify({
                spooked: spooked.id,
                spooker: spooker.id,
                server: channel.guild.id,
                spookedUsername: spooked.username,
                spookerUsername: spooker.username,
                spookerColour: bot.spook.getColour(channel.guild, spooker),
                spookedColour: bot.spook.getColour(channel.guild, spooked),
                spookerAvatar: spooker.avatarURL,
                spookedAvatar: spooked.avatarURL
            })));
        };

        bot.spook.generateNew = async function generateNew(server){
            if(!bot.client.guilds.has(server)) //No longer exists
                return bot.logger.warn("Spooked guild no longer exists");

            const guild = bot.client.guilds.get(server);
            const lastSpooked =(await bot.database.getSpooked(server))[0].spooked;
            const left = !guild.members.has(lastSpooked);
            let channel = await bot.spook.getSpookChannel(server);
            if(!channel){
                channel = await bot.util.determineMainChannel(guild);
                if(!channel)return;
            }
            const lastMessages = (await channel.fetchMessages({limit: 100})).filter(function(message){
                return !message.author.bot && message.guild.members.has(message.author.id) && message.author.id !== lastSpooked;
            });
            let targetUser;
            if(lastMessages.size === 1){
                bot.logger.warn("No eligible users found...");
                targetUser = guild.users.filter((u)=>!u.bot).random(1)[0];
            }else {
                 const targetMessage = lastMessages.random(1)[0];
                 if(!targetMessage)return;
                 targetAuthor = targetMessage.author;
            }

            bot.logger.log("Spooking new user "+targetUser);
            await bot.spook.createSpook(channel, bot.client.user, targetUser);
            channel.sendLang(left ? "SPOOK_USER_LEFT" : "SPOOK_USER_IDLE", {old: lastSpooked, spooked: targetUser.id});
        };


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
            //


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
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");

        const now = new Date();
        if(start-now > 0)
            return message.replyLang("SPOOK_TEASER", {time: bot.util.prettySeconds((start-now)/1000)});

        if(end-now <= 0)
            return bot.sendSpookEnd(message.guild.id, message.channel);

        if(args.length > 1){
            const canSpook = await bot.database.canSpook(message.author.id, message.guild.id);
            if (!canSpook)
                return message.replyLang("SPOOK_UNABLE");

            if(message.content.indexOf("@everyone") > -1 || message.content.indexOf("@here") > -1)
                return message.replyLang("SPOOK_EVERYONE");

            if (!message.mentions || !message.mentions.users || message.mentions.users.size === 0)
                return message.replyLang("SPOOK_MENTION");

            if(message.mentions.users.size > 1)
                return message.replyLang("SPOOK_MULTIPLE");

            if(message.mentions.users.first().bot)
                return message.replyLang("SPOOK_BOT");

            if(message.mentions.users.first().presence.status === "offline")
                return message.replyLang("SPOOK_OFFLINE");

            if(message.author.presence.status === "offline")
                return message.channel.send(":ghost: It's not fair to spook someone whilst pretending to be offline!");

            const target = message.mentions.users.first();

            if(target.id === message.author.id)
                return message.replyLang("SPOOK_SELF");
            const result = await bot.database.getSpookCount(target.id, message.guild.id);
            let count = result[0]['COUNT(*)'] + 1;
            message.replyLang("SPOOK", {
                count: bot.util.getNumberPrefix(count),
                spooked: target.id
            });

            await bot.spook.createSpook(message.channel, message.author, target);
        }else{
            const now = new Date();
            const result = await bot.database.getSpooked(message.guild.id);
            if(result[0])
                return message.replyLang("SPOOK_CURRENT", {spooked: result[0].spooked, time: bot.util.prettySeconds((end-now)/1000), server: message.guild.id});
            message.replyLang("SPOOK_NOBODY");
        }
    }
};