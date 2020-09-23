/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) joins
 *  ════╝
 */
module.exports = {
    name: "Server Joins",
    id: "joins",
    alias: ["serverjoins"],
    validate: function(input){
        return null;
    },
    added: function added(sub, bot){
        let message = sub.data ? sub.data : "{{user}}, welcome to {{server}}.";
        let channel = bot.client.channels.cache.get(sub.channel);
        bot.client.on("guildMemberAdd", function(guildMember) {
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
