/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
const columnify = require('columnify');
module.exports = {
    name: "Server Info",
    usage: "server :server",
    commands: ["server", "serverinfo", "si", "guild", "guildinfo", "gi"],
    noCustom: true,
    run: async function (context, bot) {
        const serverId = context.options.server;
        await context.defer();
        let guild = await bot.util.getInfo(bot, "guilds", serverId);
        let output = new Discord.MessageEmbed();

        output.setAuthor(context.user.tag, context.user.avatarURL())

        if(guild){
            output.setTitle(`Info for ${guild.name} (${serverId})`);
            output.setThumbnail(guild.iconURL())
        }else{
            output.setTitle(`Info for ${serverId}`);
        }

        if(bot.banCache.server.includes(serverId)){
            const banInfo = await bot.database.getBan(serverId);
            output.addField("⚠ Guild Banned", `${banInfo[0].reason}`);
        }

        if(bot.config.cache[serverId]){
            output.addField("Settings Applied", `\`\`\`\n${Object.keys(bot.config.cache[serverId]).map((key)=>`${key}: ${bot.config.cache[serverId][key]}`).join("\n")}\n\`\`\``);
        }

        if(!process.env.CUSTOM_BOT) {
            const [joinedServer, leftServer] = await Promise.all([
                bot.database.getServer(serverId),
                bot.database.getLeftServer(serverId),
            ]);

            if (joinedServer[0]) {
                if(joinedServer[0].owner) {
                    const owner = await bot.util.getUserInfo(joinedServer[0].owner);
                    output.addField("Owner", owner ? `${owner.tag} (${owner.id})` : joinedServer[0].owner);
                }
                output.addField("First Joined", joinedServer[0].timestamp.toLocaleString(), true);
            } else {
                output.addField("‼ Error", "Server is not in servers table!",);
            }

            if (leftServer[0]) {
                output.addField("ℹ Left On", leftServer.map((l) => l.timestamp.toLocaleString()).join("\n"), true);
            }
        }


        let lastCommands = await bot.database.getServerCommands(serverId, process.env.CUSTOM_BOT ? bot.client.user.id : null);
        output.addField("Last 5 Commands", `Use **${context.command} ci <id>** for more info\n\`\`\`\n${columnify(lastCommands)}\n\`\`\``)
        let components = [];
        if(lastCommands[0])
            components.push(bot.util.actionRow(bot.interactions.suggestedCommand(context, `ci ${lastCommands[0].id}`)));
        return context.send({embeds: [output], components});
    }
};