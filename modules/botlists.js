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

            const serverCount = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);

            postCount("https://bots.ondiscord.xyz/bot-api/bots/146293573422284800/guilds", config.get("Discord.botsOnDiscordKey"), {
                guildCount: serverCount
            });

            postCount("https://discordbot.world/api/bot/146293573422284800/stats", config.get("Discord.discordBotWorldKey"), {
                guild_count: serverCount,
                shard_count: bot.client.shard.count
            });

            postCount("https://discord.boats/api/bot/146293573422284800",config.get("Discord.discordBoatsClubKey"), {
                server_count: serverCount,
            });
        });
    }
};


