module.exports = {
    id: "nick",
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server){
        recv.eval(`
            bot.receivers.discord.internal.client.editNickname({
                serverID: "${server}",
                userID: "146293573422284800",
                nick: "${args[2]}"
            });
        `);
    }
};