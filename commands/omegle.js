/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 01/11/2019
 * ╚════ ║   (ocelotbotv5) omegle
 *  ════╝
 */
let waitingMessages = {};
let messageCollectors = {};
module.exports = {
    name: "Omegle",
    usage: "omegle <start/end>",
    categories: ["fun"],
    requiredPermissions: [],
    unwholesome: true,
    commands: ["omegle", "om"],
    init: async function(bot){
        bot.client.on("ready", function () {
            bot.rabbit.channel.assertQueue(`omegle-${bot.client.user.id}-${bot.client.shard.id}`, {exclusive: true});
            bot.rabbit.channel.consume(`omegle-${bot.client.user.id}-${bot.client.shard.id}`, function omegleConsumer(message) {
                try {
                    let msg = JSON.parse(message.content);
                    console.log(msg);
                    switch(msg.type){
                        case "error":
                            if(msg.data.data.error.indexOf("disconnect") === -1)
                                bot.client.channels.get(msg.data.channel).sendLang(msg.data.lang, msg.data.data);
                            break;
                        case "message":
                            bot.client.channels.get(msg.data.channel).send("> "+(msg.data.message.replace(/'/, "")));
                            break;
                        case "isOtherServer":
                            bot.client.channels.get(msg.data).send("The stranger is another OcelotBOT user!");
                            break;
                        case "disconnected":
                            bot.client.channels.get(msg.data).send("The stranger has disconnected.");
                            if(messageCollectors[msg.data]) {
                                messageCollectors[msg.data].stop();
                                delete messageCollectors[msg.data];
                            }
                            break;
                        case "waiting":
                            if(waitingMessages[msg.data])
                                waitingMessages[msg.data].edit("<a:ocelotload:537722658742337557> **Connected to Omegle, looking for match...**");
                            break;
                        case "connected":
                            if(waitingMessages[msg.data]) {
                                waitingMessages[msg.data].delete();
                                delete waitingMessages[msg.data];
                            }
                            bot.client.channels.get(msg.data).send(`You are now connected to a stranger! Say hi! Start a message with a ! to stop the stranger from seeing it.`);
                            break;
                        default:
                            console.warn(msg);
                    }

                    bot.rabbit.channel.ack(message);
                } catch (e) {
                    bot.raven.captureException(e);
                    bot.logger.error(e);
                }
            });
        });
    },
    run: async function(message, args, bot){
        if(!message.guild)
            return message.replyLang("GENERIC_DM_CHANNEL");

        if(!args[1])
            return message.channel.send(`Usage: ${message.getSetting("prefix")}omegle start/end`);

        if(args[1].toLowerCase() === "start"){
            if(waitingMessages[message.channel.id])
                return message.channel.send("Still looking for a match! Please wait!");
            if(messageCollectors[message.channel.id])
                return message.channel.send("You are currently connected! Use !omegle end to end");

            bot.tasks.startTask("omegle", message.channel.id);

            bot.rabbit.queue("omegle", {type: "start", data: message.channel.id}, {replyTo:`omegle-${bot.client.user.id}-${bot.client.shard.id}`});
            waitingMessages[message.channel.id] = await message.channel.send("<a:ocelotload:537722658742337557> Contacting Omegle Service....");

            messageCollectors[message.channel.id] = message.channel.createMessageCollector(() => true);

            messageCollectors[message.channel.id].on("collect", function(message){
                if (message.author.bot)return;
                if (message.content.startsWith(message.getSetting("prefix")))return;
                if(waitingMessages[message.channel.id])return;
                bot.rabbit.queue("omegle", {type: "message", data: {channel: message.channel.id, message: message.cleanContent.replace(/'/g, "")}}, {replyTo:`omegle-${bot.client.user.id}-${bot.client.shard.id}`});
            });

            messageCollectors[message.channel.id].on("end", function(){
                bot.tasks.endTask("omegle", message.channel.id);
            });

        }else if(args[1].toLowerCase() === "end"){
            if(waitingMessages[message.channel.id]) {
                waitingMessages[message.channel.id].delete();
                delete waitingMessages[message.channel.id]
            }
            if(messageCollectors[message.channel.id]){
                messageCollectors[message.channel.id].stop();
                delete messageCollectors[message.channel.id];
            }

            bot.rabbit.queue("omegle", {type: "end", data: message.channel.id}, {replyTo:`omegle-${bot.client.user.id}-${bot.client.shard.id}`});
            message.channel.send("Disconnected.");
        }else{
            if(messageCollectors[message.channel.id])
                return message.channel.send(`Invalid Usage. To send a message to omegle, just type it in the channel. To end, type **${message.getSetting("prefix")}omegle end**. Commands won't be sent to the stranger. `);
            message.channel.send(`Invalid usage. To start a session, type ${message.getSetting("prefix")}omegle start`);
        }
    }
};
