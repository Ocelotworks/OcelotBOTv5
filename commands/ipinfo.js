/**
 * Created by Peter on 01/07/2017.
 */
const config = require('config');
const Sentry = require('@sentry/node');
const Discord = require('discord.js');
const reportCategories = {
    "3": "Fraud Orders",
    "4": "DDoS Attack",
    "5": "FTP Brute Force",
    "6": "Ping of Death",
    "7": "Phishing",
    "8": "Fraud VoIP",
    "9": "Open Proxy",
    "10": "Web Spam",
    "11": "Email Spam",
    "12": "Blog Spam",
    "13": "VPN",
    "14": "Port Scan",
    "15": "Hacking",
    "16": "SQL Injection",
    "17": "E-mail spoof",
    "18": "Brute Force",
    "19": "Bad Web Bot",
    "20": "Exploited Host",
    "21": "Web App Attack",
    "22": "SSH",
    "23": "IoT Targeted"};

module.exports = {
    name: "IP Info",
    usage: "ipinfo <ip>",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["ipinfo", "ip"],
    run: async function run(message, args, bot) {
        if(args.length < 2){
            message.channel.send(`:bangbang: Invalid usage. ${args[0]} ip`);
        }else{
            if(args[1].indexOf(".") === -1 && args[1].indexOf(":") === -1)
                return message.channel.send(":bangbang: Invalid IP Address.");

            try {
                let abuseIp = await bot.util.getJson(`https://api.abuseipdb.com/api/v2/check?ipAddress=${args[1]}&days=${config.get("Commands.ipinfo.days")}}`, null, {
                    Key: config.get("Commands.ipinfo.key"),
                    Accept: 'application/json'
                });
                if (abuseIp && abuseIp.data) {
                    const data = abuseIp.data;
                    if(!data.isPublic)
                        return message.replyLang("IPINFO_PRIVATE");

                    let embed = new Discord.MessageEmbed();
                    embed.setTitle(data.ipAddress);
                    embed.setDescription(data.isp);
                    if(data.domain)
                        embed.addField("Domain", data.domain, true);
                    embed.addField("Country", data.countryName || data.countryCode, true);
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
                        embed.addField("Hostnames", data.hostnames.join("\n"));
                    }
                    console.log("Fucking sending");
                    message.channel.send("", embed);
                }else{
                    return message.replyLang("IPINFO_INVALID_IP");
                }
            }catch(e){
                Sentry.captureException(e);
            }
            if(!message.getSetting("ipinfo.disableTorrents")) {
                let torrentData = await bot.util.getJson(`https://api.antitor.com/history/peer?ip=${args[1]}&key=${config.get("Commands.ipinfo.torrentKey")}&days=30`);
                let output = "";
                if (torrentData.hasPorno) {
                    output += (await message.getLang("IPINFO_PORN"))+"\n";
                }
                if (torrentData.hasChildPorno) {
                    output += (await message.getLang("IPINFO_CP"))+"\n";
                }
                if (torrentData.contents && torrentData.contents.length > 0) {
                    for (let i = 0; i < torrentData.contents.length; i++) {
                        const torrent = torrentData.contents[i];
                        output += (await message.getLang("IPINFO_TORRENT", torrent))+"\n";
                    }
                    message.channel.send(output);
                }
            }
        }

    }
};