/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) leaves
 *  ════╝
 */
module.exports = {
    name: "Server Leaves",
    id: "leaves",
    alias: ["serverleaves"],
    validate: function(data){
        return {data};
    },
    added: function added(sub, bot){
        let message = sub.data ? sub.data : "{{username}} has left.";
        let channel = bot.client.channels.cache.get(sub.channel);
        bot.client.on("guildMemberRemove", function(guildMember) {
            if(guildMember.guild.id === sub.server){
                channel.send(message.formatUnicorn({
                    user: guildMember.user,
                    username: guildMember.user.username,
                    server: guildMember.guild.name,
                    userCount: guildMember.guild.members.size
                }));
            }
        });
    }
};
