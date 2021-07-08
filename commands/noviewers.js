const Discord = require('discord.js');
module.exports = {
    name: "Random 0 views Twitch stream",
    usage: "noviews",
    detailedHelp: "Returns a random twitch live stream with no viewers",
    categories: ["fun"],
    commands: ["noviews", "zeroviews", "noviewers"],
    run: async function run(context, bot) {
        let result = await bot.util.getJson("https://nobody.live/stream");
        let embed = new Discord.MessageEmbed();
        embed.setTitle(result.title);
        embed.setColor("#6441a5");
        embed.setAuthor(result.user_name, "https://assets.help.twitch.tv/Glitch_Purple_RGB.png");
        embed.setImage(result.thumbnail_url.replace("{width}", 800).replace("{height}", 600))
        embed.setDescription(`${result.user_name} is streaming ${result.game_name} to ${result.viewer_count} viewers. [Watch](https://twitch.tv/${result.user_name})`);
        embed.setTimestamp(new Date(result.started_at))
        embed.setFooter("Started Streaming: ");
        return context.send({embeds: [embed]});
    }
};