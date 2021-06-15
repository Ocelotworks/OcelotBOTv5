const questions = ["am", "are", "is", "will", "does", "can", "should", "r", "czy", "could", "when", "has", "what", "why", "how", "did", "where", "do", "thats", "that's"]

module.exports = {
    name: "Magic 8-ball",
    usage: "8ball <question>",
    detailedHelp: "Gives an 8-ball style response to your question",
    usageExample: "8ball is OcelotBOT the best bot ever made?",
    responseExample: "🎱 `It is certain.`",
    categories: ["fun"],
    commands: ["8ball", "magic8ball"],
    slashOptions: [{type: "STRING", name: "question", description: "The question to ask the Magic 8-ball", required: true}],
    run: function run(message, args) {
        return message.replyLang(args.length < 2 ? "8BALL_NO_QUESTION" : `8BALL_RESPONSE_${message.getSetting("8ball.rig") || (questions.indexOf(args[1]) + message.content.length + message.author.id[message.author.id.length - 1]) % 14}`);
    },
    runSlash: function runSlash(interaction, bot){
        return interaction.replyLang(`8BALL_RESPONSE_${questions.indexOf(interaction.options.get("question").value.split(" ")[0]) + (interaction.options.get("question").value.length + interaction.user.id[interaction.user.id.length - 1]) % 14}`)
    }
};