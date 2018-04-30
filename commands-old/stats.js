/**
 * Created by Peter on 09/06/2017.
 */
const config = require('config');
const columnify = require('columnify');
module.exports = {
    name: "Stats Command",
    usage: "stats",
    accessLevel: 0,
    commands: ["stats", "statistics", "info", "about", "privacy"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.embedLinks)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: ":warning: This command requires the permission **Embed Links**"
			});
			return;
		}
        recv.simulateTyping(channel);
        recv.getStats(async function(stats){
			recv.sendMessage({
				to: channel,
				message: "",
				embed: {
					color: 0x189F06,
					title: "OcelotBOT Version `stevie4`",
					description: `You are being served by \`ocelotbot-${bot.instance}\`\nCreated by Big P#1843. Copyright 2014-2018 [Ocelotworks](https://ocelotworks.com).\n[Click Here To Join The Support Server](https://discord.gg/7YNHpfF)`,
					fields: [
						{
							name: "Total Servers",
							value: bot.util.numberWithCommas(stats.servers),
							inline: true
						},
						{
							name: "Total Users",
							value: bot.util.numberWithCommas(stats.users),
							inline: true
						},
						{
							name: "Uptime",
							value: bot.util.prettySeconds(stats.uptime),
							inline: true
						},
						{
							name: "Message Stats",
							value: `**${bot.util.numberWithCommas(stats.messageCount)}** messages received this session. **${bot.util.numberWithCommas(stats.messagesSent)}** messages sent this session.`,
							inline: false
						},
						{
							name: "Privacy:",
							value: "The following data is collected and stored securely when you use OcelotBOT:\n**When you type a command**:\nThe full text of the message, your user, channel and server IDs, but not your username.\nWhen you use !crush or !sexysingle your avatar or server image is temporarily stored on our servers for caching purposes.\nWhen using !identify or !face the image is sent to Microsoft Cognitive Services inline with their [Terms Of Use](https://azure.microsoft.com/en-gb/support/legal/cognitive-services-terms/)"
						}
					]
				}
			});
        });
    }
};

