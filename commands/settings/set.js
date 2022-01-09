/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) set
 *  ════╝
 */
const Strings = require("../../util/String");
const Discord = require("../../util/Discord");
module.exports = {
    name: "Set Setting",
    usage: "set :setting :value+",
    commands: ["set"],
    argDescriptions: {
        setting: {name: "The setting to set", autocomplete: true},
        value: {name: "The value to set it to", autocomplete: true}
    },
    autocomplete: async function(input, interaction, bot) {
        const focus = interaction.options.getFocused(true).name;
        // Setting focus
        if(focus === "setting") {
            if (input.length === 0 || interaction.options.getString("setting") === "")
                return (await bot.database.getSettingsAssoc()).map((k) => ({name: k.name, value: k.setting}));
            return (await bot.database.searchSettingAssoc(input)).map((k) => ({name: k.name, value: k.setting}));
        }

        // Value focus
        const settingName = interaction.options.getString("setting");
        const setting = await bot.redis.cache(`assoc/${settingName}`, async ()=>await bot.database.getSettingAssoc(settingName), 60000);
        const guild = interaction.member.guild;
        switch(setting.type){
            case "boolean":
                return [{name: "Enable", value: "on"}, {name: "Disable", value: "off"}];
            case "role":
                const roles = await guild.roles.fetch();
                return roles.filter((r)=>r.name.toLowerCase().startsWith(input)).map((r)=>({name: r.name, value: r.id}));
            case "text_channel":
            case "voice_channel":
            case "category_channel":
            case "stage_channel":
            case "store_channel":
            case "news_channel":
            case "channel":
                const type = setting.type.split("_")[0].toUpperCase();
                const channels = await guild.channels.fetch();
                return channels.filter((c)=>(type !== "CHANNEL" && c.type === `GUILD_${type}`) && c.name.toLowerCase().startsWith(input)).map((r)=>({name: "#"+r.name, value: r.id}));
            default:
                if(input === "")return [];
                return [{name: input, value: input}]
        }
    },
    run: async function (context, bot, data) {
        let setting = await bot.redis.cache(`assoc/${context.options.setting}`, async ()=>await bot.database.getSettingAssoc(context.options.setting), 60000);
        if(!setting)return context.send({
            content: `Couldn't find a setting by that name. Try ${context.getSetting("prefix")}settings list`,
            ephemeral: true,
            components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "list"))]
        });
        let cleanValue, displayValue;
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
            case "role":
                let role = await Discord.ResolveRole(context.guild, context.options.value)
                if(!role)return context.send({content: "You must enter a valid role name or ID", ephemeral: true});
                cleanValue = role.id;
                displayValue = role.name;
                break;
            case "text_channel":
            case "voice_channel":
            case "category_channel":
            case "stage_channel":
            case "store_channel":
            case "news_channel":
            case "channel":
                let channel = await Discord.ResolveChannel(context.guild, context.options.value)
                if(!channel)return context.send({content: "You must enter a valid channel name or ID. Make sure the channel is visible and accessible to OcelotBOT.", ephemeral: true});
                const channelType = setting.type.split("_")[0];
                if(channelType !== "channel" && channel.type !== `GUILD_${channelType.toUpperCase()}`)
                    return context.send({content: `This setting requires a ${channelType} channel. If you have more than one channel of the same name, tag the correct channel or use the ID.`})
                cleanValue = channel.id;
                displayValue = channel.toString();
                break;
            default:
                bot.logger.warn(`Unknown setting type ${setting.type}`);
                break;
        }
        if(validators[setting.setting] && !(await validators[setting.setting](context, bot, cleanValue)))return;
        await bot.config.set(context.guild.id, setting.setting, cleanValue);
        if(typeof cleanValue === "boolean")
            return context.send(`✅ Successfully ${cleanValue ? "enabled" : "disabled"} ${setting.name}.`);
        return context.send(`✅ Successfully set ${setting.name} to ${displayValue || cleanValue}`)
    }
};

let validators = {
    prefix: (context, bot, cleanValue)=>{
        if(cleanValue.indexOf(" ") > -1){
            context.send("You can't set the prefix to more than one word. Ideally a single character works best like % or !");
            return false;
        }
        if(cleanValue === "value" || cleanValue === "string"){
            context.send(`You probably don't want to set your prefix to ${cleanValue}. Try something like % or !`);
            return false;
        }
        return true;
    },
    lang: (context, bot, cleanValue)=>{
        if(!bot.lang.strings[cleanValue]){
            context.send(`Invalid language, enter a value from ${context.getSetting("prefix")}languages e.g \`en-gb\` or \`el\``);
            return false;
        }
        return true;
    }
}