module.exports = {
    name: "Bot Invite Link",
    usage: "invite",
    commands: ["invite", "joinserver", "addbot", "support", "supportserver"],
    categories: ["meta"],
    run: function run(message) {
        // message.replyLang("INVITE", {
        //     botInvite: "https://discordapp.com/oauth2/authorize?client_id=171640650721132544&scope=bot&permissions=52288",
        //     supportInvite: "https://discord.gg/7YNHpfF"
        // });

        message.channel.send(`Invite the bot to your server: https://discordapp.com/oauth2/authorize?client_id=171640650721132544&scope=bot&permissions=52288\nJoin the support server: https://discord.gg/7YNHpfF`)
    },
    test: function(test){
        test('invite', function(t){
            const message = {
                channel: {
                    send: function(text){
                        t.is(text,`Invite the bot to your server: https://discordapp.com/oauth2/authorize?client_id=171640650721132544&scope=bot&permissions=52288\nJoin the support server: https://discord.gg/7YNHpfF`);
                    }
                }
            };
            module.exports.run(message);
        })
    }
};