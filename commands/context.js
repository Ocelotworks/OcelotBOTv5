const  dateformat = require('dateformat');
module.exports = {
    name: "Topic Context",
    usage: "context",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["context", "ctx"],
    hidden: true,
    run: async function(message, args, bot){
        if(!message.getSetting("ocelotworks"))return;
        message.channel.startTyping();
        const topic = message.channel.topic;
        const format = topic.substring(1).split("> ");
        const user = format[0];
        const topicMessage = format[1];

        const messageID = await bot.database.getMessageID(user, topicMessage);
        if(messageID[0]){
            const context = await bot.database.getMessageContext(messageID[0].id);
            let output = "```markdown\n";
            for(let i = 0; i < context.length; i++){
                const msg = context[i];
                const date = dateformat(new Date(msg.time), 'UTC:dd/mm/yy HH:MM:ss Z');
                output+= `${msg.message===topicMessage ? "#":" "}[${date}] <${msg.user}> ${msg.message}\n`;
            }
            output += "\n```";
            message.channel.send(output);
        }else{
             message.channel.send("Topic not found in database.");
        }
        message.channel.stopTyping();

    }
};