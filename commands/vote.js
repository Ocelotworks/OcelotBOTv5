/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 16/12/2018
 * ╚════ ║   (ocelotbotv5) vote
 *  ════╝
 */

const timeout = 43200000;

module.exports = {
    name: "Vote For OcelotBOT",
    usage: "vote",
    rateLimit: 10,
    categories: ["meta"],
    requiredPermissions: [],
    commands: ["vote"],
    init: function(bot){
        bot.waitingVoteChannels = [];

        process.on("message", async function vote(message){
           if(message.type === "registerVote"){
                let user = message.payload.user;
                let voteServer = null;
                let channel = null;
                for(let i = 0; i < bot.waitingVoteChannels.length; i++){
                    if(bot.waitingVoteChannels[i].members.has(user)){
                        channel = bot.waitingVoteChannels[i];
                        bot.logger.log("Matched waiting vote channel for "+user);
                        channel.sendLang("VOTE_MESSAGE", {user});
                        voteServer = channel.guild.id;
                        break;
                    }
                }
                if(voteServer || !bot.client.shard || bot.client.shard.id === 0){
                    await bot.database.addVote(user, voteServer);
                    bot.logger.log("Logging vote from "+user);
                    let count = (await bot.database.getVoteCount(user))[0]['COUNT(*)'];
                    console.log(count);
                    bot.badges.updateBadge({id: user}, 'votes', count, channel);
                }

           }
        });
    },
    run: async function(message, args, bot){
        if(args[1])return;
        let lastVote = await bot.database.getLastVote(message.author.id);
        if(lastVote[0])
            lastVote = lastVote[0]['MAX(timestamp)'];
        let difference = new Date()-lastVote;

        if(difference < timeout){
            message.replyLang("VOTE_TIMEOUT", {time: bot.util.prettySeconds((timeout-difference)/1000)});
        }else {
            message.replyLang("VOTE");
        }
        bot.waitingVoteChannels.unshift(message.channel);
    }
};