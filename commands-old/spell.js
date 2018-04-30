/**
 * Created by Peter on 02/07/2017.
 */
const async = require('async');
module.exports = {
    name: "Spell",
    usage: "spell [^] <word>",
    accessLevel: 0,
    commands: ["spell"],
    init: function init(bot, cb){
        bot.spellQueue = [];
        bot.processingSpellQueue = false;
        bot.spellQueueTotal = 0;
        bot.spellQueueTotalTime = 0;
        bot.spellQueueTotalRetries = 0;
        bot.spellQueueTotalFailed = 0;


        bot.queueReactions = function queueReactions(reactions, channel, message, recv){
            for(var i in reactions){
                if(reactions.hasOwnProperty(i)){
                    bot.spellQueue.push({
                        channelID: channel,
                        messageID: message,
                        reaction: reactions[i],
                        retries: 0,
                        receiver: recv,
                        time: new Date()
                    });
                }
            }

            bot.processSpellQueue();

        };

        var notAllowedChannels = [];

        bot.processSpellQueue = function processSpellQueue(){
            if(bot.processingSpellQueue)return;
            bot.processingSpellQueue = true;
            bot.ipc.emit("instanceBusy", {instance: bot.instance});
            var reaction = bot.spellQueue.shift();
            if(reaction){
                bot.spellQueueTotal++;
                var now = new Date();
                bot.spellQueueTotalTime += now-reaction.time;
                var receiver = reaction.receiver;
                delete reaction.receiver;
                if(notAllowedChannels.indexOf(reaction.channelID) > -1){
                    bot.processingSpellQueue = false;
                    processSpellQueue();
                }else {
                    receiver.addReaction(reaction, function (err) {
                        if (err) {
                            bot.logger.log("Spell queue item failed with: " + err);
                            reaction.retries++;
                            if (reaction.retries < 3 && err.response && err.response.message === "You are being rate limited.") {
                                bot.spellQueueTotalRetries++;
                                reaction.receiver = receiver;
                                bot.logger.log("Rate limited, trying again next turn.");
                                bot.spellQueue.unshift(reaction);
                            } else {
								console.log(err);
                                if (err && err.response && err.response.statusCode == 403) {
                                    notAllowedChannels.push(reaction.channelID);
                                }else if(err){
									bot.raven.captureException(err);
								}
                                bot.spellQueueTotalFailed++;
                            }
                        }
                        bot.processingSpellQueue = false;
                        setTimeout(processSpellQueue, 300);
                    });
                }
            }else{
                bot.processingSpellQueue = false;
                bot.ipc.emit("instanceFree", {instance: bot.instance});
            }
        };
        cb();
    },
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        var letters = {
            abc: ["🔤"],
            ab: ["🆎"],
            id: ["🆔"],
            vs: ["🆚"],
            ok: ["🆗"],
            cool: ["🆒"],
            "0": ["0⃣","🇴", "🅾", "⭕", "🔄", "🔃"],
            "1": ["1⃣"],
            "2": ["2⃣"],
            "3": ["3⃣"],
            "4": ["4⃣"],
            "5": ["5⃣"],
            "6": ["6⃣"],
            "7": ["7⃣"],
            "8": ["8⃣"],
            "9": ["9⃣"],
            "10": ["🔟"],
            "100": ["💯"],
            lo: ["🔟"],
            new: ["🆕"],
            ng: ["🆖"],
            free: ["🆓"],
            cl: ["🆑"],
            wc: ["🚾"],
            sos: ["🆘"],
            atm: ["🏧"],
            up: ["🆙"],
            end: ["🔚"],
            back: ["🔙"],
            on: ["🔛"],
            top: ["🔝"],
            soon: ["🔜"],
            off: ["📴"],
            oo: "➿",
            "$": ["💲"],
            "!!": ["‼"],
            "!": ["❗", "❕", "⚠", "‼"],
            tm: ["™"],
            a: ["🅰",  "🇦"],
            b: ["🅱", "🇧"],
            c: ["🇨", "©", "↪"],
            d: ["🇩"],
            e: ["🇪", "📧"],
            f: ["🇫"],
            g: ["🇬"],
            h: ["🇭"],
            i: ["🇮", "ℹ", "🇯", "♊", "👁"],
            j: ["🇯", "🇮"],
            k: ["🇰"],
            l: ["🇱", "🛴"],
            m: ["🇲", "Ⓜ", "〽", "🇳"],
            n: ["🇳", "🇲", "Ⓜ"],
            o: ["🇴", "🅾", "⭕", "🔄", "🔃", "0⃣","👁‍", "🔅", "🔆"],
            p: ["🇵", "🅿"],
            q: ["🇶"],
            r: ["🇷", "®"],
            s: ["🇸", "💲", "💰"],
            t: ["🇹", "✝"],
            u: ["🇺"],
            v: ["🇻"],
            w: ["🇼"],
            x: ["🇽", "❌", "✖", "❎"],
            y: ["🇾"],
            z: ["🇿", "💤"]
        };

        var str = message.toLowerCase().substring(7).replace(" ", "");
        var keys = Object.keys(letters);
        var times = 0;
        var done = true;
        var target = event.d ? event.d.id : event.ts;
        if(args[1] === "^" || args[1] === "[^]")
            recv.getMessages({
                channelID: channel,
                limit: 2
            }, function(err, resp){
        		if(err)bot.raven.captureException(err);
                if(resp[1]){
					target = resp[1].id;
					doTheRestOfIt();
                }else{
                	recv.sendMessage({
						to: channel,
						message: ":bangbang: There is no message above this one to spell onto."
					})
				}

            });
        else doTheRestOfIt();
        function doTheRestOfIt() {
            async.doUntil(function (callback) {
                    done = true;
                    times++;
                    async.eachSeries(keys, function (key, cb) {
                        var ind = str.indexOf(key);
                        if (ind > -1) {
                            done = false;
                            var sub;
                            var i = -1;
                            if(letters[key] != undefined)
                                async.doWhilst(function (cb2) {
                                    i++;
                                    sub = letters[key][i];
                                    cb2();
                                }, function () {
                                    return !sub && i < letters[key].length;
                                }, function () {
                                    if (sub) {
                                        str = str.replace(key, sub + " ");
                                        letters[key][i] = null;
                                        if(letters[key].lastIndexOf(null) === letters[key].length-1){
                                            delete letters[key];
                                        }
                                    }
                                });
                        }
                        cb();
                    }, callback);
                },
                function () {
                    console.log("Run times:" + times);
                    return done || times > 18;
                },
                function () {
                    var reacts = str.replace(/[A-z]/g, "").split(" ");
                    reacts.splice(20);
                    async.eachSeries(reacts, function (react, cb) {
                        if (react) {
                            console.log(react);
                            bot.spellQueue.push({
                                channelID: channel,
                                messageID: target,
                                reaction: react,
                                retries: 0,
                                receiver: recv,
                                time: new Date()
                            });
                        }
                        cb();

                    }, function(){
                        bot.processSpellQueue(bot);
                    });

                });
        }

    }
};