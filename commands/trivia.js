const columnify = require('columnify');
const pasync = require('promise-async');
const request = require('request');
const Discord = require('discord.js');
const Sentry = require('@sentry/node');
const difficulties = [
    "easy",
    "medium",
    "hard"
];

const difficultyColours = {
    easy: "#51ff81",
    medium: "#ff7d2d",
    hard: "#ff150e"
};

const numbers = [
    ":one:",
    ":two:",
    ":three:",
    ":four:"
];

const runningGames = [];

module.exports = {
    name: "Trivia",
    usage: "trivia leaderboard monthly",
    rateLimit: 2,
    commands: ["trivia"],
    categories: ["tools", "fun", "games"],
    requiredPermissions: ["EMBED_LINKS", "ADD_REACTIONS"],
    init: function(bot){
       //TODO destruct!
    },
    run: function run(message, args, bot) {
        Sentry.configureScope(async function run(scope){
            if(args[1]){
                if(args[1].toLowerCase().startsWith("leaderboard")){
                    message.channel.startTyping();

                    let leaderboardData;
                    if(args[2] && args[2].toLowerCase() === "monthly"){
                        leaderboardData = await bot.database.getMonthlyTriviaLeaderboard();
                    }else if(args[2] && args[2].toLowerCase() === "server" && message.guild) {
                        leaderboardData = await bot.database.getServerTriviaLeaderboard(message.guild.members.keyArray());
                    }else{
                        leaderboardData = await bot.database.getTriviaLeaderboard();
                    }

                    const userKey = await bot.lang.getTranslation(message.guild.id, "TRIVIA_USER");
                    const scoreKey = await bot.lang.getTranslation(message.guild.id, "TRIVIA_SCORE");
                    const correctKey = await bot.lang.getTranslation(message.guild.id, "TRIVIA_CORRECT");
                    const unknownUserKey = await bot.lang.getTranslation(message.guild.id, "TRIVIA_UNKNOWN_USER");

                    let i = 0;
                    let data = [];
                    let position = -1;




                    await pasync.eachSeries(leaderboardData, async function processLeaderboard(entry, cb){
                        i++;
                        if(entry.user === message.author.id){
                            position = "#"+i;
                            if(i > 10){
                                cb();
                                return;
                            }
                        }
                        if(i <= 10)
                            try {
                                let user = await bot.util.getUserInfo(entry.user);
                                data.push({
                                    "#": i,
                                    [userKey]: user ? `${user.username}#${user.discriminator}` : `${unknownUserKey} ${entry.user}`,
                                    [scoreKey]: entry.Score,
                                    [correctKey]: entry.correct,
                                });
                            }catch(e){
                                bot.logger.error("Error processing leaderboard entry");
                                bot.logger.error(e);
                            }finally{
                                cb();
                            }
                        else cb();
                    });
                    if(args[2] && args[2].toLowerCase() === "daily"){
                        message.channel.send("There's no daily leaderboard queen, fuck");
                    }else {
                        message.replyLang("TRIVIA_LEADERBOARD_LIST" + (args[2] ? "_MONTHLY" : ""), {
                            user: message.author.id,
                            position: position,
                            total: leaderboardData.length,
                            list: columnify(data)
                        });
                    }

                    message.channel.stopTyping();

                }else{
                    message.replyLang("TRIVIA_INVALID_USAGE");
                }
            }else{
                if(!message.guild){
                    message.channel.send(":warning: This command can't be used in a DM channel.");
                    return;
                }
                if(message.getSetting("trivia.singleOnly") && runningGames.indexOf(message.channel.id) > -1){
                    message.channel.send(":warning: Only one trivia game can run at a time");
                    return;
                }
                bot.tasks.startTask("trivia", message.id);
                message.channel.startTyping();
                runningGames.push(message.channel.id);
                request(message.guild.getSetting("trivia.url"), async function triviaResponse(err, resp, body){
                    if(err){
                        Sentry.captureException(err);
                        message.replyLang("TRIVIA_ERROR");
                        if(runningGames.indexOf(message.channel.id) > -1)
                            runningGames.splice(runningGames.indexOf(message.channel.id), 1); //Is this right?
                        message.channel.stopTyping();
                        bot.tasks.endTask("trivia", message.id);
                        return;
                    }
                    scope.addBreadcrumb({
                        message: "Got Trivia message",
                        level: Sentry.Severity.Info,
                        category: "Trivia",
                        data: {body}
                    });
                    try{
                        const data = JSON.parse(body);
                        const question = data.results[0];
                        if(question){
                            const correctAnswer = question.correct_answer;
                            let answers = question.incorrect_answers;
                            answers.push(correctAnswer);
                            bot.util.shuffle(answers);
                            const isBoolean = question.type === "boolean";

                            let embed = new Discord.MessageEmbed();

                            embed.setTitle(await bot.lang.getTranslation(message.guild.id, "TRIVIA_SECONDS", {seconds: message.getSetting("trivia.seconds")}));
                            embed.setDescription(decodeURIComponent(question.question));
                            embed.setAuthor(await bot.lang.getTranslation(message.guild.id, "TRIVIA_CATEGORY", {category: decodeURIComponent(question.category)}));
                            embed.setColor(difficultyColours[question.difficulty]);

                            if(isBoolean){
                                embed.addField(
                                    await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", {answer: "TRUE"}),
                                    await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", {reaction: ":white_check_mark:"}), true);
                                embed.addField(
                                    await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", {answer: "FALSE"}),
                                    await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", {reaction: ":negative_squared_cross_mark:"}), true)
                            }else{
                                for(let i = 0; i < answers.length; i++){
                                    embed.addField(
                                        await bot.lang.getTranslation(message.guild.id, "TRIVIA_FOR", {answer: decodeURIComponent(answers[i])}),
                                        await bot.lang.getTranslation(message.guild.id, "TRIVIA_REACT", {reaction: numbers[i]}), true)
                                }
                            }

                            const sentMessage = await message.channel.send("", embed);
                            const reactions = isBoolean ? ["❎", "✅"] : ["1⃣", "2⃣", "3⃣", "4⃣"];
                            const correctReaction = reactions[answers.indexOf(correctAnswer)];

                            sentMessage.awaitReactions((reaction, user) => reactions.indexOf(reaction.emoji.name) > -1 && user.id === bot.client.user.id, {time: message.getSetting("trivia.seconds")*1000})
                                .then(async function triviaEnded(reactionResult){
                                    message.channel.startTyping();
                                    const permissions = await message.channel.permissionsFor(bot.client.user);
                                    if(!permissions) {
                                        bot.tasks.endTask("trivia", message.id);
                                        return bot.logger.log("Left server before trivia ended");
                                    }

                                    if(permissions.has("MANAGE_MESSAGES"))
                                        sentMessage.reactions.removeAll();

                                    let answered = [];
                                    let cheaters = [];
                                    let correct = [];

                                    const reactionArray = reactionResult.array();

                                    for (const reaction of reactionArray) {
                                        const userArray = reaction.users.cache.array();
                                        for (const user of userArray) {
                                            if(user.id === bot.client.user.id)
                                                continue;
                                            if (cheaters.indexOf(user.id) > -1)
                                                continue;

                                            if (answered.indexOf(user.id) > -1) {
                                                cheaters.push(user.id);
                                                continue;
                                            }
                                            answered.push(user.id);
                                            if(reaction.emoji.name === correctReaction)
                                                correct.push(user.id);
                                        }
                                    }

                                    message.channel.stopTyping();
                                    if(runningGames.indexOf(message.channel.id) > -1)
                                        runningGames.splice(runningGames.indexOf(message.channel.id), 1);

                                    const points = difficulties.indexOf(question.difficulty) + 2;
                                    let output = await bot.lang.getTranslation(message.guild.id, "TRIVIA_TIME_END", {answer: decodeURIComponent(correctAnswer)})+"\n";

                                    if(correct.length === 0){
                                        output += await bot.lang.getTranslation(message.guild.id, "TRIVIA_WIN_NONE")+"\n";
                                    }else{
                                        for(let i = 0; i < correct.length; i++){
                                            if(cheaters.indexOf(correct[i]) > -1)continue;
                                            output +=  `<@${correct[i]}> `;
                                            let streak = await bot.database.incrementStreak(correct[i], "trivia");
                                            if(streak > 1)
                                                output += `(🔥 **${streak}**) `;

                                            bot.database.logTrivia(correct[i], 1, points, message.guild.id).then(async function(){
                                                let count = (await bot.database.getTriviaCorrectCount(correct[i]))[0]['count(*)'];
                                                await bot.badges.updateBadge(await bot.client.users.fetch(correct[i]), 'trivia', count, message.channel);
                                                await bot.badges.updateBadge(await bot.client.users.fetch(correct[i]), 'streak', streak, message.channel);
                                            });
                                        }


                                        output += "\n";

                                        output += await bot.lang.getTranslation(message.guild.id, "TRIVIA_WIN"+ (correct.length === 1 ? "_SINGLE" : ""), {points});
                                    }

                                    for(let i = 0; i < answered.length; i++){
                                        let user = answered[i];
                                        if(correct.indexOf(user) > -1)continue;
                                        bot.logger.log("Ended the streak of "+user);
                                        bot.database.resetStreak(user, "trivia");
                                    }

                                    if(cheaters.length > 0)
                                        output += `\n${cheaters.length} ${cheaters.length === 1 ? "person" : "people"} tried to cheat.\nhttps://tenor.com/view/shame-go-t-game-of-thrones-walk-of-shame-shameful-gif-4949558`

                                    message.channel.send(output);
                                    bot.tasks.endTask("trivia", message.id);
                                });

                            for(let i = 0; i < reactions.length; i++)
                                await sentMessage.react(reactions[i]);
                        }else{
                            bot.tasks.endTask("trivia", message.id);
                            message.replyLang("TRIVIA_ERROR");
                            bot.logger.error("Trivia service gave back no questions!");
                            message.channel.stopTyping();
                            if(runningGames.indexOf(message.channel.id) > -1)
                                runningGames.splice(runningGames.indexOf(message.channel.id), 1);
                        }
                    }catch(e){
                        message.replyLang("TRIVIA_ERROR");
                        bot.logger.error("Trivia service gave unexpected response:");
                        console.log(e);
                        console.log(body);
                        bot.logger.error(e);
                        Sentry.captureException(err);
                    }finally{
                        if(runningGames.indexOf(message.channel.id) > -1)
                            runningGames.splice(runningGames.indexOf(message.channel.id), 1);
                        message.channel.stopTyping();
                    }
                });
            }
        });
    }
};