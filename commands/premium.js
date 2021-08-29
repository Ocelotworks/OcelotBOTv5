/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 19/02/2019
 * ╚════ ║   (ocelotbotv5) premium
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Ocelot Premium",
    usage: "premium :key?",
    commands: ["premium", "donate", "patreon"],
    rateLimit: 1,
    categories: ["meta"],
    init: function(bot){
        bot.addCommandMiddleware(async (context)=>{
            if (context.getBool("points.enabled"))return true;
            if (context.commandData.vote && context.getBool("voteRestrictions") && !(context.getBool("premium") || context.getBool("serverPremium"))) {
                if (context.getSetting("restrictionType") === "vote") {
                    let lastVote = await bot.database.getLastVote(context.user.id);
                    if (lastVote[0])
                        lastVote = lastVote[0]['MAX(timestamp)'];
                    let difference = new Date() - lastVote;
                    console.log("difference is " + difference);
                    if (difference > bot.util.voteTimeout * 2) {
                        context.replyLang({content: "COMMAND_VOTE_REQUIRED", ephemeral: true})
                        return false;
                    }
                } else {
                    // This is dumb, but I can't avoid this
                    try {
                        await (await bot.client.guilds.fetch("322032568558026753")).members.fetch(context.user.id)
                    } catch (e) {
                        context.reply({content: "You must join the support server or purchase premium to enable this command. You can join the support server here: https://discord.gg/PTaXZmE", ephemeral: true})
                        return false;
                    }
                }
            }

            if (context.commandData.premium && !(context.getBool("premium") || context.getBool("serverPremium"))) {
                context.reply({
                    content: `:warning: This command requires **<:ocelotbot:533369578114514945> OcelotBOT Premium**\n_To learn more about premium, type ${context.getSetting("prefix")}premium_\nAlternatively, you can disable this command using ${context.getSetting("prefix")}settings disableCommand ${context.command}`,
                    ephemeral: true
                });
                return false;
            }
            return true;
        });
    },
    run: async function run(context, bot){
        if(context.options.key){
            if(!context.guild.id)
                return context.sendLang("PREMIUM_DM_CHANNEL", {arg: context.command});

            if(context.options.key.toLowerCase() === "redeem"){
                if(bot.config.getBool("global", "premium", context.user.id)) {
                    context.message?.delete();
                    let dm = await context.user.createDM();
                    return dm.send("You already have premium. If you have changed your premium plan, please contact Big P#1843");
                }else if(context.channel.id === context.getSetting("premium.redeemChannel")){
                    context.message?.delete();
                    return redeemPremium(bot, context.user);
                }else if(context.channel.id === context.getSetting("premium.server.redeemChannel")){
                    context.message?.delete();
                    return redeemServerPremium(bot, context.user);
                }
                return context.send({content: "This command can only be used in the specific support server channels for your premium type. If you have purchased premium, please use them there.", ephemeral: true})
            }

            if(context.getBool("serverPremium"))
                return context.sendLang("PREMIUM_ALREADY_HAS");

            let result = await bot.database.getPremiumKey(context.options.key);

            if(!result[0])
                return context.sendLang("PREMIUM_INVALID", {arg: context.command});

            let key = result[0];
            if(key.redeemed)
                return context.sendLang("PREMIUM_KEY_ALREADY_REDEEMED");

            await bot.database.redeemPremiumKey(context.options.key, context.guild.id);
            await bot.config.set(context.guild.id, "serverPremium", true);
            if(key.owner !== context.user.id){
                let owner = await bot.client.users.fetch(key.owner);
                bot.logger.warn("Key was redeemed by someone other than the owner.");
                if(owner){
                    let dm = await owner.createDM();
                    //KEY_REDEEMED_DM
                    dm.send(`Your Ocelot Premium key has been redeemed by **${await bot.util.getUserTag(context.user.id)}** for server **${context.guild.name}**. If you didn't authorize this, contact Big P#1843`);
                }
            }
            return context.sendLang("PREMIUM_KEY_REDEEMED");
        }

        let embed = new Discord.MessageEmbed();
        embed.setTitle("Premium Status");
        embed.setURL("https://ocelotbot.xyz/premium");
        embed.setThumbnail("https://ocelotbot.xyz/badge.php?id=52");
        if(context.getBool("serverPremium")) {
            embed.setDescription("**[Server Premium](https://ocelotbot.xyz/premium)** - You can enjoy premium commands in this server.");
            if(context.getBool("premium")) {
                embed.setColor("#378515");
                embed.addField("User Premium", "You also have premium, so you can enjoy all the benefits!");
            } else {
                embed.setColor("#c07012");
                embed.addField("User Premium", "Enjoy extra benefits from $2 a month with user premium: https://ocelotbot.xyz/premium")
            }
        }else if(context.getBool("premium")){
            embed.setColor("#378515");
            embed.setDescription("**[User Premium](https://ocelotbot.xyz/premium)** - You have user premium, so you can enjoy the benefits anywhere!");
            embed.addField("Server Premium", "Upgrade the whole server to premium for just $5 a month at https://ocelotbot.xyz/premium");
            embed.addField("Got a Key?", `Redeem it with ${context.command} \`key\``);
        }else{
            embed.setColor("#707070");
            embed.setDescription("No premium benefits. Premium starts at $2 a month: https://ocelotbot.xyz/premium");
            embed.addField("Got a Key?", `Redeem it with ${context.command} \`key\``);
        }
        return context.send({embeds: [embed]});
    }
};


async function redeemPremium(bot, user){
    let dm = await user.createDM();
    dm.send(`:hearts: Thank you for purchasing **Ocelot Premium**!
You now have access to the following features:
- <:premium:547494108160196624> New profile badge
- Custom profile background
- Custom profile font
- Premium profile border
- Fast track support 
- Reliable uptime
- Higher ratelimit
- No voting required
- Access to the !usersettings command
- Have a shard named after you
**More perks being added all the time for no additional charge!**`);

    await bot.database.setUserSetting(user.id, "premium", 1);
    await bot.database.setUserSetting(user.id, "rateLimit", 400);
    bot.rabbit.event({type: "reloadUserConfig"});
    await bot.database.giveBadge(user.id, 52);
}

async function redeemServerPremium(bot, user){
    let dm = await user.createDM();
    let key = await bot.database.createPremiumKey(user.id);
    dm.send(`:hearts: Thank you for purchasing **Ocelot Server Premium**!
You now have access to the following features:
- <:premium:547494108160196624> New profile badge
- Custom profile background
- Custom profile font
- Premium profile border
- Fast track support 
- Reliable uptime
- Higher ratelimit
- Access to the !usersettings command
- Have a shard named after you
- No voting required
- Custom Commands and Autoresponders
**Also, as you have purchased Server Premium you can share some of these benefits with a server of your choosing**
To Redeem Server Premium, run the following command in the server you choose: **!premium ${key}**
The key is unique to you and can only be used in one server, so choose wisely!`);

    await bot.database.setUserSetting(user.id, "premium", 1);
    await bot.database.setUserSetting(user.id, "rateLimit", 400);
    bot.rabbit.event({type: "reloadUserConfig"});
    await bot.database.giveBadge(user.id, 52);
}