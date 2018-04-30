/**
 * Created by Peter on 02/07/2017.
 */
const config = require('config');
const request = require('request');
module.exports = {
    name: "Weather",
    usage: "weather <place>",
    accessLevel: 0,
    commands: ["weather", "forecast"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.embedLinks)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: ":warning: This command requires the permission **Embed Links**"
			});
			return;
		}
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: ":bangbang: Invalid usage. !weather <search>"
            });
        }else {
            var search = message.substring(message.indexOf(args[1]));
            bot.ipc.emit("instanceBusy", {instance: bot.instance});
            request(`http://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${config.get("Commands.weather.key")}&units=metric`, function getWeather(err, resp, body) {
                if (err) {
                    bot.logger.error("Error getting weather information: " + err);
                    bot.sendMessage({
                        to: channel,
                        message: ":bangbang: Error contacting weather API."
                    });
                } else {
                    var data = JSON.parse(body);
                    if (data && data.weather && data.weather[0] && data.weather[0].main) {
                        bot.logger.log("Got weather for " + search);
                        var attachments = [{
                            fallback: `${data.name}: ${data.weather[0].main} - ${data.weather[0].description} ${data.main.temp}C`,
                            color: module.exports.colourFromTemperature(data.main.temp),
                            author_name: data.weather[0].main,
                            author_link: `http://openweathermap.org/find?utf8=%E2%9C%93&q=${search}`,
                            author_icon: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`,
                            title: data.name,
                            text: data.weather[0].description,
                            fields: [
                                {
                                    title: "Temperature",
                                    value: data.main.temp + "C",
                                    short: true
                                },
                                {
                                    title: "High/Low",
                                    value: `${data.main.temp_max}C/${data.main.temp_min}C`,
                                    short: true
                                },
                                {
                                    title: "Winds",
                                    value: `${data.wind.speed} mph`,
                                    short: true
                                }
                            ]
                        }];


                        recv.sendAttachment(channel, "", attachments);
                    } else {
                        recv.sendMessage({
                            to: channel,
                            message: `:warning: Couldn't find weather for '${search}'.`
                        });

                    }
                    bot.ipc.emit("instanceFree", {instance: bot.instance});
                }
            });
        }
    },
    colourFromTemperature: function(temperature){
        if(temperature < -10)   return "#f6fff4";
        if(temperature < 0)     return "#ccffff";
        if(temperature < 5)     return "#00cdff";
        if(temperature < 10)    return "#1ab2ff";
        if(temperature < 15)    return "#ffd97b";
        if(temperature < 20)    return "#ffb31a";
        if(temperature < 30)    return "#ff6600";
        if(temperature < 40)    return "#ff3300";
        if(temperature < 50)    return "#cc2a1a";
        if(temperature > 50)    return "#cc0210";
    },
};