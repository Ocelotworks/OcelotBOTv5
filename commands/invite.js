module.exports = {
    name: "Bot Invite Link",
    usage: "invite",
    commands: ["invite", "joinserver", "addbot", "support", "supportserver"],
    categories: ["meta"],
    run: function run(message) {
        message.replyLang("INVITE", {
            botInvite: "https://discordapp.com/oauth2/authorize?client_id=171640650721132544&scope=bot&permissions=52288",
            supportInvite: "https://discord.gg/7YNHpfF"
        });
    }
};