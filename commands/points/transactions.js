const Icon = require("../../util/Icon");
module.exports = {
    name: "Give Points",
    usage: "give :@user :0amount",
    commands: ["give", "send", "pay"],
    run: async function (context, bot) {
        let target = (await context.getMember(context.options.user))?.user;

        if(!target)
            return context.sendLang({content: "GENERIC_USER_NOT_FOUND", ephemeral: true});

        if(target.id === context.user.id)
            return context.sendLang({content: "POINTS_GIVE_SELF", ephemeral: true});

        if(target.bot)
            return context.sendLang({content: "POINTS_GIVE_BOT", ephemeral: true});
        
        const amount = context.options.amount;
        
        if(amount <= 0)
            return context.sendLang({content: "POINTS_GIVE_NEGATIVE", ephemeral: true});

        const canSend = await bot.database.takePoints(context.user.id, amount, `given to ${target.id}`);

        if(!canSend)
            return context.sendLang({content: "POINTS_GIVE_NOT_ENOUGH", ephemeral: true});

        await bot.database.addPoints(target.id, amount, `received from ${context.user.id}`);

        return context.sendLang("POINTS_GIVE", {amount, target});
    }
};