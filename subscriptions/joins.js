/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) joins
 *  ════╝
 */
const Strings = require("../util/String");
module.exports = {
    name: "Server Joins",
    id: "joins",
    help: `Sends a message any time a user joins the server.
    By default the message is "{{user}}, welcome to {{server}}." You can enter your own message using these template variables:
    {{user}} - mentions the user that has joined
    {{username}} - the user's username, no mention
    {{server}} - the name of the server
    {{userCount}} - the number of users in the server"`,
    alias: ["serverjoins"],
    validate: function(data, context){
        if(!data)data = "{{user}}, welcome to {{server}}.";
        const fakeMessage = Strings.Format(data, {
            user: context.user,
            username: context.user.username,
            server: context.guild.name,
            userCount: context.guild.memberCount
        })
        return {
            data,
            success: `Your message will look like this:\n> ${fakeMessage}`
        };
    },
    added: async function added(sub, bot){
        let message = sub.data ? sub.data : "{{user}}, welcome to {{server}}.";
        let channel = await bot.client.channels.fetch(sub.channel);
        bot.client.on("guildMemberAdd", function(guildMember) {
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
