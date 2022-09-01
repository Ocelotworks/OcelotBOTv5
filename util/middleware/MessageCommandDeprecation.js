const Strings = require("../String");
let seenMessage = {};
module.exports = async (context, bot) => {

    if(context.getBool("messageCommandSubstitution")){
        let slashCommands = await bot.client.application.commands.fetch().then((c)=>c.reduce((acc, data)=>{acc[data.name] = data.id; return acc}, {}));
        let dm = await context.user.createDM();
        if(context.slashHidden) {
            dm.send(":pensive: Sorry, that command is temporarily unavailable whilst we finish migrating to slash commands. For questions, use </feedback:863448603320909864>")
            return false;
        }
        const commandObject = bot.commandObjects[bot.commands[context.command]];
        const trueCommand = commandObject.commands[0];
        let newCommand;
        console.log(commandObject.slashCategory);
        console.log(trueCommand);
        console.log(Object.keys(slashCommands));
        if(commandObject.slashCategory && slashCommands[commandObject.slashCategory]) {
            newCommand = `</${commandObject.slashCategory} ${trueCommand}:${slashCommands[commandObject.slashCategory]}>`;
        }else if(slashCommands[trueCommand]){

            if(context.options.command)
                newCommand = `</${trueCommand} ${context.options.command}:${slashCommands[context.command]}>`;
            else if(commandObject.argDescriptions?.base)
                newCommand = `</${trueCommand} ${commandObject.argDescriptions.base.name}:${slashCommands[context.command]}>`;
            else
                newCommand = `</${trueCommand}:${slashCommands[context.command]}>`;
        }

        dm.send(`:information_source: Message commands are no longer available due to a change in Discord's policy.\n\nFrom now on, please use ${newCommand ? "this command: "+newCommand : "the slash version of this command."}\n\nSorry for the inconvenience, and thank you for using OcelotBOT!`);

        return false;
    }

    if(!context.getBool("messageCommandDeprecation") || context.interaction || !context.message)return true;
    const key = context.interaction || !context.message;
    seenMessage[key] = seenMessage[key]+1 || 0;
    if (seenMessage[key] && seenMessage[key] < 50)return true;
    seenMessage[key] = 0;
    context.appendResponsePrefix(context.getLang("MESSAGE_COMMAND_DEPRECATION"));
    return true;
}