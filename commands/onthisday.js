const dateformat = require('dateformat');
const Util = require("../util/Util");
module.exports = {
    name: "On This Day",
    usage: "onthisday",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["onthisday", "otd"],
    commandPack: "ocelotworks",
    run: async function(context, bot){
        if(!context.getSetting("ocelotworks"))return;

        context.defer();

        const now = new Date();
        const result = await bot.database.getOnThisDayMessages(now.getDate(), now.getMonth()+1);
        const pages = result.chunk(10);

        return Util.StandardPagination(bot, context, pages, async function(page, index){
            let output = `Page ${index+1}/${pages.length}\n\`\`\`\n`;
            for(let i = 0; i < page.length; i++){
                let row = page[i];
                output += `[${dateformat(new Date(row.time), 'UTC:dd/mm/yy HH:MM:ss Z')}] <${row.user}> ${row.message}\n`;
            }
            output += "\n```";
            return {content: output};
        }, true)
    }
};