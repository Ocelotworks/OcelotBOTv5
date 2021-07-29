const  dateformat = require('dateformat');
module.exports = {
    name: "Topic Context",
    usage: "context [actually?:actually]",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["context", "ctx"],
    hidden: true,
    run: async function(context, bot){
        if(!context.getSetting("ocelotworks"))return;
        context.defer();
        const topic = context.channel.topic || context.channel.parent?.topic;
        if(!topic)
            return context.send("Channel has no topic");
        const format = topic.substring(1).split("> ");
        const user = format[0];
        const topicMessage = format[1];

        bot.logger.log(`${user} - ${topicMessage}`);
        const messageID = await bot.database.getMessageID(user, topicMessage);

        let left = 5;
        let right = 5;
        let sentMessage;
        async function generateOutput(){
            const messageContext = await bot.database.getMessageContext(messageID[0].id, left, right);
            let output = "```markdown\n";
            for(let i = 0; i < messageContext.length; i++){
                const msg = messageContext[i];
                const date = dateformat(new Date(msg.time), 'UTC:dd/mm/yy HH:MM:ss Z');
                output+= `${msg.message===topicMessage ? "#":" "}[${date}] <${msg.user}> ${msg.message}\n`;
                if(output.length >= 1998)break;
            }
            output += "\n```";
            return output;
        }

        async function shiftUp(){
            left+=3;
            right-=3;
            await context.edit({content: await generateOutput()}, sentMessage);
            return {type: 6}
        }

        async function shiftDown(){
            left-=3;
            right+=3;
            context.edit({content: await generateOutput()}, sentMessage);
            return {type: 6}
        }

        async function resetPos(){
            left = 5;
            right = 5;
            context.edit({content: await generateOutput()}, sentMessage);
            return {type: 6}
        }

        if(messageID[0]){
            const up = bot.interactions.addAction("⬆", 1, shiftUp, 32000);
            const reset = bot.interactions.addAction("⏹", 1, resetPos, 32000);
            const down = bot.interactions.addAction("⬇", 1, shiftDown, 32000);
            sentMessage = await context.send({content: await generateOutput(), components: [bot.util.actionRow(up, reset, down)]});
            return;
        }
        if(user === "joel")
            return context.send({
                content: "The context for this topic is unavailable for legal reasons",
            });

        return context.send({content: "Topic not found in database.", embeds:[{
            image: {
                url: "https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fentries%2Ficons%2Ffacebook%2F000%2F023%2F967%2Fobiwan.jpg"
            }
        }]})
    }
};