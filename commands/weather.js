/**
 * Created by Peter on 02/07/2017.
 */
const config = require('config');
const {axios} = require('../util/Http');
module.exports = {
    name: "Weather",
    usage: "weather :place+",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["weather", "forecast"],
    categories: ["tools"],
    run: async function run(context, bot) {
        const search = context.options.place;
        const result = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(search)}&appid=${config.get("API.openweathermap.key")}&units=metric`).catch(()=>null);
        if(!result)
            return context.sendLang({content: "WEATHER_ERROR", ephemeral: true});
        const weather = result.data?.weather?.[0]?.main;
        if (!weather)
            return context.sendLang({content: "WEATHER_INVALID_PLACE", ephemeral: true}, {place: search});
        bot.logger.log(`Got weather for ${search}`);
        const attachments = {
            color: module.exports.colourFromTemperature(result.data.main.temp),
            thumbnail: {
                url: `http://openweathermap.org/img/w/${result.data.weather[0].icon}.png`,
            },
            author: {
                name: result.data.weather[0].main,
                icon_url: `http://openweathermap.org/img/w/${result.data.weather[0].icon}.png`,
            },
            title: result.data.name,
            description: result.data.weather[0].description,
            fields: [
                {
                    name: "Temperature",
                    value: result.data.main.temp + "C",
                    inline: true
                },
                {
                    name: "High/Low",
                    value: `${result.data.main.temp_max}C/${result.data.main.temp_min}C`,
                    inline: true
                },
                {
                    name: "Winds",
                    value: `${result.data.wind.speed} mph`,
                    inline: true
                }
            ]
        };
        return context.send({embeds: [attachments]});
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