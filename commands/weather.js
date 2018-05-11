/**
 * Created by Peter on 02/07/2017.
 */
const config = require('config');
const request = require('request');
module.exports = {
    name: "Weather",
    usage: "weather <place>",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["weather", "forecast"],
    categories: ["tools"],
    run: async function run(message, args, bot) {
        if(args.length < 2){
            message.replyLang("WEATHER_NO_ARGS");
            return;
        }
        const search = message.content.substring(args[0].length+1);
        request(`http://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${config.get("Commands.weather.key")}&units=metric`, function getWeather(err, resp, body) {
            if (err) {
                bot.logger.error("Error getting weather information: " + err);
                message.replyLang("WEATHER_ERROR");
            } else {
                const data = JSON.parse(body);
                if (data && data.weather && data.weather[0] && data.weather[0].main) {
                    bot.logger.log(`Got weather for ${search}`);
                    const attachments = {
                        fallback: `${data.name}: ${data.weather[0].main} - ${data.weather[0].description} ${data.main.temp}C`,
                        color: module.exports.colourFromTemperature(data.main.temp),
                        thumbnail: {
                            url: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
                        },
                        author: {
                            name: data.weather[0].main,
                            icon_url: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
                        },
                        title: data.name,
                        description: data.weather[0].description,
                        fields: [
                            {
                                name: "Temperature",
                                value: data.main.temp + "C",
                                inline: true
                            },
                            {
                                name: "High/Low",
                                value: `${data.main.temp_max}C/${data.main.temp_min}C`,
                                inline: true
                            },
                            {
                                name: "Winds",
                                value: `${data.wind.speed} mph`,
                                inline: true
                            }
                        ]
                    };

                    message.channel.send("", {embed: attachments});

                } else {
                    message.replyLang("WEATHER_INVALID_PLACE");
                }
            }
        });
    },
    colourFromTemperature: function(temperature){
        if(temperature < -10)   return 0xf6fff4;
        if(temperature < 0)     return 0xccffff;
        if(temperature < 5)     return 0x00cdff;
        if(temperature < 10)    return 0x1ab2ff;
        if(temperature < 15)    return 0xffd97b;
        if(temperature < 20)    return 0xffb31a;
        if(temperature < 30)    return 0xff6600;
        if(temperature < 40)    return 0xff3300;
        if(temperature < 50)    return 0xcc2a1a;
        if(temperature > 50)    return 0xcc0210;
    },
};