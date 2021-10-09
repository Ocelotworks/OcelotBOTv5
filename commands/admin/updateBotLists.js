
module.exports = {
    name: "Update Bot Lists",
    usage: "updatebotlists :id?",
    commands: ["updatebotlists", "ubl", "updatebotlist"],
    noCustom: true,
    run: async function (context, bot) {
        if (!context.options.id){
            return bot.lists.updateBotLists(bot);
        }else{
            let list = await bot.database.getBotlist(context.options.id, bot.client.user.id);
            if(!list[0])return context.send("Couldn't find a botlist with that ID");
            await bot.lists.updateList(list[0], bot);
            return context.send("Updated "+list[0].name);
        }

    }
};