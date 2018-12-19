const Discord = require('discord.js');
const request = require('request');
const config = require('config');
const fs = require('fs');
module.exports = {
    name: "Discord.js Integration",
    init: function(bot){

        Discord.Message.prototype.replyLang = async function(message, values){
            return this.channel.send(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values));
        };

        Discord.TextChannel.prototype.sendLang = async function(message, values){
            return this.send(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values));
        };

        Discord.Message.prototype.editLang = async function(message, values){
            return this.edit(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values));
        };

        Discord.Guild.prototype.getSetting = function(setting){
            return bot.config.get(this.id, setting);
        };

        Discord.Message.prototype.getSetting = function(setting){
            if(this.guild)
                return bot.config.get(this.guild.id, setting);
            return bot.config.get("global", setting);
        };

        const oldsend = Discord.TextChannel.prototype.send;
        Discord.TextChannel.prototype.send = function send(content, options){
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
            return oldsend.apply(this, [content, options]);
        };

        bot.presenceMessage = "";


        bot.client = new Discord.Client();

        bot.client.on("ready", async function discordReady(){
            bot.logger.log(`Logged in as ${bot.client.user.tag}`);
            bot.raven.captureBreadcrumb({
                message: "ready",
                category:  "discord",
            });

            setTimeout(async function(){
                const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
                bot.client.user.setPresence({
                    game: {
                        name: `${serverCount} servers.`,
                        type: "LISTENING"
                    }
                });
            }, 10000);


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
                 request.post({
                     headers: {
                         "Authorization": config.get("Discord.discordBotsKey"),
                         "Content-Type": "application/json"
                     },
                     url: "https://bots.discord.pw/api/bots/146293573422284800/stats",
                     json: true,
                     body: {
                         server_count: bot.client.guilds.size,
                         shard_id: bot.client.shard.id,
                         shard_count: bot.client.shard.count
                     }
                 }, function (err, resp, body) {
                     if(err)bot.raven.captureException(err);
                 });
                 request.post({
                     headers: {
                         "Authorization": config.get("Discord.discordBotsOrgKey"),
                         "Content-Type": "application/json"
                     },
                     url: "https://discordbots.org/api/bots/146293573422284800/stats",
                     json: true,
                     body: {
                         server_count: bot.client.guilds.size,
                         shard_id: bot.client.shard.id,
                         shard_count: bot.client.shard.count
                     }
                 }, function (err, resp, body) {
                     if(err)bot.raven.captureException(err);
                 });

                 if((new Date()).getMonth() >= 10) {
                     const serverCount = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
                     bot.client.user.setPresence({
                         game: {
                             name: `${bot.presenceMessage && bot.presenceMessage + " | "} ${serverCount} servers.`,
                             type: "LISTENING"
                         }
                     });
                 }
             }
             try {
                 let lang = "en-gb";
                 if(guild.region.startsWith("us"))
                     lang = "en-us";
                 await bot.database.addServer(guild.id, guild.owner_id, guild.name, guild.joined_at, lang);
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
        });

        bot.client.on("error", function websocketError(evt){
            bot.logger.log("Websocket Error "+evt.message);
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

        process.on("message", async function(message){
           if(message.type === "requestData"){
               if(message.payload.name === "channels"){
                   console.log("Looking for channel data");
                   let guild = message.payload.data.server;
                   if(bot.client.guilds.has(guild)){
                       let callbackID = message.payload.callbackID;
                       let channels = bot.client.guilds.get(guild).channels.map(function(channel){
                           return {name: channel.name, id: channel.id}
                       });
                       console.log("got channel data");
                       bot.client.shard.send({
                           type: "dataCallback",
                           payload: {
                               callbackID: callbackID,
                               data: channels
                           }
                       })
                   }
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
           }
        });


        bot.logger.log("Logging in to Discord...");
        bot.client.login();

    }
};