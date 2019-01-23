module.exports = {
    name: "Eval Script Locally",
    usage: "evallocal <script>",
    commands: ["evallocal"],
    run: async function(message, args, bot){
        try {
            let output = `\`\`\`\n${eval(message.content.substring(args[0].length+args[1].length+2))}\n\`\`\``;
            message.channel.send(output);
        }catch(e){
            message.channel.send("Error\n```\n"+e+"\n```");
        }
    }
};