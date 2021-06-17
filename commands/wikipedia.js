const {axios} = require('../util/Http');
module.exports = {
    name: "Wikipedia Search",
    usage: "wiki :term+",
    commands: ["wiki", "wikipedia", "wp"],
    rateLimit: 30,
    categories: ["search", "tools"],
    run: async function run(context, bot){
        const term = encodeURIComponent(context.options.term);
        const result = await axios.get("https://en.wikipedia.org/w/api.php?action=opensearch&search="+term);
        try{
            if(result.data[2].length === 0)
                return context.send({content: "No pages found.", ephemeral: true});

            if(result.data[2][0].indexOf("refer to") > -1)
                return context.send(`**${result.data[1][1]}:**\n${result.data[2][1]}\n${result.data[3][1]}`);

            return context.send(`**${result.data[1][0]}:**\n${result.data[2][0]}\n${result.data[3][0]}`);

        }catch(e){
            context.send({content: "Error: "+e, ephemeral: true});
            bot.raven.captureException(e);
        }
    }
};