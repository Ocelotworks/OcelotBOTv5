/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 16/12/2018
 * ╚════ ║   (ocelotbotv5) vote
 *  ════╝
 */
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
                let channel;
                for(let i = 0; i < bot.waitingVoteChannels.length; i++){
                    channel = bot.waitingVoteChannels[i];
                    if(channel.members.has(user)){
                        bot.logger.log("Matched waiting vote channel for "+user);
                        channel.send(`Thanks for voting <@${user}>!\nI'd love it if you voted again tomorrow. <3`);
                        voteServer = channel.guild.id;
                        break;
                    }
                }
                if(voteServer || !bot.client.shard || bot.client.shard.id === 0){
                    await bot.database.addVote(user, voteServer);
                    bot.logger.log("Logging vote from "+user);
                    let count = (await bot.database.getVoteCount(user))[0]['COUNT(*)'];
                    console.log(count);
                    let badge = await bot.badges.updateBadge({id: user}, 'votes', count);
                    if(badge && channel){
                        channel.send(`You just earned the ${badge.emoji} **${badge.name}** badge for your ${bot.config.get(voteServer, "prefix")}profile`);
                    }
                }

           }
        });
    },
    run: async function(message, args, bot){
        if(args[1])return;
        message.channel.send(`Voting for OcelotBOT helps me grow and supports development.\n**You'll also get a special <:supporter_1:529308223954616322> supporter badge on your ${message.getSetting("prefix")}profile**\nClick here to vote: https://discordbots.org/bot/146293573422284800/vote`);
        bot.waitingVoteChannels.push(message.channel);
    }
};