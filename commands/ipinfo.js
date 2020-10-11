/**
 * Created by Peter on 01/07/2017.
 */
const config = require('config');
const Sentry = require('@sentry/node');
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
            if(args[1].indexOf(".") === -1)
                return message.channel.send(":bangbang: Invalid IP Address.");

            try {
                let ipInfo = await bot.util.getJson(`http://ipinfo.io/${args[1]}/json`);
                message.channel.send(`*Country:* ${ipInfo.city ? ipInfo.city : "Unknown"}, ${ipInfo.region ? ipInfo.region : "Unknown"}, ${ipInfo.country ? ipInfo.country : "Unknown"} (${ipInfo.loc ? ipInfo.loc : "Unknown"})\n*Hostname:* ${ipInfo.hostname ? ipInfo.hostname : "Unknown"}\n*Organisation:* ${ipInfo.org ? ipInfo.org : "Unknown"}`);
            }catch(e){
                Sentry.captureException(e);
                message.replyLang("IPINFO_FAILED");
            }

            if(!message.getSetting("ipinfo.disableAbuseipdb")) {
                try {
                    let abuseIp = await bot.util.getJson(`https://api.abuseipdb.com/api/v2/check?ipAddress=${args[1]}&days=${config.get("Commands.ipinfo.days")}}`, null, {
                        Key: config.get("Commands.ipinfo.key"),
                        Accept: 'application/json'
                    });
                    if (abuseIp.length > 0) {
                        const lastReportData = abuseIp[0];
                        if (!lastReportData.created) return;
                        let lastReport = lastReportData.created + " ";
                        for (let i in lastReportData.category) {
                            lastReport += reportCategories[lastReportData.category[i]];
                        }
                        message.channel.send((await message.getLang("IPINFO_REPORT", {num: abuseIp.length})) + "\n" + (await message.getLang("IPINFO_LAST_REPORT")) + lastReport);
                    }
                }catch(e){
                    Sentry.captureException(e);
                }
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