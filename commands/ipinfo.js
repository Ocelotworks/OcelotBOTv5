/**
 * Created by Peter on 01/07/2017.
 */
const config = require('config');
const Sentry = require('@sentry/node');
const Discord = require('discord.js');

module.exports = {
    name: "IP Info",
    usage: "ipinfo :ip",
    categories: ["tools"],
    detailedHelp: "Get information about an IP address",
    usageExample: "ipinfo 8.8.8.8",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["ipinfo", "ip"],
    handleError: function(context){
        return context.sendLang("IPINFO_NO_IP");
    },
    run: async function run(context, bot) {
        try {
            let abuseIp = await bot.util.getJson(`https://api.abuseipdb.com/api/v2/check?ipAddress=${context.options.ip}&days=31`, null, {
                Key: config.get("API.abuseipdb.key"),
                Accept: 'application/json'
            });
            if (abuseIp && abuseIp.data) {
                const data = abuseIp.data;
                if(!data.isPublic)
                    return context.sendLang({content: "IPINFO_PRIVATE", ephemeral: true});

                let embed = new Discord.MessageEmbed();
                embed.setTitle(data.ipAddress);
                embed.setDescription(data.isp);
                if(data.domain)
                    embed.addField("Domain", data.domain, true);
                embed.addField("Country", data.countryName || data.countryCode || "None", true);
                embed.addField("Abuse Score", data.abuseConfidenceScore+"%", true);
                embed.addField("Reports", `${data.totalReports} from ${data.numDistinctUsers} users.`, true)
                console.log(data);
                if(data.abuseConfidenceScore > 80)
                    embed.setColor("#ff0000");
                else if(data.abuseConfidenceScore > 50)
                    embed.setColor("#d0cb00");
                else
                    embed.setColor("#00ff00");

                if(data.hostnames && data.hostnames.length > 0){
                    embed.addField("Hostnames", data.hostnames?.join("\n"));
                }
                context.send({embeds: [embed]});
            }else{
                return context.sendLang("IPINFO_INVALID_IP");
            }
        }catch(e){
            Sentry.captureException(e);
        }
        if(!context.getSetting("ipinfo.disableTorrents")) {
            let torrentData = await bot.util.getJson(`https://api.antitor.com/history/peer?ip=${context.options.ip}&key=${config.get("API.antitor.key")}&days=30`);
            let output = "";
            if (torrentData.hasPorno) {
                output += (await context.getLang("IPINFO_PORN"))+"\n";
            }
            if (torrentData.hasChildPorno) {
                output += (await context.getLang("IPINFO_CP"))+"\n";
            }
            if (torrentData.contents && torrentData.contents.length > 0) {
                for (let i = 0; i < torrentData.contents.length; i++) {
                    const torrent = torrentData.contents[i];
                    output += (await context.getLang("IPINFO_TORRENT", torrent))+"\n";
                    if(output.length > 1800)break;
                }
                context.send(output);
            }
        }
    }
};