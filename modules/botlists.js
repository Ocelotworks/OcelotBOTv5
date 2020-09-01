/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 18/01/2019
 * ╚════ ║   (ocelotbotv5) botlists
 *  ════╝
 */
const config = require('config');
const request = require('request');

module.exports = {
    name: "Bot List Management",
    enabled: true,
    init: function init(bot) {
        bot.client.on("guildCreate", async function(){
            if(bot.client.user.id !== "146293573422284800")return;

            function handleResponse(url){
                return function(err, resp, body) {
                    if (err) return bot.raven.captureException(err);
                    if (resp.statusCode >= 400) {
                        bot.logger.warn(`Got bad response from ${url} (${resp.statusCode})`);
                        bot.logger.warn(body);
                    }
                }
            }

            function postCount(url, key, body){
                request.post({
                    headers: {
                        "Authorization": key,
                        "Content-Type": "application/json"
                    },
                    url: url,
                    json: true,
                    body: body
                }, handleResponse(url));
            }

            postCount("https://top.gg/api/bots/146293573422284800/stats", config.get("Discord.discordBotsOrgKey"), {
                server_count: bot.client.guilds.size,
                shard_id: bot.client.shard.id,
                shard_count: bot.client.shard.count
            });

            postCount("https://discord.bots.gg/api/v1/bots/146293573422284800/stats", config.get("Discord.discordBotsKey"), {
                guildCount: bot.client.guilds.size,
                shardCount: bot.client.shard.count,
                shardId: bot.client.shard.id,
            });

            const voiceConnections = bot.lavaqueue && bot.lavaqueue.manager && bot.lavaqueue.manager.nodes[0] ? bot.lavaqueue.manager.nodes[0].stats.players : 0;

            postCount("https://discordbotlist.com/api/v1/bots/146293573422284800/stats", config.get("Discord.discordBotListKey"), {
                voice_connections: voiceConnections,
                users: bot.client.users.size,
                guilds: bot.client.guilds.size,
                shard_id: bot.client.shard.id,
            });

            const serverCount = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);

            postCount("https://bots.ondiscord.xyz/bot-api/bots/146293573422284800/guilds", config.get("Discord.botsOnDiscordKey"), {
                guildCount: serverCount
            });

            postCount("https://discordbot.world/api/bot/146293573422284800/stats", config.get("Discord.discordBotWorldKey"), {
                guild_count: serverCount,
                shard_count: bot.client.shard.count
            });

            postCount("https://blist.xyz/api/bot/146293573422284800/stats/", config.get("Discord.blistKey"), {
                server_count: serverCount,
                shard_count: bot.client.shard.count
            });

            postCount("https://bots.discordlabs.org/v2/bot/146293573422284800/stats", config.get("Discord.discordBotLabsKey"), {
                server_count: serverCount,
                shard_count: bot.client.shard.count,
                token: config.get("Discord.discordBotLabsKey"),
            });

            postCount("https://arcane-botcenter.xyz/api/146293573422284800/stats",config.get("Discord.arcaneBotsKey"), {
                server_count: serverCount,
                shard_count: bot.client.shard.count
            });

            postCount("https://discord.boats/api/bot/146293573422284800",config.get("Discord.discordBoatsClubKey"), {
                server_count: serverCount,
            });

            postCount("https://disforge.com/api/botstats/146293573422284800",config.get("Discord.disforgeKey"), {
                servers: serverCount,
            });

            postCount("https://api.botsdatabase.com/v1/bots/146293573422284800",config.get("Discord.botsDatabaseKey"), {
                servers: serverCount,
            });

            postCount("https://discordapps.dev/api/v2/bots/146293573422284800",config.get("Discord.discordAppsKey"), {
                bot: {
                    count: serverCount,
                },
            });
        });
    }
};


