/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) set
 *  ════╝
 */
const Strings = require("../../util/String");
module.exports = {
    name: "Set Setting",
    usage: "set :setting :value+",
    commands: ["set"],
    run: async function (context, bot, data) {
        let setting = await bot.database.getSettingAssoc(context.options.setting);
        if(!setting)return context.send({
            content: `Couldn't find a setting by that name. Try ${context.getSetting("prefix")}settings list`,
            ephemeral: true,
            components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "list"))]
        });
        let cleanValue;
        switch(setting.type){
            case "boolean":
                cleanValue = Strings.Bools[context.options.value.toLowerCase()]
                if(cleanValue === undefined)
                    return context.send({content: "This setting can only be set to 'on' or 'off'", ephemeral: true});
                break;
            case "number":
                cleanValue = parseInt(context.options.value);
                if(isNaN(cleanValue))
                    return context.send({content: "This setting can only be set a whole number.", ephemeral: true});
                break;
            case "string":
                cleanValue = context.options.value;
                if(cleanValue.length > 2000)
                    return context.send({content: "Value must be less than 2000 characters.", ephemeral: true});
                break;
            default:
                bot.logger.warn(`Unknown setting type ${setting.type}`);
                break;
        }
        await bot.config.set(context.guild.id, setting.setting, cleanValue);
        if(typeof cleanValue === "boolean")
            return context.send(`✅ Successfully ${cleanValue ? "enabled" : "disabled"} ${setting.name}.`);
        return context.send(`✅ Successfully set ${setting.name} to ${cleanValue}`)
    }
};