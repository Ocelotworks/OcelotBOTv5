/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) leaves
 *  ════╝
 */
const Strings = require("../util/String");
module.exports = {
    name: "Server Leaves",
    id: "leaves",
    help: `Sends a message any time a user leaves the server.
    By default the message is "{{username}} has left." You can enter your own message using these template variables:
    {{username}} - the user's username, no mention
    {{server}} - the name of the server
    {{userCount}} - the number of users in the server"`,
    alias: ["serverleaves"],
    validate: function(data, context){
        if(!data)data = "{{username}} has left.";
        const fakeMessage = Strings.Format(data, {
            username: context.user?.username,
            server: context.guild.name,
            userCount: context.guild.memberCount
        })
        return {
            data,
            success: `Your message will look like this:\n> ${fakeMessage}`
        };
    },
    added: function added(sub, bot){
        let message = sub.data ? sub.data : "{{username}} has left.";
        let channel = bot.client.channels.cache.get(sub.channel);
        bot.client.on("guildMemberRemove", function(guildMember) {
            if(guildMember.guild.id === sub.server){
                if(bot.drain)return;
                channel.send(Strings.Format(message, {
                    user: guildMember.user,
                    username: guildMember.user.username,
                    server: guildMember.guild.name,
                    userCount: guildMember.guild.memberCount
                }))
            }
        });
    }
};
