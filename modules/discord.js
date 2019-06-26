const Reattempt = require("reattempt").default;


const Discord = require('discord.js');
const request = require('request');
const config = require('config');
const fs = require('fs');
const presenceMessages = [
    "!help",
    "!profile",
    "!guess",
    "!premium",
    "!premium",
    "!vote",
    "Minecraft Parody Songs",
    "lord jesus help us all",
    "ass",
    "is this thing on",
    "cha cha real smooth",
    "stonks"
];


module.exports = {
    name: "Discord.js Integration",
    init: function(bot){

        Discord.Message.prototype.replyLang = async function(message, values){
            return this.channel.send(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values, this.author.id));
        };

        Discord.TextChannel.prototype.sendLang = async function(message, values){
            return this.send(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values));
        };

        Discord.Message.prototype.editLang = async function(message, values){
            return this.edit(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values, this.author.id));
        };

        Discord.Guild.prototype.getSetting = function(setting, user){
            return bot.config.get(this.id ? this.id : "global", setting, user);
        };

        Discord.Guild.prototype.getBool = function(setting, user){
            return bot.config.getBool(this.id, setting, user, );
        };

        Discord.Message.prototype.getSetting = function(setting){
            return bot.config.get(this.guild ? this.guild.id : "global", setting, this.author.id);
        };

        Discord.Message.prototype.getBool = function(setting){
           return bot.config.getBool(this.guild ? this.guild.id : "global", setting, this.author.id);
        };

        const oldsend = Discord.TextChannel.prototype.send;
        Discord.TextChannel.prototype.send = async function send(content, options){
            if(bot.stats){
                bot.stats.messagesSentPerMinute++;
            }
            let output = "";
            if(this.guild)
                output += `${this.guild.name} (${this.guild.id})`;
            else
                output += "DM Channel";
            output += " -> ";
            output += content;
            if(options)
                output += " (Embed)";


            bot.logger.log(output);

            return Reattempt.run({times: 3, onError: function(error, done, abort){
                if(error.code !== "ECONNRESET"){
                    bot.raven.captureException(error);
                    bot.logger.warn("Send Error: "+error);
                    abort();
                    throw error;
                }else{
                    bot.logger.warn("Connection reset, retrying send...");
                }
            }}, ()=>oldsend.apply(this, [content, options]));
        };

        bot.presenceMessage = null;


        bot.client = new Discord.Client({
            disabledEvents: ["TYPING_START", "CHANNEL_PINS_UPDATE", "GUILD_BAD_ADD", "GUILD_BAN_REMOVE"]
        });

        bot.client.setMaxListeners(100);

        bot.client.on("ready", async function discordReady(){
            bot.logger.log(`Logged in as ${bot.client.user.tag}`);
            bot.raven.captureBreadcrumb({
                message: "ready",
                category:  "discord",
                messageSweepInterval: 6000
            });

            setTimeout(async function(){
                const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
                bot.client.user.setPresence({
                    game: {
                        name: `${bot.util.arrayRand(presenceMessages)} | ${serverCount} servers.`,
                        type: "LISTENING"
                    }
                });
            }, 60000);


            bot.client.voiceConnections.forEach(function(connection){
               bot.logger.warn("Leaving orphaned voice "+connection.channel);
               connection.disconnect();
            });

            // const spooks = await bot.database.getDirtySpooks();
            // for(let i = 0; i < spooks.length; i++){
            //     let output = {};
            //     const spook = spooks[i];
            //     if(bot.client.users.has(spook.spooker)){
            //         output.spookerUsername = bot.client.users.get(spook.spooker).username;
            //     }
            //
            //     if(bot.client.users.has(spook.spooked)){
            //         output.spookedUsername = bot.client.users.get(spook.spooked).username;
            //     }
            //
            //     if(output.spookedUsername || output.spookerUsername) {
            //         await bot.database.updateSpook(spook.id, output);
            //         bot.logger.log(`Updating spook ${spook.id}`);
            //     }
            // }

        });

        bot.client.on("reconnecting", function discordReconnecting(){
            bot.logger.log("Reconnecting...");
            bot.raven.captureBreadcrumb({
                message: "reconnecting",
                category:  "discord",
            });
        });

        bot.client.on("disconnect", function discordDisconnected(){
            bot.raven.captureBreadcrumb({
                message: "disconnect",
                category:  "discord",
            });
           bot.logger.warn("Disconnected");
        });



        let lastPresenceUpdate = 0;



        bot.client.on("guildCreate", async function joinGuild(guild){
            bot.logger.log(`Joined server ${guild.id} (${guild.name})`);
            bot.raven.captureBreadcrumb({
                message: "guildCreate",
                category:  "discord",
                data: {
                    id: guild.id,
                    name: guild.name
                }
            });
             const now = new Date();
             if(now-lastPresenceUpdate>100000) {
                 lastPresenceUpdate = now;
                 const serverCount = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);

                 bot.client.user.setPresence({
                     game: {
                         name: `${bot.presenceMessage ? bot.presenceMessage : bot.util.arrayRand(presenceMessages)} | ${serverCount} servers.`,
                         type: "LISTENING"
                     }
                 });
             }
             try {
                 let lang = "en-gb";
                 if(guild.region.startsWith("us"))
                     lang = "en-us";
                 await bot.database.addServer(guild.id, guild.ownerID, guild.name, guild.joinedAt, lang);
                 await bot.database.unleaveServer(guild.id);
                 let mainChannel = bot.util.determineMainChannel(guild);
                 if(bot.config.getBool("global", "welcome.enabled")) {
                     if (mainChannel) {
                         bot.logger.log(`Found main channel of ${mainChannel.name} (${mainChannel.id})`);
                         let embed = new Discord.RichEmbed();
                         embed.setColor(bot.config.get("global", "welcome.embedColour"));
                         embed.setTitle("Welcome to OcelotBOT!");
                         embed.setDescription("You can find my commands [here](https://ocelot.xyz/#commands) or by typing !help.");
                         embed.addField("Support", "You can support the bot by [voting](https://discordbots.org/bot/146293573422284800/vote) or by subscribing to [premium](https://www.patreon.com/ocelotbot).");
                         embed.addField("Administrators", "You can change the bot's settings by typing !settings or by using the [dashboard](https://ocelot.xyz/dash/)");
                         embed.addField("Issues?", "If you have issues or suggestions, type !feedback or join our [support server](https://discord.gg/7YNHpfF).");
                         mainChannel.send("", embed);
                     }
                 }

                 if(bot.config.getBool("global", "webhook.enabled")){
                     try {
                         let webhook = await mainChannel.createWebhook("OcelotBOT", bot.client.avatarURL);
                         bot.logger.log(`Created webhook for ${guild.id}: ${webhook.id}`);
                         await bot.database.addServerWebhook(guild.id, webhook.id, webhook.token);
                     }catch(e){
                         bot.logger.warn("Failed to create webhook: "+e);
                     }
                 }else{
                     bot.logger.log("Not creating webhook.");
                 }

             }catch(e){
                 bot.logger.warn(`Error adding server ${e}`);
             }

        });

        bot.client.on("guildDelete", async function leaveGuild(guild){
            bot.logger.log(`Left server ${guild.id} (${guild.name})`);
            bot.raven.captureBreadcrumb({
                message: "guildDelete",
                category:  "discord",
                data: {
                    id: guild.id,
                    name: guild.name
                }
            });
            await bot.database.leaveServer(guild.id);

            if(bot.config.getBool("global", "webhook.enabled")) {
                bot.logger.log("Trying to send webhook...");
                let webhookData = (await bot.database.getServerWebhook(guild.id))[0];
                if (webhookData && webhookData.webhookID && webhookData.webhookToken) {
                    try {
                        let webhook = new Discord.WebhookClient(webhookData.webhookID, webhookData.webhookToken);
                        await webhook.send("Thanks for trying OcelotBOT! If you have a minute, please fill in the feedback form to help us improve: https://forms.gle/KMwXQiAAQPKzmuAp7");
                        bot.logger.log("Successfully sent webhook");
                        await webhook.delete("OcelotBOT was kicked");
                        webhook.destroy();
                    } catch (e) {
                        bot.logger.warn("Failed to send webhook");
                        console.log(e);
                        bot.raven.captureException(e);
                    }
                } else {
                    bot.logger.warn("Server had no webhook...");
                }
            }else{
                bot.logger.log("Not sending webhook");
            }
        });

        bot.client.on("webhookUpdate", function webhookUpdate(channel){

        });

        bot.client.on("error", function websocketError(evt){
            bot.logger.log("Websocket Error "+evt.message);
            //console.error(evt);
            bot.raven.captureException(evt.error);
        });

        bot.client.on("guildUnavailable", function guildUnavailable(guild){
            bot.logger.warn(`Guild ${guild.id} has become unavailable.`);
            bot.raven.captureBreadcrumb({
                message: "guildUnavailable",
                category:  "discord",
                data: {
                    id: guild.id,
                }
            });
        });


        bot.client.on("guildUpdate", async function guildUpdate(oldGuild, newGuild){
             if(oldGuild.name !== newGuild.name){
                 bot.logger.warn(`Guild ${oldGuild.name} (${oldGuild.id}) has changed it's name to ${newGuild.name}`);
                 await bot.database.updateServer(oldGuild.id, {name: newGuild.name});
             }
        });

        // bot.client.on("rateLimit", function rateLimit(info){
        //     bot.logger.warn(`Rate Limit Hit ${info.method} ${info.path}`);
        //     bot.raven.captureBreadcrumb({
        //         message: "ratelimit",
        //         category:  "discord",
        //         data: info
        //     });
        //     bot.raven.captureException(new Error(`Rate Limit Hit ${info.method} ${info.path}`));
        // });

        bot.client.on("warn", function warn(warning){
            bot.logger.warn(warning);
            bot.raven.captureBreadcrumb({
                message: "warn",
                category:  "discord",
                data: {
                    info: warning
                }
            });
        });

        bot.client.on("guildMemberUpdate", function guildMemberUpdate(oldMember, newMember){
            if(oldMember.id !== bot.client.user.id)return;
            if(!newMember.nickname)return;
            if(oldMember.nickname && oldMember.nickname === newMember.nickname)return;
            bot.logger.warn(`Nickname changed in ${oldMember.guild.name} (${oldMember.guild.id}) changed to ${newMember.nickname}`);
        });


        process.on("message", async function onMessage(message){
           if(message.type === "requestData"){
               if(message.payload.name === "channels"){
                   let guild = message.payload.data.server;
                   if(bot.client.guilds.has(guild)){
                       let callbackID = message.payload.callbackID;
                       let guildObj = bot.client.guilds.get(guild);
                       let channels = guildObj.channels.map(function(channel){
                           return {name: channel.name, id: channel.id}
                       });
                       bot.logger.log("Sending channel data for "+guildObj.name+" ("+guild+")");
                       bot.client.shard.send({
                           type: "dataCallback",
                           payload: {
                               callbackID: callbackID,
                               data: channels
                           }
                       })
                   }else{
                       console.log(guild+" not on this shard");
                   }
               }else if(message.payload.name === "guildCount" && message.payload.data.shard == bot.client.shard.id){
                   bot.client.shard.send({
                       type: "dataCallback",
                       payload: {
                           callbackID:  message.payload.callbackID,
                           data: {count: bot.client.guilds.size}
                       }
                   });
               }else if(message.payload.name === "guilds" && message.payload.data.shard == bot.client.shard.id){
                   bot.client.shard.send({
                       type: "dataCallback",
                       payload: {
                           callbackID:  message.payload.callbackID,
                           data: bot.client.guilds.array()
                       }
                   });
               }
           }else if(message.type === "cockup"){
               for(let i = 0; i < bot.admins.length; i++) {
                   let admin = bot.admins[i];
                   if (bot.client.users.has(admin)) {
                       bot.logger.log("Sending cockup message");
                       let adminUser = bot.client.users.get(admin);
                       const output = `:warning: <@${admin}> **Cockup: ${message.payload}**`;
                       if (adminUser.lastMessage) {
                           adminUser.lastMessage.channel.send(output);
                       }
                       let dm = await adminUser.createDM();
                       dm.send(output);
                   }
               }
           }else if(message.type === "presence"){
               bot.presenceMessage = message.payload === "clear" ? null : message.payload;
               const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
               bot.client.user.setPresence({
                   game: {
                       name: `${bot.presenceMessage && bot.presenceMessage + " | "} ${serverCount} servers.`,
                       type: "LISTENING"
                   }
               });
           }else if(message.type === "getUserInfo"){
               let userID = message.payload;
               if(bot.client.users.has(userID)){
                    let user =  bot.client.users.get(userID);
                    bot.client.shard.send({type: "getUserInfoResponse", payload: {
                        id: user.id,
                        username: user.username,
                        discriminator: user.discriminator
                    }});
               }
           }
        });


        bot.logger.log("Logging in to Discord...");
        bot.client.login();

    }
};