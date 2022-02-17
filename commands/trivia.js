const Sentry = require('@sentry/node');
const Embeds = require("../util/Embeds");

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

let runningGames = [];

let sessionTokens = {};

const {axios} = require('../util/Http');
const Strings = require("../util/String");

module.exports = {
    name: "Trivia",
    usage: "trivia :0category?",
    rateLimit: 2,
    commands: ["trivia"],
    categories: ["fun", "games"],
    requiredPermissions: ["EMBED_LINKS", "ADD_REACTIONS"],
    nestedDir: "trivia",
    run: async function run(context, bot) {
        if(!context.channel)
            return context.send("Congratulations! You've encountered a bug that I'm not sure how to fix as I am unable to replicate it.\nPLEASE Reach out to me (Big P#1843) or via the feedback server and tell me you got this so I can ask you some questions. Thank you!")
        if(runningGames.includes(context.channel.id))
            return context.sendLang({content: "TRIVIA_SINGLE", ephemeral: true});

        try {
            runningGames.push(context.channel.id);
            const token = await getSessionToken(context.channel.id)

            const result = await axios.get(`https://opentdb.com/api.php?amount=1&category=${context.options.category || ""}&encode=url3986&token=${token}`);
            if(!result.data?.results?.length) {
                removeGame(context.channel.id);
                if(context.options.category) {
                    return context.sendLang({
                        content: "TRIVIA_UNKNOWN_CATEGORY",
                        ephemeral: true,
                        components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "categories"))]
                    });
                }
                return context.sendLang({content: "TRIVIA_QUESTIONS_EXHAUSTED", ephemeral: true});
            }

            const question = result.data.results[0];
            const embed = new Embeds.LangEmbed(context);
            embed.setColor(difficultyColours[question.difficulty]);
            embed.setTitleLang(question.type === "boolean" ? "TRIVIA_TRUE_FALSE" : "TRIVIA_MULTIPLE_CHOICE");
            let category = decodeURIComponent(question.category);
            if(context.options.category)
                category += ` (ID: ${context.options.category})`;
            embed.setAuthorLang("TRIVIA_CATEGORY",{category});
            embed.setDescription(decodeURIComponent(question.question));
            embed.setFooterLang("TRIVIA_SECONDS", null, {seconds: 30});
            const answers = question.type === "boolean" ? [{text: "True", emoji: "✅", style: 3}, {text: "False", emoji: "❌", style: 4}] :
                question.incorrect_answers.concat(question.correct_answer).map((a)=>({text: Strings.Truncate(decodeURIComponent(a), 80), style: 1}));

            let answerMap = {};
            let userAnswers = {};
            function recordAnswer(interaction, context){
                userAnswers[interaction.user.id] = answerMap[interaction.customId];
                return context.send({content: `✅ You have selected: ${answerMap[interaction.customId]}`, ephemeral: true})
            }

            // Annoying
            let output = {components: [{
                    type: 1,
                    components: []
                }]};
            bot.util.shuffle(answers);
            for(let i = 0; i < answers.length; i++){
                const answer = answers[i];
                embed.addField(`Option ${i+1}`, answer.text, true);
                const answerButton = bot.interactions.addAction(answer.text, answer.style, recordAnswer, 32000, answer.emoji);
                answerMap[answerButton.custom_id] = answer.text;
                output.components[0].components.push(answerButton);
            }
            output.embeds = [embed];
            let sentMessage = await context.send(output);

            setTimeout(async ()=>{
                removeGame(context.channel.id);
                if((!context.channel && !context.guild) || context.channel.deleted || context.guild?.deleted){
                    bot.logger.log("Guild or channel was deleted before game completed");
                    return;
                }
                let correct = [];
                let lostStreaks = [];
                context.edit({components: []}, sentMessage);
                const users = Object.keys(userAnswers);
                const difficulty = difficulties.indexOf(question.difficulty)+1;
                const correctAnswer = decodeURIComponent(question.correct_answer);
                for(let i = 0; i < users.length; i++){
                    if(!userAnswers.hasOwnProperty(users[i]))continue
                    bot.database.logTrivia(users[i], userAnswers[users[i]] === correctAnswer, difficulty, context.guild?.id || context.channel.id).then(()=>null)
                    if(userAnswers[users[i]] === correctAnswer) {
                        this.incrementStat(context.guild?.id, users[i], "trivia_correct");
                        let streak = await bot.database.incrementStreak(users[i], "trivia");
                        correct.push({user: users[i], streak});
                    }else{
                        this.incrementStat(context.guild?.id, users[i], "trivia_incorrect");
                        let lostStreak = await bot.database.resetStreak(users[i], "trivia");
                        if(lostStreak > 2)lostStreaks.push({user: users[i], streak: lostStreak})
                    }

                }

                let output = `${context.getLang("TRIVIA_TIME_END", {answer: correctAnswer})}\n`;
                if(correct.length === 0)
                    output += context.getLang("TRIVIA_WIN_NONE");
                else if(correct.length === 1)
                    output += context.getLang("TRIVIA_WIN_SINGLE", {user: formatStreakedUser(correct[0]), points: difficulty});
                else
                    output += context.getLang("TRIVIA_WIN", {users: correct.map((u)=>formatStreakedUser(u)).join(", "), points: difficulty})

                if(lostStreaks.length === 1)
                    output += `\n<@${lostStreaks[0].user}> lost their winning streak of 🔥${lostStreaks[0].streak.toLocaleString()} :(`;
                if(lostStreaks.length > 1)
                    output += `\n<@${lostStreaks.map((s)=>s.user).join(">, <@")}> lost their winning streaks :(`;
                let suggestedButton = bot.interactions.fullSuggestedCommand(context, `trivia ${context.options.category || ""}`);
                if(suggestedButton) {
                    suggestedButton.label = "Play Again";
                    suggestedButton.style = 1;
                }
                return context.send({content: output, components: [bot.util.actionRow(suggestedButton)]})
            }, 30000);
        }catch(e){
            console.log(e);
            Sentry.captureException(e);
            removeGame(context.channel.id);
            return context.sendLang({content: "TRIVIA_ERROR", ephemeral: true});
        }
    }
};

function formatStreakedUser(obj){
    let output = `<@${obj.user}>`
    if(obj.streak > 1){
        output += ` (${Strings.NCharacters(Math.floor(obj.streak / 10)+1, "🔥")}${obj.streak})`
    }
    return output;
}

setInterval(()=>{
    runningGames = [];
}, 30000)

setInterval(()=>{
    sessionTokens = {};
}, 7200000)

function removeGame(channel){
    runningGames.splice(runningGames.indexOf(channel), 1)
}

async function getSessionToken(channel){
    if(sessionTokens[channel])return sessionTokens[channel];
    let result = await axios.get("https://opentdb.com/api_token.php?command=request");
    sessionTokens[channel] = result.data.token;
    return result.data.token;
}