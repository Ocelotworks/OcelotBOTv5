/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
const columnify = require('columnify');
const Strings = require("../../util/String");
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
            output.setThumbnail(user.avatarURL())
        }else{
            output.setTitle(`Info for ${userId}`);
        }

        if(bot.banCache.user.includes(userId)){
            const banInfo = await bot.database.getBan(userId);
            output.addField("⚠ User Banned", Strings.Truncate(banInfo[0].reason || "Not specified", 1024));
        }

        if(bot.config.cache[userId]){
            output.addField("Settings Applied", Strings.Truncate(`\`\`\`yaml\n${Object.keys(bot.config.cache[userId]).map((key)=>`${key}: ${bot.config.cache[userId][key]}`).join("\n")}\n\`\`\``, 1024));
        }

        let guildCollection = (await bot.rabbit.broadcastEval(`
            this.guilds.cache.filter((guild)=>guild.members.cache.has('${userId}')).map((guild)=>\`\${guild.name} (\${guild.id})\`);
        `)).reduce((a,b)=>a.concat(b), []);
        output.addField("Seen in", guildCollection.length > 0 ? guildCollection.join(", ") : "Nowhere.");


        let lastCommands = (await bot.database.getUserCommands(userId, process.env.CUSTOM_BOT ? bot.client.user.id : null)).map((r)=>({...r, id: Strings.NumberToCommandId(BigInt(r.id))}));
        output.addField("Last 5 Commands", Strings.Truncate(`Use **${context.command} ci <id>** for more info\n\`\`\`\n${columnify(lastCommands)}\n\`\`\``, 1024));
        let buttons = [
            {type: 2, label: "View in Dashboard", style: 5, url: `https://ocelotbot.xyz/dash-beta/#/admin/user/${userId}`},
            {type: 2, label: "View in Sentry", style: 5, url: `https://sentry.io/organizations/ocelotworks/issues/?project=228107&query=is%3Aunresolved+user.id%3A${userId}&statsPeriod=14d`}
        ]
        if(lastCommands[0])
            buttons.push(bot.interactions.suggestedCommand(context, `ci ${lastCommands[0].id}`))
        return bot.util.sendButtons(context.channel, {embeds: [output]},  buttons);
    }
};

function trim(input){
    return input.substring(0,1024);
}