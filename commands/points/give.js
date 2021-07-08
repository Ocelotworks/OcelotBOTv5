module.exports = {
    name: "Give Points",
    usage: "give :@user :0amount",
    commands: ["give", "send", "pay"],
    run: async function (context, bot) {
        let target = context.channel.members.get(context.options.user).user;

        if(target.id === context.user.id)
            return context.send({content: "You can't send points to yourself. What would that even achieve?", ephemeral: true});

        if(target.bot)
            return context.send({content: "You can't send points to a bot.", ephemeral: true});
        
        const amount = context.options.amount;
        
        if(amount <= 0)
            return context.send({content: "Nice try, enter a number higher than 0.", ephemeral: true});

        const canSend = await bot.database.takePoints(context.user.id, amount, `given to ${target.id}`);

        if(!canSend)
            return context.send({content: "You don't have enough points to do that.", ephemeral: true});

        await bot.database.addPoints(target.id, amount, `received from ${context.user.id}`);

        return context.send(`✅ Sent **<:points:817100139603820614>${amount}** to ${target}!`)
    }
};