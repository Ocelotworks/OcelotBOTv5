module.exports = {
    name: "Bot Invite Link",
    usage: "invite",
    commands: ["invite", "joinserver", "addbot"],
    categories: ["meta"],
    run: function run(message) {
        // message.replyLang("INVITE", {
        //     botInvite: "https://discordapp.com/oauth2/authorize?client_id=171640650721132544&scope=bot&permissions=52288",
        //     supportInvite: "https://discord.gg/7YNHpfF"
        // });

        message.channel.send(`Invite the bot to your server: https://ocelot.xyz/invite`)
    },
    test: function(test){
        test('invite', function(t){
            const message = {
                channel: {
                    send: function(text){
                        t.is(text,`Invite the bot to your server: https://ocelot.xyz/invite`);
                    }
                }
            };
            module.exports.run(message);
        })
    }
};