const columnify = require('columnify');
module.exports = {
    name: "View Lang",
    usage: "lang <key/list>",
    commands: ["lang"],
    run: async function(message, args, bot){
        if(!args[2]){
            message.channel.send("Invalid usage: !admin lang <lang>");
        }else if(args[2].toLowerCase() === "list") {
            let index = 0;
            const strings = bot.lang.strings.default;
            const keys = Object.keys(strings).map(function(key) {
                return {key: key, string: strings[key].replace(/`/g, "'")};
            });
            let pages = keys.chunk(10);

            let buildPage = function () {
                const page = pages[index];
                const data = columnify(page, {
                    truncate: true,
                    widths: {
                        message: {
                            maxWidth: 10
                        }
                    }
                });
                return (`Page ${index+1}/${pages.length}\n\`\`\`\n${data}\n\`\`\``);
            };

            let sentMessage = await message.channel.send(buildPage());

            (async function () {
                await sentMessage.react("⏮");
                await sentMessage.react("◀");
                await sentMessage.react("▶");
                await sentMessage.react("⏭");
            })();

            await sentMessage.awaitReactions(async function (reaction, user) {
                if (user.id === bot.client.user.id) return false;

                switch (reaction.emoji.name) {
                    case "⏮":
                        index = 0;
                        break;
                    case "◀":
                        if (index > 0)
                            index--;
                        else
                            index = pages.length - 1;
                        break;
                    case "▶":
                        if (index < pages.length - 1)
                            index++;
                        else
                            index = 0;
                        break;
                    case "⏭":
                        index = pages.length - 1;
                        break;
                }
                sentMessage.edit(buildPage());
                reaction.remove(user);

            }, {time: 60000});
            sentMessage.reactions.removeAll();
        }else{
           message.replyLang(args[2], args[3] ? JSON.parse(args[3]) : {});
        }
    }
};