const Strings = require("../util/String");
const {Util} = require("discord.js");
const emojiMaps = {
    alex: "<:alex:478962386578047000>",
    joel: "<:joel_dad:1028787156099014706>",
    peter: "<:peter:478962397281779713>",
    neil: "<:sadneil:835645107087605801>",
    jake: "<:jake_dino:478962396749103106>",
    holly: "<:holly_swim:863438919177076746>",
    rachael: "<:rachael:1043291163286839348>",
    abbey: "<:abbey:1028788414822223955>",
};

module.exports = {
    name: "Ocelotworks Specific Functions",
    init: function (bot) {
        bot.topicCounter = 0;

        bot.changeTopic = async function (message) {
            bot.topicCounter = 0;
            bot.logger.log("Changing topic");
            const topicResult = await bot.database.getRandomTopic();
            const topic = topicResult[0];
            const topicOutput = `<${topic.username}> ${Util.escapeMarkdown(Strings.Truncate(topic.topic, 800))}`;
            await message.channel.setTopic(topicOutput, `Topic ID: ${topic.id}`);
            await message.channel.send(`${emojiMaps[topic.username] || ""} _Set topic: ${topicOutput}_`);
        };

        bot.client.on("messageCreate", async function onMessage(message) {
            // noinspection EqualityComparisonWithCoercionJS
            if (message.guild && message.guild.id == "478950156654346292") {
                if(!message.channel.isThread())
                    bot.topicCounter++;
                await bot.database.logMessage(message.getSetting("ocelotworks.name") || message.author.id, message.content, message.channel.id);
                if (bot.topicCounter >= 100) {
                    bot.changeTopic(message);
                }
            }
        });

        bot.client.on("messageReactionAdd", async (reaction, user) => {
            if (reaction.message?.guild && reaction.message?.guild?.id !== "478950156654346292") return;
            try {
                if (reaction.message?.partial) {
                    await reaction.message.fetch();
                }
                if (reaction.partial) {
                    await reaction.fetch();
                }
            }catch(e){
                // No access so ignore
                return;
            }
            if (!reaction.message.guild) return;
            if (reaction.message.guild.id !== "478950156654346292") return;
            if (reaction.emoji.toString() !== "🍞" && reaction.emoji.id !== "812259123864272906") return;
            if (reaction.message.breaded) return;
            reaction.message.breaded = true;
            let topic =  reaction.message.content
            if(reaction.message.attachments.first())
                topic += "\n"+reaction.message.attachments.first().url;
            const username = reaction.message.getSetting("ocelotworks.name");
            await bot.database.addTopic(username, topic);
            reaction.message.channel.send(`${reaction.emoji} ${user}: Added _<${username}> ${topic}_ to the list of topics`);
        })


        // bot.client.on("ready", function discordReady(){
        //     if(bot.client.guilds.cache.has("478950156654346292")) {
        //         const notifChannel = bot.client.channels.cache.get("478950156654346294");
        //         const ts = new ts3();
        //         bot.logger.log("Connecting to TeamSpeak...");
        //         ts.connect(config.get("Teamspeak.server"), 10011)
        //             .then(async function connected() {
        //                 bot.logger.log("Connected to TeamSpeak");
        //                 try {
        //                     let auth = await ts.auth(config.get("Teamspeak.user"), config.get("Teamspeak.password"), 1);
        //                 } catch (e) {
        //                     console.log(e);
        //                     bot.logger.log("Auth errored as expected...");
        //                 } finally {
        //                     ts.setName('OcelotBOT');
        //                     ts.subscribe("server");
        //                 }
        //
        //             });
        //         ts.on('clientJoin', (ev) => {
        //             const user = ev.client.nick;
        //             notifChannel.send(`_${emojiMaps[user.toLowerCase()] || ""}${user} joined TeamSpeak_`);
        //         });
        //         ts.on('clientLeave', (ev) => {
        //             const user = ev.client.nick;
        //             notifChannel.send(`_${emojiMaps[user.toLowerCase()] || ""}${user} left TeamSpeak_`);
        //         });
        //     }
        // });


    }
};