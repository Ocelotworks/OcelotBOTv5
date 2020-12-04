/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 16/12/2018
 * ╚════ ║   (ocelotbotv5) vote
 *  ════╝
 */

const sources = {
    "discordbots.org": "https://top.gg/bot/146293573422284800",
    "discordbothub.com": "https://discordbothub.com/bot?id=146293573422284800",
    "discordlabs.org": "https://bots.discordlabs.org/bot/146293573422284800",
    "blist.xyz": "https://blist.xyz/bot/146293573422284800",
    "botsdatabase.com": "https://botsdatabase.com/bot/146293573422284800",
    "botsfordiscord.com": "https://botsfordiscord.com/bot/146293573422284800",
    "discord.boats": "https://discord.boats/bot/146293573422284800",
    "botlist.space": "https://botlist.space/bot/146293573422284800",
    "discordbotlist.com": "https://discordbotlist.com/bots/ocelotbot",
    "arcane-center.xyz": "https://arcane-center.xyz/bot/146293573422284800"
}

module.exports = {
    name: "Vote For OcelotBOT",
    usage: "vote",
    rateLimit: 10,
    categories: ["meta"],
    requiredPermissions: [],
    commands: ["vote"],
    init: function(bot){
        bot.waitingVoteChannels = [];


        let voteTimeouts = {};


        async function logVote(user, voteServer, channel, source){
            try {
                const userObj = await bot.client.users.fetch(user);
                let sourceUrl = sources[source];
                if(!sourceUrl){
                    bot.logger.log(`Unknown source: ${source}`);
                    sourceUrl = sources["discordbots.org"];
                }
                (await bot.client.channels.fetch("756854640204709899")).send(`:heart: **${userObj.tag}** just voted at ${sourceUrl}`)
            }catch(e){
                console.log(e);
            }

            let lastVote = await bot.database.getLastVote(user);
            if(lastVote[0])
                lastVote = lastVote[0]['MAX(timestamp)'];
            let difference = new Date()-lastVote;
            if(difference < bot.util.voteTimeout*2)
                await bot.database.incrementStreak(user, "vote");
            else
                await bot.database.resetStreak(user, "vote");

            await bot.database.addVote(user, voteServer, source);
            bot.logger.log("Logging vote from "+user);
            let count = (await bot.database.getVoteCount(user))[0]['COUNT(*)'];
            bot.badges.updateBadge({id: user}, 'votes', count, channel);

            // bot.matomo.track({
            //     action_name: "Vote",
            //     uid:  user,
            //     url: `http://bot.ocelot.xyz/vote/done`,
            //     ua: "Shard "+bot.client.shard_id,
            //     e_c: "Vote",
            //     e_a: "Voted",
            //     e_n: user,
            //     e_v: 1,
            //     cvar: JSON.stringify({
            //         1: ['Server ID', voteServer],
            //         2: ['Server Name',bot.client.guilds.cache.has(voteServer) ? bot.client.guilds.cache.get(voteServer).name : "Unknown"],
            //         3: ['Message', ""],
            //         4: ['Channel Name', channel ? channel.id : "0"],
            //         5: ['Channel ID', channel ? channel.name : "Unknown"]
            //     })
            // });

        }

        process.on("message", async function vote(message){
           if(message.type === "registerVote"){
                let user = message.payload.user;
                let source = message.payload.source;
                let voteServer = null;
                let channel = null;
                for(let i = 0; i < bot.waitingVoteChannels.length; i++){
                    if(bot.waitingVoteChannels[i].members && bot.waitingVoteChannels[i].members.has(user)){
                        channel = bot.waitingVoteChannels[i];
                        bot.logger.log("Matched waiting vote channel for "+user);
                        const streak = await bot.database.getStreak(user, "vote");
                        if(streak > 1)
                            channel.sendLang("VOTE_MESSAGE_STREAK", {user, streak});
                        else
                            channel.sendLang("VOTE_MESSAGE", {user});
                        bot.waitingVoteChannels.splice(i, 1);
                        voteServer = channel.guild.id;
                        break;
                    }
                }
                if(voteServer || !bot.client.shard || bot.client.shard.ids.join(";") == 0){
                    if(bot.client.shard && bot.client.shard.ids.join(";") == 0){
                        voteTimeouts[user] = setTimeout(logVote, 5000, user, voteServer, channel, source);
                    }else{
                        logVote(user, voteServer, channel, source);
                        if(bot.client.shard)
                            bot.client.shard.send({type: "clearVoteTimeout", payload: user});
                    }
                }

           }else if(message.type === "clearVoteTimeout"){
               clearTimeout(voteTimeouts[message.payload]);
           }
        });



    },
    run: async function(message, args, bot){
        if(args[1])return;
        let lastVote = await bot.database.getLastVote(message.author.id);
        if(lastVote[0])
            lastVote = lastVote[0]['MAX(timestamp)'];
        let difference = new Date()-lastVote;

        if(difference < bot.util.voteTimeout){
            message.replyLang("VOTE_TIMEOUT", {time: bot.util.prettySeconds((bot.util.voteTimeout-difference)/1000, message.guild && message.guild.id, message.author.id)});
        }else {
            message.replyLang("VOTE");
        }
        bot.waitingVoteChannels.unshift(message.channel);
    }
};