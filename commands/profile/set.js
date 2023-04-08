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
    usage: "set [type?:tagline,background] :name+?",
    commands: ["set"],
    run: async function (context, bot) {
        const helpMessage = `:information_source: Profile Set:
/${context.command} set tagline <tagline>
/${context.command} set background <background>`;
// ${context.command} set frame <frame>
// ${context.command} set board <board>
// ${context.command} set font <font> **(<:ocelotbot:533369578114514945> Premium Only)**`;
        if (!context.options.type) {
            context.send(helpMessage);
        } else if (context.options.type.toLowerCase() === "tagline" && context.options.name) {
            const tagline = context.options.name;
            if (tagline.length > 140) {
                context.send(`:warning: Tagline must be 140 characters or less. Yours is ${tagline.length} characters.`);
            } else {
                await bot.database.setProfileTagline(context.user.id, tagline);
                context.send(`Tagline set to \`${tagline}\``);
            }

        } else {
            const key = context.options.type.toLowerCase().replace(/[<>]/g, "");
            if (!keyTypes[key]) {
                context.send(helpMessage);
            } else if (premiumTypes.indexOf(key) > -1 && !(context.getSetting("premium") && context.getSetting("premium") === "1")) {
                context.send(`:bangbang: This requires **<:ocelotbot:533369578114514945> Ocelot Premium**. To find out more, type ${context.getSetting("prefix")}premium`);
            } else {
                let keyType = keyTypes[key] || "";
                if (!context.options.name) return context.send(`:bangbang: Usage: /${context.command} ${context.options.type} <${keyType}>. To find a ${keyType}, type **/${context.command} ${keyType}s**`);
                const item = (await bot.database.getProfileOptionByKey(context.options.name, keyType))[0];
                if (item) {
                    if (keyType === "frame") keyType += "s"; //Fuck myself
                    await bot.database.setProfileOption(context.user.id, keyType, item.id);
                    context.send(`Set ${keyType} to ${item.name}`);
                } else {
                    context.send(`:warning: Invalid ${keyType}. Try /${context.command} ${keyType}`);
                }
            }
        }
    }
};

