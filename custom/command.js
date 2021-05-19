const blacklistedSettings = ["premium", "serverPremium", "admin", "ocelotworks"];
module.exports = {
    type: "command",
    run: function(message, response, bot){
        // Garbage in, Garbage out
        const syntheticMessage = Object.assign(Object.create(Object.getPrototypeOf(message)), message);
        syntheticMessage.synthetic = true;
        syntheticMessage.content = response.content;
        syntheticMessage.cleanContent = response.content;
        syntheticMessage.client = bot.client;
        // I'm a genius bro
        syntheticMessage.getSetting = (setting)=>{
            if(response.settings &&
                !blacklistedSettings.includes(setting) &&
                response.settings[setting])return response.settings[setting];
            return message.getSetting(setting);
        }
        syntheticMessage.getBool = (setting)=>{
            const result = syntheticMessage.getSetting(setting);
            return result === "true" || result === "1";
        }

        syntheticMessage.channel = Object.assign(Object.create(Object.getPrototypeOf(message.channel)), message.channel)
        syntheticMessage.channel.client = bot.client;
        syntheticMessage.channel.getSetting = syntheticMessage.getSetting;
        syntheticMessage.channel.getBool = syntheticMessage.getBool;


        syntheticMessage.getLang = (key, format = {})=>{
            if(response.settings && response.settings[key]){
                format.botName = bot.client.user.username;
                format.prefix = bot.config.get(message.guild.id, "prefix", message.author.id);
                return response.settings[key].formatUnicorn(format);
            }
            return message.getLang(key, format);
        }
        return bot.runCommand(syntheticMessage)
    }
}