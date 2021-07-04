module.exports = {
    name: "User Info",
    usage: "user :@user?",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["user", "userinfo"],
    categories: ["tools"],
    guildOnly: true,
    run: async function(context, bot){
        let target = context.user;
        let targetMember = context.member;
        if(context.options.user && context.channel.members.has(context.options.user)){
            targetMember = context.channel.members.get(context.options.user);
            target = targetMember.user;
        }
        const now = new Date();

        let mutualGuilds;

         let guildCollection = await bot.rabbit.broadcastEval(`
            this.guilds.cache.filter((guild)=>guild.members.cache.has('${target.id}') && !this.bot.config.getBool(guild.id, "privacy.serverAnonymous")).map((guild)=>guild.name);
        `);

        mutualGuilds = guildCollection.reduce((a,b)=>a.concat(b), []);


        let mutualGuildsText = mutualGuilds.slice(0, 10).join(", ");
        if(mutualGuilds.length > 10)mutualGuildsText += ` and ${mutualGuilds.length-10} more`;


        let fields = [
            {
                name: "Joined Discord",
                value: `${target.createdAt.toDateString()}\n(${bot.util.prettySeconds((now-target.createdAt)/1000, context.guild?.id, context.user.id)} ago.)`,
                inline: true
            },
        ];

        if(targetMember){
            fields.push({
                name: "Joined Guild",
                    value: `${targetMember.joinedAt.toDateString()}\n(${bot.util.prettySeconds((now-targetMember.joinedAt)/1000, context.guild?.id, context.user.id)} ago.)`,
                inline: true
            });
        }

        if(target.lastMessage){
            const ago = (now-target.lastMessage.createdAt)/1000;
            fields.push({
                name: "Last Message",
                inline: true,
                value: `${target.lastMessage.createdAt.toDateString()}\n(${ago > 0 ? bot.util.prettySeconds(ago, context.guild?.id, context.user.id) : "Just Now."})`
            });
        }


        if(target.premiumSince){
            const ago = (now-target.premiumSince/1000);
            fields.push({
                name: "Nitro Booster",
                inline: true,
                value: `${target.lastMessage.createdAt.toDateString()}\n(${ago > 0 ? bot.util.prettySeconds(ago, context.guild?.id, context.user.id) : "Just Now."})`
            });
        }


        if(mutualGuilds.length === 0){
            fields.push({
                name: `Seen in 0 servers:`,
                inline: false,
                value: `:spider_web:`,
            });
        }else {
            fields.push({
                name: `Seen in ${mutualGuilds.length} server${mutualGuilds.length > 1 ? "s" : ""}:`,
                inline: false,
                value: `\`${mutualGuildsText}\``,
            });
        }

        return context.send("", {
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