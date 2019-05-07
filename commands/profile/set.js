/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/03/2019
 * ╚════ ║   (ocelotbotv5) set
 *  ════╝
 */


const keyTypes = {
    background: "background",
    bg: "background",
    board: "board",
    frames: "frame",
    frame: "frame",
    font: "font"
};

const premiumTypes = ["font"];

module.exports = {
    name: "Customise Profile",
    usage: "set",
    commands: ["set"],
    run: async function(message, args, bot){
        const helpMessage = `:information_source: Profile Set:
${args[0]} set tagline <tagline>
${args[0]} set background <background>
${args[0]} set frame <frame>
${args[0]} set board <board>
${args[0]} set font <font> **(<:ocelotbot:533369578114514945> Premium Only)**`;
        if(!args[2]){
            message.channel.send(helpMessage);
        }else if (args[2].toLowerCase() === "tagline" && args[3]){
            const tagline = message.cleanContent.substring(args[0].length+args[1].length+args[2].length+3);
            if(tagline.length > 45){
                message.channel.send(":warning: Tagline must be 45 characters or less.");
            }else{
                await bot.database.setProfileTagline(message.author.id, tagline);
                message.channel.send(`Tagline set to \`${tagline}\``);
            }

        }else {
            const key = args[2].toLowerCase().replace(/[<>]/g, "");
            if (!keyTypes[key]) {
                message.channel.send(helpMessage);
            } else if (premiumTypes.indexOf(key) > -1 && !(message.getSetting("premium") && message.getSetting("premium") === "1")) {
                message.channel.send(`:bangbang: This requires **<:ocelotbot:533369578114514945> Ocelot Premium**. To find out more, type ${message.getSetting("prefix")}premium`);
            } else {
                let keyType = keyTypes[key] || "";
                if(!args[3])return message.channel.send(`:bangbang: Usage: ${args[0]} ${args[1]} ${args[2]} <${keyType}>. To find a ${keyType}, type **${args[0]} ${keyType}s**`);
                const item = (await bot.database.getProfileOptionByKey(args[3], keyType))[0];
                if (item) {
                    if(keyType === "frame")keyType += "s"; //Fuck myself
                    await bot.database.setProfileOption(message.author.id, keyType, item.id);
                    message.channel.send(`Set ${keyType} to ${item.name}`);
                } else {
                    message.channel.send(`:warning: Invalid ${keyType}. Try ${args[0]} ${keyType}`);
                }
            }
        }
    }
};

