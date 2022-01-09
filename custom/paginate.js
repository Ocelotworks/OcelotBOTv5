module.exports = {
    type: "paginate",
    run: async function(context, response, bot){
        return bot.util.standardPagination(context.channel, response.pages, (page)=>page);
    }
}