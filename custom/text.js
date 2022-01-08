module.exports = {
    type: "text",
    run: function(context, response, bot){
        return context.send(response.content);
    }
}