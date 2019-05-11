/**
 * Ported by Neil - 30/04/18
 */

const commonWords = [
    "was", "is", "the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","person","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us", "it's", "don't", "dont"
];

const reg = /:[^:\s]+:/g;

module.exports = {
    name: "User Stats",
    usage: "userstats <user>",
    commands: ["userstats"],
    categories: ["meta"],
    init: function init(bot){

        bot.logger.log("Init milestones");

        const milestones = [69, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10];
        bot.commandCache = {};

        bot.bus.on("commandPerformed", async function commandPerformed(command, message){
            const user = message.author.id;
            if(bot.commandCache[user]){
                bot.commandCache[user]++;
            }else{
                const result = await bot.database.getUserStats(user);
                if(result[0])
                    bot.commandCache[user] = result[0].commandCount;
                else
                    bot.commandCache[user] = 1;

                bot.logger.warn(`Populated command cache for ${user} at ${bot.commandCache[user]}`);
            }
            const eligbleBadge = await bot.badges.updateBadge(message.author, 'commands', bot.commandCache[user], message.channel);
            if(milestones.indexOf(bot.commandCache[user]) > -1){
                bot.logger.log(`Sending congrats to ${user} for ${bot.commandCache[user]} commands`);
                message.channel.send(`:tada: **Congratulations! You just performed your __${bot.commandCache[user]}th__ command with OcelotBOT!**\n\nIf you enjoy OcelotBOT consider voting. **Type: ${message.getSetting("prefix")}vote**\n**Voting also gets you a special <:supporter_1:529308223954616322> supporter badge on your ${message.getSetting("prefix")}profile**`);
                bot.client.shard.send({type: "clearCommandCache"});
            }else if(eligbleBadge && bot.client.shard) {
                bot.client.shard.send({type: "clearCommandCache"});
            }
        });


        process.on("message", function clearCommandCache(message){
            if(message.type === "clearCommandCache"){
                bot.logger.log("Clearing Command Cache");
                bot.commandCache = {};
            }
        });

        // bot.client.on("presenceUpdate", function(oldMember, newMember){
        //     if(newMember.user.bot)return;
        //     // noinspection EqualityComparisonWithCoercionJS
        //     if(newMember.presence.game && newMember.presence.game != oldMember.presence.game)
        //         bot.logger.log(`${newMember.user.username} is now playing ${newMember.presence.game.name}`);
        // });
    },
    run: async function run(message, args, bot) {
        // noinspection EqualityComparisonWithCoercionJS
        if (message.getSetting("ocelotworks")) {
            await module.exports.ocelotStats(message, args, bot);
        } else if (!args[1]) {
            message.replyLang("USERSTATS_NO_USER");
        } else {
            if(message.mentions.users.size > 0){
                const target = message.mentions.users.firstKey();
                try {
                    message.channel.startTyping();
                    let commandResult = (await bot.database.getUserStats(target))[0];
                    let voteResult =(await bot.database.getVoteCount(target))[0];
                    let guessResult =(await bot.database.getTotalCorrectGuesses(target))[0];
                    let triviaResult = (await bot.database.getTriviaCorrectCount(target))[0];
                    let voteCount = 0, guessCount = 0, triviaCount = 0, commandCount = 0;

                    if(commandResult && commandResult['commandCount'])
                        commandCount = commandResult['commandCount'].toLocaleString();

                    if(voteResult && voteResult['COUNT(*)'])
                        voteCount = voteResult['COUNT(*)'].toLocaleString();

                    if(guessResult && guessResult['COUNT(*)'])
                        guessCount = guessResult['COUNT(*)'].toLocaleString();

                    if(triviaResult && triviaResult['count(*)'])
                        triviaCount = triviaResult['count(*)'].toLocaleString();

                    message.replyLang("USERSTATS_MESSAGE", {
                        target,
                        commandCount,
                        voteCount,
                        guessCount,
                        triviaCount
                    });

                    message.channel.stopTyping();

                } catch (e) {
                    bot.raven.captureException(e);
                    console.log(e);
                    message.replyLang("GENERIC_ERROR");
                }
            }else{
                message.channel.send(":bangbang: Invalid usage. You must @mention a user.");
            }
        }
    },
    ocelotStats: async function(message, args, bot){
        let target = args[1] ? args[1].toLowerCase() : null;
        if(target && target.startsWith("<")){
            message.channel.send("You can't mention people, you have to use their actual name i.e !userstats peter");
            return;
        }
        let sentMessage     = await message.channel.send("Generating stats [Getting messages from server]..."),
            output          = [`**Overview for ${target || "everyone"}**:`],
            totalChars      = 0,
            totalWords      = 0,
            emojis          = {},
            totalEmojis     = 0,
            uniqueWords     = {},
            channels        = {};



        let messages = await bot.database.getMessages(target);


        const totalMessages = messages.length;

        await sentMessage.edit(`Generating stats [Aggregating ${totalMessages.toLocaleString()} messages]...`);

        for(let i = 0; i < totalMessages; i++){
            const userMessage = messages[i];
            const messageContent = userMessage.message;
            const words = messageContent.split(" ");

            totalChars += messageContent.length;

            totalWords += words.length;
            for(let w = 0; w < words.length; w++){
                const word = words[w];
                if(word.length > 3 && commonWords.indexOf(word) === -1){
                    if(uniqueWords[word]){
                        uniqueWords[word]++;
                    }else{
                        uniqueWords[word] = 1;
                    }
                }
            }

            if(channels[userMessage.channel]){
                channels[userMessage.channel]++;
            }else{
                channels[userMessage.channel] = 1;
            }

            const emojiRegex = messageContent.match(reg);
            if(emojiRegex && emojiRegex.length > 0){
                totalEmojis += emojiRegex.length;
                for(let e = 0; e < emojiRegex.length; e++){
                    const emoji = emojiRegex[e];
                    if(emojis[emoji]){
                        emojis[emoji]++;
                    }else{
                        emojis[emoji] = 1;
                    }
                }
            }
        }

        await sentMessage.edit(`Generating stats [Sorting]...`);

        const uniqueWordsSorted = Object.keys(uniqueWords).sort(function(a, b) {
            return uniqueWords[a] - uniqueWords[b]
        });
        const channelsSorted = Object.keys(channels).sort(function(a, b) {
            return channels[a] - channels[b]
        });

        const emojisSorted = Object.keys(emojis).sort(function(a, b) {
            return emojis[a] - emojis[b]
        });

        await sentMessage.edit("Generating stats [Generating output]...");

        setTimeout(async function(){
            output.push(`- **${totalMessages.toLocaleString()}** total messages.`);
            output.push(`- **${totalWords.toLocaleString()}** total words. (**${Object.keys(uniqueWords).length.toLocaleString()}** unique)`);
            output.push(`- **${(totalWords / totalMessages).toFixed(3)}** words per message.`);
            output.push(`- **${totalChars.toLocaleString()}** total characters.`);
            output.push(`- At **44** words per minute, this would've taken **${bot.util.prettySeconds((totalWords / 44)*60)}** to type.`);
            output.push(`- All their messages in a text file would take up **${bot.util.prettyMemory(totalChars)}** of space.`);

            const lastWordIndex = uniqueWordsSorted.length - 1;
            const lastWord = uniqueWordsSorted[lastWordIndex];

            output.push(`- The most used word is **'${lastWord}'** with **${uniqueWords[lastWord].toLocaleString()}** uses.`);

            const lastEmojiIndex = emojisSorted.length - 1;
            const lastEmoji = emojisSorted[lastEmojiIndex];

            output.push(`- The most used emoji is **'${lastEmoji}'** with **${emojis[lastEmoji].toLocaleString()}** uses.`);
            output.push(`- They have used **${emojisSorted.length}** different emojis, **${totalEmojis.toLocaleString()}** total times.`);

            const lastChannelIndex = channelsSorted.length - 1;
            const lastChannel = channelsSorted[lastChannelIndex];

            output.push(`- Their favourite channel is **'${lastChannel}'** with **${channels[lastChannel].toLocaleString()}** messages.`);


            await sentMessage.edit(output.join('\n'));

        }, 2000);
    }
};