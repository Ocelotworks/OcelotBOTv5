const botlist = require('../../modules/botlists');
module.exports = {
    name: "Update Bot Lists",
    usage: "updatebotlists [id]",
    commands: ["updatebotlists", "ubl", "updatebotlist"],
    noCustom: true,
    run: async function (message, args, bot) {
        if (!args[2]){
            return botlist.updateBotLists(bot);
        }else{
            let list = await bot.database.getBotlist(args[2]);
            if(!list[0])return message.channel.send("Couldn't find a botlist with that ID");
            await botlist.updateList(list[0], bot);
            return message.channel.send("Updated "+list[0].name);
        }

    }
};