const {
    initialize,
    isEnabled,
    getVariant,
} = require('unleash-client');
const config = require('config');
module.exports = {
    name: "Feature Toggles",
    init: function init(bot) {
        bot.feature = {};

        bot.feature.unleash = initialize({
            url: config.get("Unleash.URL"),
            appName: config.get("Unleash.AppName"),
            instanceId: config.get("Unleash.InstanceId"),
            refreshInterval: 60000
        });

        bot.feature.enabledFor = function enabledFor(message, key){
            return isEnabled(key, {
                userId: message.author.id,
                sessionId: message.guild ? message.guild.id : message.channel.id,
            })
        }

        bot.feature.enabled = isEnabled;
        bot.feature.getVariant = getVariant;

    },
}