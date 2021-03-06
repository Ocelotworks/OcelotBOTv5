/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
const columnify = require('columnify');
module.exports = {
    name: "User Info",
    usage: "user :user",
    commands: ["user", "userinfo", "ui"],
    run: async function (context, bot) {
        const userId = context.options.user;
        await context.defer();
        let user = await bot.util.getUserInfo(userId);
        let output = new Discord.MessageEmbed();

        output.setAuthor(context.user.tag, context.user.avatarURL())

        if(user){
            output.setTitle(`Info for ${user.tag} (${userId})`);
            output.setImage(user.avatarURL())
        }else{
            output.setTitle(`Info for ${userId}`);
        }

        if(bot.banCache.user.includes(userId)){
            const banInfo = await bot.database.getBan(userId);
            output.addField("⚠ User Banned", trim(banInfo[0].reason || "Not specified"));
        }

        if(bot.config.cache[userId]){
            output.addField("Settings Applied", trim(`\`\`\`\n${Object.keys(bot.config.cache[userId]).map((key)=>`${key}: ${bot.config.cache[userId][key]}`).join("\n")}\n\`\`\``));
        }

        let guildCollection = (await bot.rabbit.broadcastEval(`
            this.guilds.cache.filter((guild)=>guild.members.cache.has('${userId}')).map((guild)=>\`\${guild.name} (\${guild.id})\`);
        `)).reduce((a,b)=>a.concat(b), []);
        output.addField("Seen in", guildCollection.length > 0 ? guildCollection.join(", ") : "Nowhere.");


        let lastCommands = await bot.database.getUserCommands(userId, process.env.CUSTOM_BOT ? bot.client.user.id : null);
        output.addField("Last 5 Commands", trim(`Use **${context.command} ci <id>** for more info\n\`\`\`\n${columnify(lastCommands)}\n\`\`\``))
        return bot.util.sendButtons(context.channel, {embeds: [output]},  [
            {type: 2, label: "View in Dashboard", style: 5, url: `https://ocelotbot.xyz/dash-beta/#/admin/user/${userId}`},
            bot.interactions.suggestedCommand(context, `ci ${lastCommands[0].id}`),
        ])
    }
};

function trim(input){
    return input.substring(0,1024);
}