/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/04/2019
 * ╚════ ║   (ocelotbotv5) support
 *  ════╝
 */
const Sentry = require('@sentry/node');
const columnify = require('columnify');
const config = require('config');
const {axios} = require('../util/Http')
const {NotificationContext} = require("../util/CommandContext");
const Embeds = require("../util/Embeds");
const Strings = require("../util/String");
const {LoadSecretSync} = require("../util/Util");

const changePrefix = /.*(change|custom).*prefix.*/gi;
const domainRegex = /.*(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9].*/i;
const inviteRegex = /(https?:\/\/)?(.*?@)?(www\.)?(discord\.(gg)|discord(app)?\.com\/invite)\/(?<code>[\w-]+)/ui;

const PhishGgKey = LoadSecretSync("PHISHGG_API_KEY")


module.exports = class SupportServer {
    name = "Support Server Specific Functions";
    bot;

    constructor(bot){
        this.bot = bot;
    }


    init(){
        this.bot.client.on("messageCreate", this.onMessage.bind(this));
        this.bot.client.on("guildMemberAdd", this.onGuildMemberAdd.bind(this));
        this.bot.client.on("guildMemberRemove", this.onGuildMemberRemove.bind(this));
        //this.bot.client.on("raw", this.onRawMessage.bind(this));
        this.bot.client.on("ready", this.onReady.bind(this));
    }


    async onReady(){
        if (this.bot.client.guilds.cache.has("322032568558026753")) {
            setTimeout(this.updateLeaderboards.bind(this), 5000)
            setInterval(this.updateLeaderboards.bind(this), 8.64e+7)
        }
    }

    async onMessage(message){
        if(this.bot.drain)return;
        await this.checkDomains(message);
        await this.checkAutoReplies(message);

    }

    async onGuildMemberAdd(member){
        if(member.guild.id !== "322032568558026753" || this.bot.client.user.id !== "146293573422284800")return;
        try {
            if(!await this.isSuspiciousAccount(member))return;
            this.bot.logger.log("Found suspicious account " + member.id);
            await member.edit({
                roles: ["856657988629692486"]
            });

            let channel = await this.bot.client.channels.fetch("856658218948624444");
            member.verifyMessage = await channel.send({
                content: `Welcome to the server, <@${member.id}>!\nWe require certain accounts to be screened before joining the server to avoid trolls/spammers. Please wait here and a <@&325967792128131084> or <@&439485569425211392> will be around shortly to let you in.`,
                components: [this.bot.util.actionRow(
                    this.bot.interactions.addAction("Verify", 1, this.verify(member).bind(this), -1, "✅"),
                    this.bot.interactions.addAction("View Details", 2, this.checkUserInfo(member).bind(this), -1, "❓")
                )]
            });
        }catch(e){
            // this.bot.logger.error(e);
            this.bot.raven.captureException(e);
        }
    }

    async onGuildMemberRemove(member){
        if(member.guild.id !== "322032568558026753" || this.bot.client.user.id !== "146293573422284800" || !member.verifyMessage)return;
        member.verifyMessage.delete();
    }

    async isSuspiciousAccount(member){
        const verifyMode = member.guild.getSetting("verifyMode");
        if(verifyMode == 0)return false;
        if(verifyMode == 2)return true;
        const commandCount = (await this.bot.database.getUserStats(member.id))[0].count;
        if(commandCount == 0)return true;
        const friskyData = await this.checkFrisky(member.id)
        if(friskyData)return true;
        const azraelData = await this.checkAzrael(member.id)
        if(azraelData.banned)return true;
        const drepData = await this.checkDiscordRep(member.id);
        if(drepData.downvotes > 0)return true;
        const blacklisterData = await this.checkBlacklister(member.id);
        return blacklisterData.blacklisted;
    }

    async checkAutoReplies(message){
        if (message.guild && message.guild.id === "322032568558026753" && !message.author.bot && this.bot.client.user.id == "635846996418363402") {
            if (message.content.indexOf("discord.gg") > -1)
                return message.delete();

            if (changePrefix.exec(message.content))
                return this.bot.util.replyTo(message, "To change the prefix, type !settings set prefix %\nWhere % is the prefix you want.");
        }
    }

    async checkDomains(message){
        if(!(message.guild && !message.author.bot && message.guild.getBool("antiphish")))return;
        const inviteMatch = inviteRegex.exec(message.content);
        if(inviteMatch && message.guild.getBool("antiphish.checkInvites")){
            try{
                const invite = await this.bot.client.fetchInvite(inviteMatch[0]);
                if(invite && invite.guild){
                    //this.bot.logger.warn(`Checking server invite in ${message.guild.id} (${message.content}) (${invite.guild.id})`);
                    let result = await axios.get(`https://api.phish.gg/server?id=${invite.guild.id}`, {
                        validateStatus: ()=>true
                    });
                    //console.log(result.data);
                    if(result.status < 300 && result.data && result.data.match && message.guild.getSetting("antiphish.inviteMatch").includes(result.data.key)){
                        this.bot.logger.warn(`Deleting possible QR fake message ${message.content}`);
                        this.bot.logger.log(result.data);
                        const isAdmin = message.member?.permissions?.has("ADMINISTRATOR");
                        if(!isAdmin && !message.deleted)message.delete();
                        if (message.guild.getSetting("antiphish.channel")) {
                            let channelSetting = message.guild.getSetting("antiphish.channel");
                            let reportChannel = await message.guild.channels.fetch(channelSetting).catch(()=>null);
                            if(!reportChannel)
                                reportChannel = await message.guild.channels.fetch().then((cs)=>cs.find((c)=>c.name === channelSetting)).catch(()=>null);
                            if(!reportChannel)
                                return this.bot.logger.warn(`Report channel ${channelSetting} couldn't be found`);
                            const context = new NotificationContext(this.bot, reportChannel, message.author, message.member);
                            const embed = new Embeds.LangEmbed(context);
                            embed.setTitleLang("PHISHING_DETECTION_TITLE");
                            embed.setDescriptionLang("PHISHING_DETECTION_DESC", message);
                            embed.setThumbnail(message.author.avatarURL({size: 128}));
                            embed.setColor("#ff0000");
                            if(isAdmin)
                                embed.addFieldLang("PHISHING_DETECTION_ADMIN_NAME", "PHISHING_DETECTION_ADMIN_VALUE");
                            embed.addFieldLang("PHISHING_DETECTION_MATCH_NAME", "PHISHING_DETECTION_MATCH_VALUE", true, {match: {
                                domain: inviteMatch[0],
                                type: result.data.reason || result.data.key
                            }, index: 1});
                            embed.setTimestamp(new Date());
                            reportChannel.send({embeds: [embed]});
                        }
                        this.bot.modules.statistics.incrementStat(message.guild.id, message.author.id, "scam_detected");
                    }else if(invite.channel?.name?.includes("verify")){
                        const shouldAutoReport = message.guild.getBool("antiphish.invite.autoreport") && message.guild.getSetting("antiphish.invite.list").split(",").includes(invite.code);
                        this.alertPotential(message, shouldAutoReport);
                        this.bot.modules.statistics.incrementStat(message.guild.id, message.author.id, "potential_scam_detected");
                        if(shouldAutoReport){
                            this.autoReport(invite);
                        }
                    }
                }
            }catch(e){
                this.bot.logger.error(e);
                if(!e.toString().includes("Unknown Invite"))
                    Sentry.captureException(e);
            }
            this.bot.modules.statistics.incrementStat(message.guild.id, message.author.id, "invite_check");
        }
        if(domainRegex.exec(message.content) && message.guild.getBool("antiphish.checkDomains")){
            try {
                //this.bot.logger.warn(`Checking domain in ${message.guild.id} (${message.content})`);
                let result = await axios.post("https://anti-fish.bitflow.dev/check", {message: message.content}).catch(()=>null);
                if (result?.data?.match && result.data.matches[0]?.trust_rating > 0.5) { // Hacky

                    const isAdmin = message.member?.permissions?.has("ADMINISTRATOR");
                    if(!isAdmin && !message.deleted) {
                        this.bot.logger.warn(`Deleting possible free nitro message ${message.content}`);
                        message.delete();
                    }else{
                        this.bot.logger.warn(`NOT deleting possible free nitro message ${message.content}`);
                    }
                    if (message.guild.getSetting("antiphish.channel")) {
                        let channelSetting = message.guild.getSetting("antiphish.channel");
                        let reportChannel = await message.guild.channels.fetch(channelSetting).catch(()=>null);
                        if(!reportChannel)
                            reportChannel = await message.guild.channels.fetch().then((cs)=>cs.find((c)=>c.name === channelSetting)).catch(()=>null);
                        if(!reportChannel)
                            return this.bot.logger.warn(`Report channel ${channelSetting} couldn't be found`);
                        const context = new NotificationContext(this.bot, reportChannel, message.author, message.member);
                        const embed = new Embeds.LangEmbed(context);
                        embed.setTitleLang("PHISHING_DETECTION_TITLE");
                        embed.setDescriptionLang("PHISHING_DETECTION_DESC", message);
                        embed.setThumbnail(message.author.avatarURL({size: 128}));
                        embed.setColor("#ff0000");
                        if(isAdmin)
                            embed.addFieldLang("PHISHING_DETECTION_ADMIN_NAME", "PHISHING_DETECTION_ADMIN_VALUE");
                        for (let i = 0; i < result.data.matches.length; i++) {
                            const match = result.data.matches[i];
                            embed.addFieldLang("PHISHING_DETECTION_MATCH_NAME", "PHISHING_DETECTION_MATCH_VALUE", true, {match, index: i+1});
                        }
                        embed.setTimestamp(new Date());
                        reportChannel.send({embeds: [embed]});
                    }
                    this.bot.modules.statistics.incrementStat(message.guild.id, message.author.id, "phishing_detected");
                }
            }catch(e){
                this.bot.logger.error(e);
                if(!e?.message?.includes("Unknown Message"))
                    Sentry.captureException(e);
            }
            this.bot.modules.statistics.incrementStat(message.guild.id, message.author.id, "domain_check");
        }
    }

    verify(member){
        return async (interaction, context)=>{
            if(!["145193838829371393", "139871249567318017", "112386674155122688", "145200249005277184"].includes(interaction.member.user.id))
                return context.send({content: "Wait and a member of staff will be along to verify you shortly.", ephemeral: true});
            if(member.deleted) return context.send({content: "User has left.", ephemeral: true});
            await member.roles.remove("856657988629692486", "Verified by "+interaction.member.user.id);
            return context.send({content: `<@${member.id}> has been verified by <@${interaction.member.user.id}>`});
        }
    }

    async alertPotential(message, isAutoReport){
        try {
            if (message.getSetting("potentialQrChannel")) {
                const [guildId, channelId] = message.getSetting("potentialQrChannel").split(".");
                let guild = await this.bot.client.guilds.fetch(guildId);
                let channel = await guild.channels.fetch(channelId);
                channel.send(`Potential new QR server:\n\`\`\`\n${Strings.Truncate(message.content, 1000)}\n\`\`\`\n${isAutoReport?"Auto report triggered" : ""}`);
            }
        }catch(e){
            this.bot.logger.error(e);
            Sentry.captureException(e);
        }
    }

    async autoReport(invite){
        return axios.post(`https://api.phish.gg/report`, {
            invite: invite.code,
            key: "QR"
        }, {
            headers: {
                authorization: PhishGgKey,
            }
        });
    }

    checkUserInfo(member){
        return async (interaction, context)=>{
            if(!["145193838829371393", "139871249567318017", "112386674155122688", "145200249005277184"].includes(interaction.member.user.id))
                return context.send({content: "Wait and a member of staff will be along to verify you shortly.", ephemeral: true})
            if(member.deleted)
                return context.send({content: "User has left.", ephemeral: true});

            let content = `**Details for ${member.user.tag}:**\nAccount Age: `;
            try {
                const [guildData, drep, /*ddu,*/ azrael, blacklister, frisky, commandCount] = await Promise.all([
                    // Guild Data
                    this.bot.rabbit.broadcastEval(`this.guilds.cache.filter((guild)=>guild.members.cache.has('${member.id}') && guild.id !== '${member.guild.id}').map((guild)=>\`\${guild.name} (\${guild.id})\`);`),
                    // drep
                    this.checkDiscordRep(member.id),
                    // ddu
                    //axios.get(`https://discord.riverside.rocks/check.json.php?id=${member.id}`).catch(() => null),
                    // azrael
                    this.checkAzrael(member.id),
                    // Blacklister
                    this.checkBlacklister(member.id),
                    // Frisky
                    this.checkFrisky(member.id),
                    // Command count
                    this.bot.database.getUserStats(member.id).then((d)=>d[0].count)
                ]);

                const now = new Date();
                const accountAge = now - member.user.createdAt;
                if(context.getSetting("verifyMode") == 2)
                    content += "⚠️Verify Mode is set to challenge all (2)\n";

                if (accountAge < 3.6e+6) content += "⚠️" // 1 Hour
                if (accountAge < 8.64e+7) content += "‼️" // 1 Day
                else if (accountAge < 6.048e+8) content += "❗" // 1 Week
                else if (accountAge < 2.628e+9) content += "❕" // 1 Month
                content += `**${this.bot.util.prettySeconds(accountAge / 1000, member.guild.id, member.user)}**\n`;
                let guildCollection = guildData.reduce((a, b) => a.concat(b), []);
                content += `Seen: ${guildCollection.length > 0 ? guildCollection.join(", ") : "Nowhere."}\n`;

                if(commandCount === 0) content += "⚠️";
                content += `**${commandCount.toLocaleString()}** commands performed\n`;

                if (drep.data) {
                    if (drep.data.downvotes > 0) content += "⚠️"
                    content += `DiscordRep: ${drep.data.upvotes} UP | ${drep.data.downvotes} DOWN | ${drep.data.xp} XP\n`;
                }

                // if (ddu.data) {
                //     if (ddu.data.score > 0) content += "⚠️"
                //     content += `DDU: Score: ${ddu.data.score} (${ddu.data.reports}/${ddu.data.total_reports})\n`;
                // }

                if(azrael?.data){
                    content += `Azrael: ${azrael.data.banned ? "⚠️Banned" : "✅ Not Banned"}\n`;
                }

                if(blacklister?.blacklisted){
                    content += `⚠️Blacklisted: ${blacklister.reason}\n`;
                }

                if(frisky){
                    content += `⚠️${frisky.add_reason}\n`;
                }

            }

            catch(e){
                this.bot.logger.log(e);
                content += "\n"+e;
            }
            return context.send({content, ephemeral: true});
        }
    }

    async checkFrisky(id){
        const {data} = await axios.get(`https://api.extrafrisky.dev/api/v1/scammers/detailed/${id}`,{
            headers: {
                authorization: config.get("API.extrafrisky.key")
            }
        });
        return data.user;
    }

    async checkAzrael(id){
        const {data} = await axios.get(`https://azrael.gg/api/v3/checks/${id}`, {
            headers: {
                Authorization: config.get("API.azrael.key")
            },
            validateStatus: ()=>true,
        });
        return data;
    }

    async checkDiscordRep(id){
        const {data} = await axios.get(`https://discordrep.com/api/v3/rep/${id}`, {
            headers: {
                Authorization: config.get("API.discordrep.key")
            },
            validateStatus: ()=>true,
        });
        return data;
    }

    async checkBlacklister(id){
        const {data}= await axios.get(`https://api.blacklister.xyz/${id}`, {
            headers: {
                Authorization: config.get("API.blacklister.key")
            }
        });
        return data;
    }

    async updateLeaderboards(){
        if (this.bot.config.getBool("global", "leaderboard.enable")) {
            await this.updateLeaderboard("guess.records", "guess/records", "total");
            await this.updateLeaderboard("guess", "guess/global", "total");
            await this.updateLeaderboard("trivia", "trivia/global", "score");
        }
    }

    async updateLeaderboard(key, route, field){
        const channel = this.bot.config.get("global", `leaderboard.${key}.channel`);
        const allMessageId = this.bot.config.get("global", `leaderboard.${key}.all`);
        const monthlyMessageId = this.bot.config.get("global", `leaderboard.${key}.monthly`);
        console.log(key, route, field, channel, allMessageId, monthlyMessageId)
        let [allMessage, monthlyMessage] = await Promise.all([
            await this.bot.client.channels.cache.get(channel).messages.fetch(allMessageId),
            await this.bot.client.channels.cache.get(channel).messages.fetch(monthlyMessageId),
        ]);

        console.log("editing ", allMessageId)
        await allMessage.edit(await this.makeLeaderboard(route, field, "all"));
        console.log("editing ", monthlyMessageId)
        await monthlyMessage.edit(await this.makeLeaderboard(route, field, "month"));
    }

    async makeLeaderboard(type, totalField, time){
        const {data: leaderboard} = await axios.get(`https://api.ocelotbot.xyz/leaderboard/${type}/${time}?items=20`)
        let outputData = [];
        for (let i = 0; i < leaderboard.data.length; i++) {
            const entry = leaderboard.data[i]
            let row = {
                "#": i + 1,
                "user": await this.bot.util.getUserTag(entry.user),
            };
            if (entry.points)
                row["Correct"] = entry.points.toLocaleString();

            row[totalField] = entry[totalField].toLocaleString();

            outputData.push(row);
        }
        return (time === "month" ? "Monthly Scores:" : "All Time Scores:") + "\n```yaml\n" + columnify(outputData) + "\n```\nLast Updated:" + new Date().toLocaleString();
    }
}
