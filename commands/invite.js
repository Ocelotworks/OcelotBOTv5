module.exports = {
    name: "Bot Invite Link",
    usage: "invite",
    usageExample: "invite",
    responseExample: "Invite the bot to your server at https://ocelotbot.xyz/invite",
    detailedHelp: "Get a unique referral code to get rewards when you invite another server to the bot.",
    commands: ["invite", "joinserver", "addbot"],
    categories: ["meta"],
    init: async function init(bot){
        if(bot.util.shard == 0){
            bot.logger.log("This shard will process invite referrals.");
            bot.bus.on("registerReferral", async (message)=>{
                const userId = message.payload.user;
                const code = message.payload.code;
                const serverId = message.payload.server;
                bot.logger.log(`Registering referral from ${userId} for ${serverId}`);
                if(!bot.config.getBool("global", "invite.notifications", userId))return bot.logger.log("Referral notifications are disabled.");
                try {
                    let user = await bot.client.users.fetch(userId);
                    let server = await bot.client.guilds.fetch(serverId);
                    let dmChannel = await user.createDM();
                    let referrals = await bot.database.getReferralCount(code);
                    dmChannel.send(`:tada: Someone just used your invite code (${code}) to invite OcelotBOT to **${server.name}**!\nYou've now referred **${referrals}** servers with this code.`);
                }catch(e){
                    console.log(e);
                    bot.logger.warn(`Failed to send referral message: ${e.message}`);
                }
            })
        }
    },
    run: async function run(message, args, bot) {
        let referralCode = await bot.database.generateReferralCode(message.id, message.guild ? message.guild.id : "dm", message.author.id);
        message.replyLang("INVITE", {
            code: encodeURIComponent(referralCode)
        });
    }
}