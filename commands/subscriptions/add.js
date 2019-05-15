/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/05/2019
 * ╚════ ║   (ocelotbotv5) add
 *  ════╝
 */
module.exports = {
    name: "Add Sub/View Types",
    usage: "add <type> [data]",
    commands: ["add", "types", "new"],
    run:  async function(message, args, bot, data){
        if(args[2] && bot.subscriptions[args[2]] && args[3]){
            let data = message.content.substring(args[0].length+args[1].length+args[2].length+2);
            let validation = bot.subscriptions[args[2]].validate(data);
            if(validation)
                return message.channel.send(validation);
            let res = await bot.database.addSubscription(message.guild.id, message.channel.id, message.author.id, args[2], args[3]);
            let subObject = {
                server: message.guild.id,
                channel: message.channel.id,
                user: message.author.id,
                type: args[2],
                data: args[3],
                lastcheck: new Date().getTime(),
                id: res[0]
            };
            if(data.subs[subObject.data]){
                data.subs[subObject.data].push(subObject);
            }else{
                data.subs[subObject.data] = [subObject];
            }
            message.channel.send(":white_check_mark: Your subscription has been added! You will receive messages in this channel whenever there are updates.");
            if(bot.subscriptions[args[2]].added)
                bot.subscriptions[args[2]].added(subObject, bot);

        }else{

            let subs = "";
            for(let sub in bot.subscriptions){
                subs += sub+" :: "+bot.subscriptions[sub].name+"\n";
            }

            let output = `\`\`\`asciidoc
\`To get additional help, type ${args[0]} help [id]'
Available Subscriptions
============
ID :: Name
-
${subs}
\`\`\``;

            message.channel.send(output);
        }
    }
};