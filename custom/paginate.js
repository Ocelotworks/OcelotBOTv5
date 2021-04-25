module.exports = {
    type: "paginate",
    run: async function(message, response, bot){
        return bot.util.standardPagination(message.channel, response.pages, (page)=>page);
    }
}