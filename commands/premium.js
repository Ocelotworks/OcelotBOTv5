/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 19/02/2019
 * ╚════ ║   (ocelotbotv5) premium
 *  ════╝
 */
module.exports = {
    name: "Ocelot Premium",
    usage: "premium",
    commands: ["premium", "support", "donate"],
    rateLimit: 1,
    categories: ["meta"],
    init: function(bot){
        bot.client.on("ready", function startPremiumListener(){
           if(bot.client.guilds.has("322032568558026753")){
               bot.logger.log("Listening for premium changes on this shard");
               bot.client.on("guildMemberUpdate", async function guildMemberUpdate(oldMember, newMember){
                    if(oldMember.guild.id !== "322032568558026753")return;
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
                return message.channel.send(`:warning: You can't redeem a premium key in a DM, to learn about premium, just type ${args[0]}`);

            if(message.getBool("serverPremium"))
                return message.channel.send(":warning: This server already has premium. You must redeem the key in a server that hasn't already got premium.");

            let result = await bot.database.getPremiumKey(args[1]);

            if(!result[0])
                return message.channel.send(`:warning: Invalid premium key. To use server premium, you must get a premium key. For more info, type ${args[0]}`);

            let key = result[0];
            if(key.redeemed)
                return message.channel.send(":warning: That key has already been redeemed! You must get a new key to use it in a different server.");

            await bot.database.redeemPremiumKey(args[1], message.guild.id);
            await bot.config.set(message.guild.id, "serverPremium", true);
            if(key.owner !== message.author.id){
                let owner = await bot.client.fetchUser(key.owner);
                bot.logger.warn("Key was redeemed by someone other than the owner.");
                if(owner){
                    let dm = await owner.createDM();
                    dm.send(`Your Ocelot Premium key has been redeemed by **${message.author.tag}** for server **${message.guild.name}**. If you didn't authorize this, contact Big P#1843`);
                }
            }

            message.channel.send("Congratulations! Your Ocelot Server Premium key has been redeemed for this server. All the users of this server can now enjoy the benefits!");
            return;
        }
        message.channel.send(`**Support OcelotBOT on Patreon and get Premium features: https://www.patreon.com/ocelotbot**
Joining Premium gets you:
- A chance to have your own bot ideas implemented
- New profile badge
- Custom profile background
- Custom profile font
- Premium profile border
- Fast track support 
- Reliable uptime
- Higher ratelimit
_If you have a Server Premium key, type ${args[0]} \`key\` to redeem it in this server._`);
    }
};