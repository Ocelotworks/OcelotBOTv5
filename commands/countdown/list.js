const Util = require("../../util/Util");
const columnify = require("columnify");
const Strings = require("../../util/String");
module.exports = {
    name: "List Countdowns",
    usage: "list",
    commands: ["list", "view"],
    run: async function (context, bot) {
        const countdowns = await bot.database.getCountdownsForServer(context.guild?.id || context.channel.id);
        const locale = context.getSetting("lang") === "en-owo" ? "en-gb" : context.getSetting("lang");
        let header = "\n```asciidoc\n";
        return Util.StandardPagination(bot, context, countdowns.chunk(10), async function (countdowns, index) {
            let formatted = [];
            for (let i = 0; i < countdowns.length; i++) {
                const countdown = countdowns[i];
                formatted.push({
                    "id ::": `${countdown.id} ::`,
                    message: Strings.Truncate(countdown.message, 100),
                    at: countdown.target.toLocaleDateString(locale),
                });
            }

            return {content: header + columnify(formatted) + "\n```"};
        });
    }
}