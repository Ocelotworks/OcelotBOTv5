const Util = require("../../util/Util");
const columnify = require("columnify");
module.exports = {
    name: "View All Events",
    usage: "list",
    commands: ["list", "view", "upcoming"],
    run: async function (context, bot) {
        const events = await bot.database.getEventsForServer(context.guild.id);
        if(events.length === 0)
            return context.sendLang({content: "EVENTS_NONE", ephemeral: true});

        let header = `${context.getLang("EVENTS_LIST_HEADER")}\n\`\`\`yaml\n`
        let chunkedEvents = events.chunk(5);
        return Util.StandardPagination(bot, context, chunkedEvents, async function (events, index) {
            let formatted = [];
            for (let i = 0; i < events.length; i++) {
                let event = events[i];
                formatted.push({
                    "id :: ": event.id + " ::",
                    starts: event.starts.toLocaleString(),
                    name: event.name,
                });
            }
            return {content: header + columnify(formatted) + "\n```"};
        });
    }
}