/**
 * Ported by Neil - 30/04/18
 */
const { getCode } = require('country-list');
const Discord = require('discord.js');

const request = require('request');
const orientations = [
    "straight",
    "gay",
    "tranny"
];
module.exports = {
    name: "Porn Suggest",
    usage: "pornsuggest [country] [gay/straight/tranny]",
    commands: ["pornsuggest"],
    rateLimit: 5,
    nsfw: true,
    categories: ["nsfw", "fun"],
    init: function(bot){

        let commandCounts = {};

        bot.bus.on("commandPerformed", async function(command, message){
            if(!message.guild)return;
            if(commandCounts[message.guild.id]){
                commandCounts[message.guild.id]++;
            }else{
                commandCounts[message.guild.id] = 1;
            }
            if((message.content.indexOf("pornsuggest") > -1 || message.content.indexOf("help nsfw")  > -1) && commandCounts[message.guild.id] < message.getSetting("pornsuggest.seriousThreshold")){
                await bot.database.setSetting(message.guild.id, "pornsuggest.serious", true);
                await bot.config.reloadCacheForServer(message.guild.id);
                bot.logger.log(`Set serious mode on for ${message.guild.name} (${message.guild.id})`);
            }
        });
    },
    run: function run(message, args, bot) {
        if(message.getSetting("pornsuggest.serious") && message.getSetting("pornsuggest.serious") === "1"){
            if(!args[1])
                return message.channel.send(":bangbang: You must enter a search term.");


            let search = message.cleanContent.substring(args[0].length+1);


            request(`https://www.pornmd.com/straight/${encodeURIComponent(search)}?start=20&ajax=true&limit=20&format=json`, async function getPorn(err, resp, body){
                if(err)
                    return message.replyLang("GENERIC_ERROR");
                try{
                    let data = JSON.parse(body);
                    let images = data.videos;
                    if(images.length === 0){
                        message.channel.send(":warning: No results.");
                        return;
                    }
                    let embed = new Discord.RichEmbed();
                    embed.setAuthor(images[0].source);
                    embed.setTimestamp(new Date(images[0].pub_date));
                    embed.setTitle(images[0].title);
                    embed.setImage(images[0].thumb);
                    const url = "https://pornmd.com"+images[0].link;
                    embed.setURL(url);
                    embed.setDescription(`Rating: ${images[0].video_rating_str}\nDuration: ${images[0].duration}\n[Click here to watch](${url})`);
                    embed.setFooter(`Page 1/${images.length}`);
                    let index = 0;
                    let sentMessage = await message.channel.send("", embed);
                    await sentMessage.react("⬅");
                    await sentMessage.react("➡");
                    sentMessage.awaitReactions(async function processReaction(reaction, user) {
                        if (user.id === bot.client.user.id) return false;

                        if (reaction.emoji.name === "➡") { //Move forwards
                            index++;
                        } else if (reaction.emoji.name === "⬅") { //Move backwards
                            index--;
                        }

                        if (index < 0) index = images.length - 1;
                        if (index > images.length - 1) index = 0;

                        embed.setAuthor(images[index].source);
                        embed.setTimestamp(new Date(images[index].pub_date));
                        embed.setTitle(images[index].title);
                        embed.setImage(images[index].thumb);
                        const url = "https://pornmd.com"+images[index].link;
                        embed.setURL(url);
                        embed.setDescription(`Rating: ${images[index].video_rating_str}\nDuration: ${images[index].duration}\n[Click here to watch](${url})`);
                        embed.setFooter(`Page ${index+1}/${images.length}`);
                        sentMessage.edit("", embed);

                        reaction.remove(user);

                        return true;
                    }, {
                        time: 60000
                    }).then(function removeReactions() {
                        bot.logger.log(`Reactions on !pornsuggest (${message.id}) have expired.`);
                        sentMessage.clearReactions();
                    })
                }catch(e){
                    bot.raven.captureException(e);
                    console.log(e);
                    message.replyLang("GENERIC_ERROR");
                }
            });


            return;
        }
       const country = args[1] ? getCode(args[1]) || args[1] : "";
	   if(args[1] && args[1].length > 5){
		   message.replyLang("PORNSUGGEST_INVALID_COUNTRY");
        }else{
            request(`https://www.pornmd.com/getliveterms?country=${country}&orientation=${args[2] || bot.util.arrayRand(orientations)}`, function(err, resp, body){
                if(err){
					bot.raven.captureException(err);
                    message.replyLang("PORNSUGGEST_ERROR");
                    bot.logger.error(err.stack);
                }else{
                    try{
                        const names = JSON.parse(body);
                        if(names.length === 0){
                            message.replyLang("PORNSUGGEST_NO_TERMS");
                        }else{
							message.replyLang("PORNSUGGEST_RESPONSE", {phrase: bot.util.arrayRand(names).keyword});
                        }
                    }catch(e){
						bot.raven.captureException(e);
						message.replyLang("PORNSUGGEST_INVALID_RESPONSE");
                        bot.logger.error(e.stack);
                    }
                }
            });
        }
    }
};