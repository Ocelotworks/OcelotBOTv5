module.exports = {
    name: "Eval Script",
    usage: "eval <script>",
    commands: ["spookend"],
    run: async function(message, args, bot){
        message.channel.send("Activating Spook End");
        bot.doSpookEnd();
    }
};