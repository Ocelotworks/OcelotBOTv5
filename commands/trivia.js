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

module.exports = {
    name: "Trivia",
    usage: "trivia :0category?",
    rateLimit: 2,
    commands: ["trivia"],
    categories: ["fun", "games"],
    requiredPermissions: ["EMBED_LINKS", "ADD_REACTIONS"],
    nestedDir: "trivia",
    run: async function run(context, bot) {
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
                question.incorrect_answers.concat(question.correct_answer).map((a)=>({text: decodeURIComponent(a), style: 1}));

            let answerMap = {};
            let userAnswers = {};
            function recordAnswer(interaction){
                userAnswers[interaction.member.user.id] = answerMap[interaction.data.custom_id];
                return {type: 4, data: {flags: 64, content: `✅ You have selected: ${answerMap[interaction.data.custom_id]}`}};
            }

            let output = {components: [bot.util.actionRow()]};
            for(let i = 0; i < answers.length; i++){
                const answer = answers[i];
                embed.addField(`Option ${i+1}`, answer.text, true);
                const answerButton = bot.interactions.addAction(answer.text, answer.style, recordAnswer, 32000, answer.emoji);
                answerMap[answerButton.custom_id] = answer.text;
                output.components[0].components.push(answerButton);
            }
            output.embeds = [embed];
            let sentMessage = await context.send(output);

            setTimeout(()=>{
                removeGame(context.channel.id);
                let correct = [];
                context.edit({components: []}, sentMessage);
                const users = Object.keys(userAnswers);
                const difficulty = difficulties.indexOf(question.difficulty)+1;
                const correctAnswer = decodeURIComponent(question.correct_answer);
                for(let i = 0; i < users.length; i++){
                    if(!userAnswers.hasOwnProperty(users[i]))continue
                    bot.database.logTrivia(users[i], userAnswers[users[i]] === correctAnswer, difficulty, context.guild?.id || context.channel.id)
                    if(userAnswers[users[i]] === correctAnswer)
                        correct.push(users[i]);

                }

                console.log(correct);
                console.log(userAnswers);
                let output = `${context.getLang("TRIVIA_TIME_END", {answer: correctAnswer})}\n`;
                if(correct.length === 0)
                    output += context.getLang("TRIVIA_WIN_NONE");
                else if(correct.length === 1)
                    output += context.getLang("TRIVIA_WIN_SINGLE", {user: `<@${correct[0]}>`, points: difficulty});
                else
                    output += context.getLang("TRIVIA_WIN", {users: correct.map((u)=>`<@${u}>`).join(", "), points: difficulty})
                let suggestedButton = bot.interactions.fullSuggestedCommand(context, `trivia ${context.options.category}`);
                suggestedButton.label = "Play Again";
                suggestedButton.style = 1;
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