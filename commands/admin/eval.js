module.exports = {
    name: "Eval Script",
    usage: "eval <script>",
    commands: ["eval"],
    run: async function(message, args, bot){
        let sentMessage = await message.channel.send("Evaluating on all shards...");
        let result = await bot.client.shard.broadcastEval(message.content.substring(args[0].length+args[1].length+2));
        let output = "```\n";
        result.forEach(function(line){
            output += line+"\n";
        });
        output += "\n```";
        sentMessage.edit(output);
    }
};