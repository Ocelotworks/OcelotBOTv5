/**
 * Created by Peter on 01/07/2017.
 */
const config = require('config');
const request = require('request');
const reportCategories = config.get("Commands.ipinfo.reportCategories");
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
            request(`http://ipinfo.io/${args[1]}/json`, async function(err, response, body){
                try{
                    const data = JSON.parse(body);
                    message.channel.send(`*Country:* ${data.city ? data.city : "Unknown"}, ${data.region ? data.region : "Unknown"}, ${data.country ? data.country : "Unknown"} (${data.loc ? data.loc : "Unknown"})\n*Hostname:* ${data.hostname ? data.hostname : "Unknown"}\n*Organisation:* ${data.org ? data.org : "Unknown"}`);
                }catch(e){
                    message.replyLang("GENERIC_ERROR");
                    bot.raven.captureException(e);
                    bot.logger.error(`${e.stack}, ${body}`);
                }
            });
            if(!message.getSetting("ipinfo.disableAbuseipdb")) {
                request(`https://www.abuseipdb.com/check/${args[1]}/json?key=${config.get("Commands.ipinfo.key")}&days=${config.get("Commands.ipinfo.days")}`, async function (err, resp, body) {
                    try {
                        let data = JSON.parse(body);
                        if (data.length > 0) {
                            const lastReportData = data[0];
                            if(!data[0].created)return;
                            let lastReport = lastReportData.created + " ";
                            for (let i in lastReportData.category) {
                                lastReport += reportCategories[lastReportData.category[i]];
                            }
                            message.channel.send(await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "IPINFO_REPORT", {num: data.length}) + "\n" + await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "IPINFO_LAST_REPORT") + lastReport);
                        }

                    } catch (e) {
                        bot.raven.captureException(e);
                        bot.logger.log(`${e.stack}, ${body}`);
                    }
                });
            }
            if(!message.getSetting("ipinfo.disableTorrents")) {
                request(`https://api.antitor.com/history/peer?ip=${args[1]}&key=${config.get("Commands.ipinfo.torrentKey")}`, function (err, resp, body) {
                    try {
                        let data = JSON.parse(body);
                        let output = "";
                        if (data.hasPorno) {
                            output += ":warning: **This IP Address has downloaded Pornography in the last 30 days**\n";
                        }
                        if (data.hasChildPorno) {
                            output += ":bangbang: **This IP Address has downloaded CP in the last 30 days!!!!**\n";
                        }
                        if (data.contents.length > 0) {
                            for (let i = 0; i < data.contents.length; i++) {
                                const torrent = data.contents[i];
                                output += `IP Torrented ${torrent.name} on ${torrent.startDate}\n`;
                            }
                            message.channel.send(output);
                        }
                    } catch (e) {
                        bot.raven.captureException(e);
                        bot.logger.log(`${e.stack}, ${body}`);
                    }
                });
            }
        }

    }
};