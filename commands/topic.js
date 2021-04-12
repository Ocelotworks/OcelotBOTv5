const userMaps = {
    "145659666687328256": "alex",
    "145193838829371393": "jake",
    "139871249567318017": "peter",
    "386490585344901130": "abbey",
    "478951521854291988": "holly",
    "145200249005277184": "neil",
    "112386674155122688": "joel",
    "146293573422284800": "ocelotbot"
};
let lastTopic;
module.exports = {
    name: "Topic Control",
    usage: "topic [index/up/down/set] <url>",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["topic"],
    hidden: true,
    run: async function (message, args, bot) {
        if (!message.getSetting("ocelotworks")) return;
        const arg = args[1] ? args[1].toLowerCase() : null;
        if (arg === "next") {
            await bot.changeTopic(message);
        } else if (arg === "removelast") {
            if (lastTopic) {

            } else {
                message.channel.send("The shard has restarted since the last !topic");
            }
        } else if (arg === "removecurrent") {

        } else if (arg === "count" || arg === "stats") {
            const stats = await bot.database.getTopicStats();
            let output = "Topic Stats:\n";
            for (let i = 0; i < stats.length; i++) {
                output += `**${stats[i].username}**: ${stats[i]['COUNT(*)']}\n`;
            }
            message.channel.send(output);
        } else {
            const limit = args[1] ? parseInt(args[1]) + 1 : 2;
            if (isNaN(limit)) {
                message.channel.send("You must enter a number.");
            } else {
                const messageFetch = await message.channel.messages.fetch({limit: limit});
                const target = messageFetch.last();
                try {
                    let topic = target.content;
                    if(message.attachments[0])
                        topic += "\n"+message.attachments[0].url;
                    await bot.database.addTopic(userMaps[target.author.id], topic);
                    message.channel.send(`:white_check_mark: Added _<${userMaps[target.author.id]}> ${target.content}_ to the list of topics`);
                    if (target.author.id === message.author.id)
                        message.channel.send("_topicing something you said is like laughing at your own joke_ - Neil 2015");
                } catch (e) {
                    message.channel.send("Error adding topic");
                }
            }
        }

    }
};