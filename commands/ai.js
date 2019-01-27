/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config').get("Commands.ai");
const cleverbot = require('cleverbot.io');
let cbot = new cleverbot(config.get("user"), config.get("key"));
let session;
const fs = require('fs');

let brain = require('brain.js');

const net = new brain.recurrent.LSTM({
    hiddenLayers: [5],     // array of ints for the sizes of the hidden layers in the network

});
net.maxPredictionLength = 2000;

let lastMessage;


module.exports = {
    name: "Artifical Intelligence",
    usage: "ai <message>",
    categories: ["fun"],
    rateLimit: 5,
    commands: ["ai","cleverbot"],
    init: function(){
        fs.readFile("net2.json", function(err, file){
            if(!err && file && file.length > 0){
                net.fromJSON(JSON.parse(file));
            }else {
                console.error(err);
            }
        })
    },
    run: async function run(message, args, bot) {
        if(args.length < 2){
            message.replyLang("8BALL_NO_QUESTION");
            return;
        }

        if(args[1].toLowerCase() === "train"){
            let targetChannel = message.channel;
            if(message.mentions.channels.size > 0){
                targetChannel = message.mentions.channels.first();
            }

            message.channel.send("Training on the last 1000 messages. This is gonna take forever...");

            let messages = [];
            let nextSegment;

            for(let i = 0; i < 50; i++){
                let messagesSegment = await targetChannel.fetchMessages({limit: 100, before: nextSegment});
                console.log("next seg "+nextSegment);
                console.log("Count "+messagesSegment.size);
                nextSegment = messagesSegment.lastKey();
                messages = messages.concat(messagesSegment.array());
            }

            message.channel.send(`Got ${messages.length} messages`);

            let trainingData = [];
            let lastAuthor;
            let compiledMessage = "";
            let lastMessage = messages[messages.length-1].cleanContent;




            for(let i = messages.length-1; i > 0; i--){
                const message = messages[i];
                if(message.author.id !== lastAuthor){
                    lastMessage = compiledMessage;
                    compiledMessage = message.cleanContent;
                    lastAuthor = message.author.id;
                    trainingData.push({input: lastMessage, output: compiledMessage});
                }else{
                    compiledMessage += ". "+message.cleanContent;
                }
            }



            fs.writeFile("training.json", JSON.stringify(trainingData), function(err){
                message.channel.send("Written training data successfully");
            });

            return;
        }
        if(message.getSetting("ai.usenet") && message.getSetting("ai.usenet") === "1"){
            let input = message.cleanContent.substring(args[0].length+1).toLowerCase().replace(/[^a-zA-Z\d\s:]/, "").replace(/ /g, "@ @").split(" ");
            console.log(input);
            let result = net.run(input);
            if(!result){
                message.channel.send("I need more training data...");
            }else{
                message.channel.send(result.replace(/@+/g, " "));

            }
            if(lastMessage){
               // net.train([{input: lastMessage, output: result}], {iterations: 100,log: true, logPeriod: 10,});
            }

            lastMessage = input;

            return;
        }
        try {
            cbot.setNick(message.channel.id);
            message.channel.startTyping();
            cbot.create(function(err, session){
                if(err) {
                    message.channel.stopTyping();
                    return message.replyLang("GENERIC_ERROR");
                }

                cbot.ask(message.cleanContent.substring(args[0].length+1), function(err, response){
                    message.channel.stopTyping();
                    if(err)
                        return message.replyLang("GENERIC_ERROR");

                    message.channel.send(response);


                });

            });
        }catch(e){
            bot.raven.captureException(e);
            message.channel.stopTyping();
        }
    }
};