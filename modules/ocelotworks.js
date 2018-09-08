const userMaps = {
    "145659666687328256": "alex",
    "145193838829371393": "jake",
    "139871249567318017": "peter",
    "386490585344901130": "abbey",
    "478951521854291988": "holly",
    "145200249005277184": "neil",
    "112386674155122688": "joel",
    "146293573422284800": "ocelotbot"
};
const emojiMaps = {
    alex: "<:alex:478962386578047000>",
    joel: "<:joel_high:478962387995852804>",
    peter: "<:peter:478962397281779713>",
    neil: "<:neilpoop:478962395692269570>",
    jake: "<:jake_dino:478962396749103106>"
};
module.exports = {
    name: "Ocelotworks Specific Functions",
    init: function(bot){
        let topicCounter = 0;

        bot.changeTopic = async function(message){
            topicCounter = 0;
            bot.logger.log("Changing topic");
            const topicResult = await bot.database.getRandomTopic();
            const topic = topicResult[0];
            const topicOutput = `<${topic.username}> ${topic.topic}`;
            message.channel.send(`${emojiMaps[topic.username] || ""} _Set topic: ${topicOutput}_`);
            message.channel.setTopic(topicOutput, `Topic ID: ${topic.id}`);
        };

        bot.client.on("message", bot.raven.wrap(async function onMessage(message) {
           // noinspection EqualityComparisonWithCoercionJS
            if(message.guild && message.guild.id == "478950156654346292"){
               topicCounter++;
               await bot.database.logMessage(userMaps[message.author.id] || message.author.id, message.content, message.channel.id);
                if(topicCounter >= 100){
                   bot.changeTopic(message);
                }
                if(message.content.toLowerCase() === "too hot"){
                    message.channel.send("_hot damn_");
                }else if(message.content.toLowerCase() === "shitpost"){
                    message.channel.send("A days power in half an hour");
                }

           }
        }));
    }
};