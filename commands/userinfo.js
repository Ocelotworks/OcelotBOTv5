module.exports = {
    name: "User Info",
    usage: "user <@User>",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["user", "userinfo"],
    run: async function(message, args, bot){
        let target = message.author;
        if(message.mentions && message.mentions.users && message.mentions.users.size > 0){
            target = message.mentions.users.first();
        }
        const now = new Date();

        let mutualGuilds;
        if(bot.client.shard){
             let guildCollection = await bot.client.shard.broadcastEval(`
                this.guilds.filter((guild)=>guild.members.has('${target.id}')).map((guild)=>guild.name);
            `);

            mutualGuilds = guildCollection.reduce((a,b)=>a.concat(b), []);
        }else{
            mutualGuilds = bot.client.guilds.filter((guild)=>guild.members.has(target.id)).map((guild)=>guild.name);
        }

        let mutualGuildsText = mutualGuilds.slice(0, 10).join(", ");
        if(mutualGuilds.length > 10)mutualGuildsText += `and ${mutualGuilds.length-10} more`;

        message.channel.send("", {
            embed: {
                color: 2437587,
                thumbnail: {
                    url: target.avatarURL
                },
                author: {
                    name: target.username+"#"+target.discriminator,
                    icon_url: target.avatarURL
                },
                fields: [
                    {
                        name: "Joined Discord",
                        value: `${target.createdAt.toDateString()}\n(${bot.util.prettySeconds((now-target.createdAt)/1000)} ago.)`,
                        inline: true
                    },
                    {
                        name: "Last Message",
                        value: target.lastMessage ? `${target.lastMessage.createdAt.toDateString()}\n(${bot.util.prettySeconds((now-target.lastMessage.createdAt)/1000) || "0 seconds"} ago.)` : "Not seen.",
                        inline: true
                    },
                    {
                        name: `Seen in ${mutualGuilds.length} server${mutualGuilds.length > 1 ? "s" : ""}:`,
                        value: `\`${mutualGuildsText}\``
                    }
                ]
            }
        })
    }
};