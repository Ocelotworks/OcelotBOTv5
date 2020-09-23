module.exports = {
    name: "User Info",
    usage: "user <@User>",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["user", "userinfo"],
    categories: ["tools"],
    run: async function(message, args, bot){
        let target = message.author;
        let targetMember = message.member;
        if(message.mentions && message.mentions.users && message.mentions.users.size > 0){
            target = message.mentions.users.first();
            targetMember = message.mentions.members.first();
        }else if(args[1] && bot.client.users.cache.has(args[1])){
            target = bot.client.users.cache.get(args[1]);
            targetMember = message.guild.members.cache.get(args[1]) || null;
        }
        const now = new Date();

        let mutualGuilds;
        if(bot.client.shard){
             let guildCollection = await bot.client.shard.broadcastEval(`
                this.guilds.cache.filter((guild)=>guild.members.cache.has('${target.id}')).map((guild)=>guild.name);
            `);

            mutualGuilds = guildCollection.reduce((a,b)=>a.concat(b), []);
        }else{
            mutualGuilds = bot.client.guilds.cache.filter((guild)=>guild.members.cache.has(target.id)).map((guild)=>guild.name);
        }

        let mutualGuildsText = mutualGuilds.slice(0, 10).join(", ");
        if(mutualGuilds.length > 10)mutualGuildsText += ` and ${mutualGuilds.length-10} more`;



        let fields = [
            {
                name: "Joined Discord",
                value: `${target.createdAt.toDateString()}\n(${bot.util.prettySeconds((now-target.createdAt)/1000)} ago.)`,
                inline: true
            },
        ];

        if(targetMember){
            fields.push({
                name: "Joined Guild",
                    value: `${targetMember.joinedAt.toDateString()}\n(${bot.util.prettySeconds((now-targetMember.joinedAt)/1000)} ago.)`,
                inline: true
            });
        }

        if(target.lastMessage){
            const ago = (now-target.lastMessage.createdAt)/1000;
            fields.push({
                name: "Last Message",
                inline: true,
                value: `${target.lastMessage.createdAt.toDateString()}\n(${ago > 0 ? bot.util.prettySeconds(ago) : "Just Now."})`
            });
        }


        if(target.premiumSince){
            const ago = (now-target.premiumSince/1000);
            fields.push({
                name: "Nitro Booster",
                inline: true,
                value: `${target.lastMessage.createdAt.toDateString()}\n(${ago > 0 ? bot.util.prettySeconds(ago) : "Just Now."})`
            });
        }


        fields.push({
            name: `Seen in ${mutualGuilds.length} server${mutualGuilds.length > 1 ? "s" : ""}:`,
            value: `\`${mutualGuildsText}\``
        });

        message.channel.send("", {
            embed: {
                color: 2437587,
                thumbnail: {
                    url: target.avatarURL({dynamic: true})
                },
                author: {
                    name: target.username+"#"+target.discriminator,
                    icon_url: target.avatarURL({dynamic: true})
                },
                fields: fields
            }
        })
    }
};