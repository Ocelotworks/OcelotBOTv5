const  dateformat = require('dateformat');
const userColours = {
    "joel": "red",
    "neil": "green",
    "peter": "green",
    "alex": "magenta",
    "holly": "yellow",
    "jake": "blue",
    "ocelotbot": "red",
    "abbey": "black"
}

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
            let output = "```ansi\n";
            for(let i = 0; i < messageContext.length; i++){
                const msg = messageContext[i];
                const date = dateformat(new Date(msg.time), 'UTC:dd/mm/yy HH:MM:ss Z');
                output += `${("["+date+"]").black} <${msg.user[userColours[msg.user] || "white"]}> ${msg.message===topicMessage ? msg.message.red : msg.message}\n`;
                if(output.length >= 1998)break;
            }
            output += "\n```";
            return output;
        }

        async function shiftUp(){
            left+=3;
            right-=3;
            await context.edit({content: await generateOutput()}, sentMessage);
            clearTimeout(cancelTimer);
            cancelTimer = setTimeout(cancel, 32000);
            return {type: 6}
        }

        async function shiftDown(){
            left-=3;
            right+=3;
            context.edit({content: await generateOutput()}, sentMessage);
            clearTimeout(cancelTimer);
            cancelTimer = setTimeout(cancel, 32000);
            return {type: 6}
        }

        async function resetPos(){
            left = 5;
            right = 5;
            context.edit({content: await generateOutput()}, sentMessage);
            clearTimeout(cancelTimer);
            cancelTimer = setTimeout(cancel, 32000);
            return {type: 6}
        }

        async function cancel(){
            context.edit({components: []}, sentMessage);
        }

        let cancelTimer = setTimeout(cancel, 32000)

        if(messageID[0]){
            const up = bot.interactions.addAction("⬆", 1, shiftUp, 120000);
            const reset = bot.interactions.addAction("⏹", 1, resetPos, 120000);
            const down = bot.interactions.addAction("⬇", 1, shiftDown, 120000);
            sentMessage = await context.send({content: await generateOutput(), components: [bot.util.actionRow(up, reset, down)]});
            return;
        }
        if(user === "joel")
            return context.send({
                content: "The context for this topic is unavailable for legal reasons",
            });

        return context.send({content: "Topic not found in database.", embeds:[{
            image: {
                url: "https://media0.giphy.com/media/6uGhT1O4sxpi8/giphy.gif"
            }
        }]})
    }
};