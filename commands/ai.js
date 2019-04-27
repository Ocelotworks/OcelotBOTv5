/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/01/2019
 * ╚════ ║   (ocelotbotv5) ai
 *  ════╝
 */
const config = require('config').get("Commands.ai");

//Whoeever wrote the cleverbot.io package is honest to god retarded
const base_url = "https://cleverbot.io/1.0/";
var cio = function (user, key) {
    this.user = user;
    this.key = key;
    this.setNick = function (nick) {
        this.nick = nick;
    };
    this.create = function (callback) {
        request.post({ url: base_url + "create", form: {
                user: this.user,
                key: this.key,
                nick: this.nick
            }}, function (err, httpResponse, body) {
            if (err) return callback(err);
            try{
                const data = JSON.parse(body);
                if(data.status === "success")
                    this.nick = data.nick;
                callback(false, this.nick);
            }catch(e){
                callback(e);
            }
        });
    };

    this.ask = function (input, callback) {
        request.post({ url: base_url + "ask", form: {
                user: this.user,
                key: this.key,
                nick: this.nick,
                text: input
            }}, function (err, httpResponse, body) {
            if (err) return callback(err);
            try{
                const data = JSON.parse(body);
                if(data.status === "success")
                    return callback(false, JSON.parse(body).response);
                callback(data.status, data.status);
            }catch(e){
                callback(e);
            }
        });
    }
};
let cbot = new cio(config.get("user"), config.get("key"));


module.exports = {
    name: "Artifical Intelligence",
    usage: "ai <message>",
    detailedHelp: "Ask a question to the Artifical Intelligence",
    usageExample: "ai what is the meaning of life?",
    categories: ["fun"],
    rateLimit: 20,
    commands: ["ai","cleverbot"],
    run: async function run(message, args, bot) {
        if(args.length < 2)
            return message.replyLang("8BALL_NO_QUESTION");
        try {
            cbot.setNick(message.channel.id);
            message.channel.startTyping();
            cbot.create(function(err, session){
                if(err) {
                    message.channel.stopTyping();
                    return message.replyLang("GENERIC_ERROR");
                }

                try {
                    cbot.ask(message.cleanContent.substring(args[0].length + 1), function (err, response) {
                        message.channel.stopTyping();
                        if (err)
                            return message.replyLang("GENERIC_ERROR");

                        message.channel.send(response);


                    });
                }catch(e){
                    message.replyLang("GENERIC_ERROR");
                }

            });
        }catch(e){
            bot.raven.captureException(e);
            message.channel.stopTyping();
        }
    }
};