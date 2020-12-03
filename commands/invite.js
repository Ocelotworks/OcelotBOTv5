module.exports = {
    name: "Bot Invite Link",
    usage: "invite",
    commands: ["invite", "joinserver", "addbot"],
    categories: ["meta"],
    run: async function run(message, args, bot) {
        let referralCode = await bot.database.generateReferralCode(message.id, message.guild ? message.guild.id : "dm", message.author.id);
        message.channel.send(`Invite the bot to your server: https://ocelot.xyz/invite?code=${encodeURIComponent(referralCode)}`);
    }
}