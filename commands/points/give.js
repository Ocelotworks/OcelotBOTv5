module.exports = {
    name: "Give Points",
    usage: "give @user amount",
    commands: ["give", "send", "pay"],
    run: async function (message, args, bot) {
        if (message.mentions.users.size === 0)
            return message.channel.send(`You must mention a user to send points to. For example: ${context.command} ${args[1]} ${bot.client.user} 100`);

        if (!args[3])
            return message.channel.send(`Enter an amount to send. For example: ${context.command} ${args[1]} ${bot.client.user} 100`)
        let target = message.mentions.users.first();

        if(target.id === message.author.id)
            return message.channel.send("You can't send points to yourself. What would that even achieve?");

        if(target.bot)
            return message.channel.send("You can't send points to a bot.");

        const amount = parseInt(args[3]);

        if(isNaN(amount))
            return message.channel.send(`The amount you entered was not a valid number. Enter a whole number, for example: ${context.command} ${args[1]} ${bot.client.user} 100`);

        if(amount <= 0)
            return message.channel.send("Nice try, enter a number higher than 0.");

        const canSend = await bot.database.takePoints(message.author.id, amount, `given to ${target.id}`);

        if(!canSend)
            return message.channel.send("You don't have enough points to do that.");

        await bot.database.addPoints(target.id, amount, `received from ${message.author.id}`);

        message.channel.send(`✅ Sent **<:points:817100139603820614>${amount}** to ${target}!`)

    }
};