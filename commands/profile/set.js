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
    run: async function (message, args, bot) {
        const helpMessage = `:information_source: Profile Set:
${context.command} set tagline <tagline>
${context.command} set background <background>
${context.command} set frame <frame>
${context.command} set board <board>
${context.command} set font <font> **(<:ocelotbot:533369578114514945> Premium Only)**`;
        if (!args[2]) {
            message.channel.send(helpMessage);
        } else if (args[2].toLowerCase() === "tagline" && args[3]) {
            const tagline = message.cleanContent.substring(context.command.length + args[1].length + args[2].length + 3);
            if (tagline.length > 140) {
                message.channel.send(`:warning: Tagline must be 140 characters or less. Yours is ${tagline.length} characters.`);
            } else {
                await bot.database.setProfileTagline(message.author.id, tagline);
                message.channel.send(`Tagline set to \`${tagline}\``);
            }

        } else {
            const key = args[2].toLowerCase().replace(/[<>]/g, "");
            if (!keyTypes[key]) {
                message.channel.send(helpMessage);
            } else if (premiumTypes.indexOf(key) > -1 && !(message.getSetting("premium") && message.getSetting("premium") === "1")) {
                message.channel.send(`:bangbang: This requires **<:ocelotbot:533369578114514945> Ocelot Premium**. To find out more, type ${message.getSetting("prefix")}premium`);
            } else {
                let keyType = keyTypes[key] || "";
                if (!args[3]) return message.channel.send(`:bangbang: Usage: ${context.command} ${args[1]} ${args[2]} <${keyType}>. To find a ${keyType}, type **${context.command} ${keyType}s**`);
                const item = (await bot.database.getProfileOptionByKey(args[3], keyType))[0];
                if (item) {
                    if (keyType === "frame") keyType += "s"; //Fuck myself
                    await bot.database.setProfileOption(message.author.id, keyType, item.id);
                    message.channel.send(`Set ${keyType} to ${item.name}`);
                } else {
                    message.channel.send(`:warning: Invalid ${keyType}. Try ${context.command} ${keyType}`);
                }
            }
        }
    }
};

