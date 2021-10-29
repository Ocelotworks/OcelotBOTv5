const questions = ["am", "are", "is", "will", "does", "can", "should", "r", "czy", "could", "when", "has", "what", "why", "how", "did", "where", "do", "thats", "that's"]

module.exports = {
    name: "Magic 8-ball",
    usage: "8ball :question+",
    detailedHelp: "Gives an 8-ball style response to your question",
    usageExample: "8ball is OcelotBOT the best bot ever made?",
    responseExample: "🎱 `It is certain.`",
    categories: ["fun"],
    commands: ["8ball", "magic8ball"],
    argDescriptions: {question: {name: "The question to ask the Magic 8-ball"}},
    handleError: function(context){
      return context.sendLang("8BALL_NO_QUESTION");
    },
    run: function run(context) {
        let question = context.options.question;
        let firstWord = context.options.question.split(" ")[0];
        return context.sendLang(`8BALL_RESPONSE_${context.getSetting("8ball.rig") || (questions.indexOf(firstWord) + question.length + context.user.id[context.user.id.length - 1]) % 14}`);
    }
};