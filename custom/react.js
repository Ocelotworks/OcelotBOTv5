module.exports = {
    type: "react",
    run: async function(context, response, bot){
        if(!context.message)return;
        return context.message.react(response.content);
    }
}