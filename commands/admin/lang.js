const columnify = require('columnify');
const Util = require("../../util/Util");
module.exports = {
    name: "View Lang",
    usage: "lang [list?:list] :key?",
    commands: ["lang"],
    run: async function (context, bot) {
        if (context.options.list) {
            const strings = bot.lang.strings[context.options.key || "default"];
            const keys = Object.keys(strings).map(function (key) {
                return {key: key, string: strings[key].replace(/`/g, "'")};
            });
            let pages = keys.chunk(10);

            return Util.StandardPagination(bot, context, pages, function (page, index) {
                const data = columnify(page, {
                    truncate: true,
                    widths: {
                        message: {
                            maxWidth: 10
                        }
                    }
                });
                return {content:`Page ${index + 1}/${pages.length}\n\`\`\`\n${data}\n\`\`\``};
            }, true);
        }
        context.sendLang(context.options.key);
    }
};