const userMaps = {
    "145659666687328256": "alex",
    "145193838829371393": "jake",
    "139871249567318017": "peter",
    "386490585344901130": "abbey",
    "478951521854291988": "holly",
    "145200249005277184": "neil",
    "112386674155122688": "joel",
    "146293573422284800": "ocelotbot",
    "483242312206385173": "!imitate",
    "483242548199030794": "!imitate"
};
const emojiMaps = {
    alex: "<:alex:478962386578047000>",
    joel: "<:joel_high:478962387995852804>",
    peter: "<:peter:478962397281779713>",
    neil: "<:neilpoop:478962395692269570>",
    jake: "<:jake_dino:478962396749103106>"
};
const ts3 = require('ts3');
const config = require('config');

module.exports = {
    name: "Ocelotworks Specific Functions",
    init: function(bot){
        bot.topicCounter = 0;

        bot.changeTopic = async function(message){
            bot.topicCounter = 0;
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
               bot.topicCounter++;
               await bot.database.logMessage(userMaps[message.author.id] || message.author.id, message.content, message.channel.id);
                if(bot.topicCounter >= 100){
                   bot.changeTopic(message);
                }
                if(message.content.toLowerCase() === "too hot"){
                    message.channel.send("_hot damn_");
                }else if(message.content.toLowerCase() === "shitpost"){
                    message.channel.send("A days power in half an hour");
                }else if(message.content.toLowerCase() === "test"){
                    message.channel.send("icles");
                }

           }
        }));


        bot.client.on("ready", function discordReady(){
            if(bot.client.guilds.has("478950156654346292")) {
                const notifChannel = bot.client.channels.get("478950156654346294");
                const ts = new ts3();
                bot.logger.log("Connecting to TeamSpeak...");
                ts.connect(config.get("Teamspeak.server"), 10011)
                    .then(async function connected() {
                        bot.logger.log("Connected to TeamSpeak");
                        try {
                            let auth = await ts.auth(config.get("Teamspeak.user"), config.get("Teamspeak.password"), 1);
                        } catch (e) {
                            console.log(e);
                            bot.logger.log("Auth errored as expected...");
                        } finally {
                            ts.setName('OcelotBOT');
                            ts.subscribe("server");
                        }

                    });
                ts.on('clientJoin', (ev) => {
                    const user = ev.client.nick;
                    notifChannel.send(`_${emojiMaps[user.toLowerCase()] || ""}${user} joined TeamSpeak_`);
                });
                ts.on('clientLeave', (ev) => {
                    const user = ev.client.nick;
                    notifChannel.send(`_${emojiMaps[user.toLowerCase()] || ""}${user} left TeamSpeak_`);
                });
            }
        });


    }
};