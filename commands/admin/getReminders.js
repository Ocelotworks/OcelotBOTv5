const columnify = require('columnify');
module.exports = {
    name: "Get Reminders",
    usage: "reminders",
    commands: ["reminders"],
    run: async function (message, args, bot) {
        let sentMessage = await message.channel.send("Loading...");

        (async function () {
            await sentMessage.react("⏮");
            await sentMessage.react("◀");
            await sentMessage.react("▶");
            await sentMessage.react("⏭");
        })();

        const reminders = await bot.database.getReminders();
        let pages = reminders.chunk(5);

        let index = 0;

        let buildPage = async function () {
            const page = pages[index];
            const data = columnify(page, {
                truncate: true,
                widths: {
                    message: {
                        maxWidth: 10
                    }
                },
                columns: ['id', 'at', 'user', 'channel', 'message']
            });
            await sentMessage.edit(`Page ${index+1}/${pages.length}\n\`\`\`\n${data}\n\`\`\``);
        };

        await buildPage();

        await sentMessage.awaitReactions(async function (reaction, user) {
            if (user.id === bot.client.user.id) return false;
            switch (reaction.emoji.name) {
                case "⏮":
                    index = 0;
                    await buildPage();
                    break;
                case "◀":
                    if (index > 0)
                        index--;
                    else
                        index = pages.length - 1;
                    await buildPage();
                    break;
                case "▶":
                    if (index < pages.length - 1)
                        index++;
                    else
                        index = 0;
                    await buildPage();
                    break;
                case "⏭":
                    index = pages.length - 1;
                    await buildPage();
                    break;
            }
            reaction.remove(user);

        }, {time: 60000});
        sentMessage.clearReactions();
    }
};