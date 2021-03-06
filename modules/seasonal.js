const config = require('config');
module.exports = {
    name: "Seasonal Avatars",
    init: function init(bot) {
        const imagePath = "static/";
        const defaultImage = imagePath + "ocelotbot_normal.png";
        const now = new Date();
        const year = now.getFullYear();
        const seasons = config.get("Seasonal");
        for (let i = 0; i < seasons.length; i++) {
            const season = seasons[i];
            const start = new Date(`${season.start} ${year}`);
            const end = new Date(`${season.end} ${year}`);
            const image = imagePath + season.image;
            const startTimeDiff = start - now;
            const endTimeDiff = end - now;
            if (startTimeDiff > 0) {
                bot.logger.log(`Setting profile pic to ${image} in ${startTimeDiff}ms (${start} - ${end})`);
                bot.util.setLongTimeout(function () {
                    bot.logger.log(`Setting profile pic to ${image}`);
                    bot.client.user.setAvatar(image);
                }, startTimeDiff);

                bot.util.setLongTimeout(function () {
                    bot.logger.log(`Setting profile pic to ${defaultImage}`);
                    bot.client.user.setAvatar(defaultImage);
                }, endTimeDiff);
            }
        }
    }
};