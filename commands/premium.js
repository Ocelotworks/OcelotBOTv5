/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 19/02/2019
 * ╚════ ║   (ocelotbotv5) premium
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Ocelot Premium",
    usage: "premium",
    commands: ["premium", "support", "donate", "patreon"],
    rateLimit: 1,
    categories: ["meta"],
    init: function(bot){
        bot.client.on("ready", function startPremiumListener(){
           if(bot.client.guilds.has("322032568558026753")){
               bot.logger.log("Listening for premium changes on this shard");
               bot.client.on("guildMemberUpdate", async function guildMemberUpdate(oldMember, newMember){
                    if(oldMember.guild.id !== "322032568558026753")return;
                    if(!newMember.hoistRole)return;
                    if(oldMember.hoistRole && oldMember.hoistRole.name === newMember.hoistRole.name)return;
                    if(oldMember.hoistRole && oldMember.hoistRole.name === "Premium" && (!newMember.hoistRole || newMember.hoistRole.name !== "Premium")){
                        console.log(`${oldMember} is no longer premium`);
                    }else if(newMember.hoistRole && newMember.hoistRole.name === "Premium"){
                        bot.logger.log("Found new premium subscriber "+newMember);
                        let user = newMember.user;
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
- Access to the !usersettings command
- Have a shard named after you
**More perks being added all the time for no additional charge!**`);

                        await bot.database.setUserSetting(user.id, "premium", 1);
                        await bot.database.setUserSetting(user.id, "rateLimit", 400);
                        bot.client.shard.send({type: "reloadUserConfig"});
                        await bot.database.giveBadge(user.id, 52);
                        bot.client.channels.get("322032568558026753").send(`<:ocelotbot:533369578114514945> ${user} just purchased **Ocelot Premium**! <3`);
                    }else if(newMember.hoistRole && newMember.hoistRole.name === "Server Premium"){
                        bot.logger.log("Found new server premium subscriber "+newMember);
                        let user = newMember.user;
                        let dm = await user.createDM();
                        let key = await bot.database.createPremiumKey(newMember.id);
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
**Also, as you have purchased Server Premium you can share some of these benefits with a server of your choosing**
To Redeem Server Premium, run the following command in the server you choose: **!premium ${key}**
The key is unique to you and can only be used in one server, so choose wisely!`);

                        await bot.database.setUserSetting(user.id, "premium", 1);
                        await bot.database.setUserSetting(user.id, "rateLimit", 400);
                        bot.client.shard.send({type: "reloadUserConfig"});
                        await bot.database.giveBadge(user.id, 52);
                        bot.client.channels.get("322032568558026753").send(`<:ocelotbot:533369578114514945> ${user} just purchased **Ocelot Server Premium**! <3`);
                    }
               });
           }
        });
    },
    run: async function run(message, args, bot){
        if(args[1]){
            if(!message.guild.id)
                return message.replyLang("PREMIUM_DM_CHANEL", {arg: args[0]});

            if(message.getBool("serverPremium"))
                return message.replyLang("PREMIUM_ALREADY_HAS");

            let result = await bot.database.getPremiumKey(args[1]);

            if(!result[0])
                return message.replyLang("PREMIUM_INVALID", {arg: args[0]});

            let key = result[0];
            if(key.redeemed)
                return message.replyLang("PREMIUM_KEY_ALREADY_REDEEMED");

            await bot.database.redeemPremiumKey(args[1], message.guild.id);
            await bot.config.set(message.guild.id, "serverPremium", true);
            if(key.owner !== message.author.id){
                let owner = await bot.client.fetchUser(key.owner);
                bot.logger.warn("Key was redeemed by someone other than the owner.");
                if(owner){
                    let dm = await owner.createDM();
                    //KEY_REDEEMED_DM
                    dm.send(`Your Ocelot Premium key has been redeemed by **${message.author.tag}** for server **${message.guild.name}**. If you didn't authorize this, contact Big P#1843`);
                }
            }

            message.replyLang("PREMIUM_KEY_REDEEMED");
            return;
        }

        let embed = new Discord.RichEmbed();
        embed.setTitle("Premium Status");
        embed.setURL("https://ocelot.xyz/premium");
        embed.setThumbnail("https://ocelot.xyz/badge.php?id=52");
        if(message.getBool("serverPremium")) {
            embed.setDescription("**[Server Premium](https://ocelot.xyz/premium)** - You can enjoy premium commands in this server.");
            if(message.getBool("premium")) {
                embed.setColor("#378515");
                embed.addField("User Premium", "You also have premium, so you can enjoy all the benefits!");
            } else {
                embed.setColor("#c07012");
                embed.addField("Use Premium", "Enjoy extra benefits from $2 a month with user premium: https://ocelot.xyz/premium")
            }
        }else if(message.getBool("premium")){
            embed.setColor("#378515");
            embed.setDescription("**[User Premium](https://ocelot.xyz/premium)** - You have user premium, so you can enjoy the benefits anywhere!");
            embed.addField("Server Premium", "Upgrade the whole server to premium for just $5 a month at https://ocelot.xyz/premium");
            embed.addField("Got a Key?", `Redeem it with ${args[0]} \`key\``);
        }else{
            embed.setColor("#707070");
            embed.setDescription("No premium benefits. Premium starts at $2 a month: https://ocelot.xyz/premium");
            embed.addField("Got a Key?", `Redeem it with ${args[0]} \`key\``);
        }

        message.channel.send(embed);
    }
};