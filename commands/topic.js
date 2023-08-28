const {Util} = require("discord.js");
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
    usage: "topic [arg?:next,count,stats] :0index? :?messageid",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["topic"],
    commandPack: "ocelotworks",
    slashHidden: true,
    contextMenu: {
        type: "message",
        value: "messageid",
    },
    run: async function (context, bot) {
        if (!context.getBool("ocelotworks")) return;
        const arg = context.options.arg;
        if (arg === "next") {
            return bot.changeTopic(context.message);
        }
        if (arg === "count" || arg === "stats") {
            const stats = await bot.database.getTopicStats();
            let output = "Topic Stats:\n";
            for (let i = 0; i < stats.length; i++) {
                output += `**${stats[i].username}**: ${stats[i]['COUNT(*)']}\n`;
            }
            return context.send(output);
        }

        let target;
        if (context.message?.reference?.messageID || context.options.messageid) {
            target = await context.channel.messages.fetch(context.message?.reference?.messageID || context.options.messageid)
        }else {
            const limit = context.options.index ? context.options.index + 1 : 1;
            const messageFetch = await context.channel.messages.fetch({limit: limit});
            target = messageFetch.last();
        }
        try {
            let topic = target.content;
            if(target.attachments.first())
                topic += "\n"+target.attachments.first().url;
            await bot.database.addTopic(userMaps[target.author.id], topic);
            let output = `:white_check_mark: Added _<${userMaps[target.author.id]}> ${Util.escapeMarkdown(topic)}_ to the list of topics`;
            if (target.author.id === context.user.id)
               output += "\n_topicing something you said is like laughing at your own joke_ - Neil 2015";
            return context.send({content: output});
        } catch (e) {
            return context.send("Error adding topic: "+e.message);
        }
    }
};