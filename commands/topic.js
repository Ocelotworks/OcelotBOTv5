const userMaps = {
    "145659666687328256": "alex",
    "145193838829371393": "jake",
    "139871249567318017": "peter",
    "386490585344901130": "abbey",
    "478951521854291988": "holly",
    "145200249005277184": "neil",
    "146293573422284800": "ocelotbot"
};
module.exports = {
    name: "Topic Control",
    usage: "topic [index/up/down/set] <url>",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["topic"],
    run: async function(message, args, bot){
        // noinspection EqualityComparisonWithCoercionJS
        if(message.guild.id != "478950156654346292")return;
        // if(args.length < 3){
            const messageFetch = await message.channel.fetchMessages({limit: args[1] ? parseInt(args[1])+1 : 2});
            const target = messageFetch.last();
            try {
                await bot.database.addTopic(userMaps[target.author.id], target.content);
                message.channel.send(`:white_check_mark: Added _<${userMaps[target.author.id]}> ${target.content}_ to the list of topics`)
            }catch(e){
                message.channel.send("Error adding topic");
            }
        // }
    }
};