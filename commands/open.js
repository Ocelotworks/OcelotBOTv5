/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/03/2019
 * ╚════ ║   (ocelotbotv5) open
 *  ════╝
 */

const Discord = require('discord.js');
const crateTypes = [
    {
        name: "Another OcelotCRATE",
        desc: "On the house!",
        image: "https://i.imgur.com/0JkoaVs.png"
    },
    {
        name: "Big P's Nudes",
        desc: "Naughty",
        image: "https://i.imgur.com/hzxKzjt.png"
    },
    {
        name: "A potato",
        desc: "Don't tell the Irish",
        image: "https://cdn.shopify.com/s/files/1/1017/2183/t/9/assets/live-preview-potato.png?1659621888658263958"
    },
    {
        name: "A potato with eyes",
        desc: "DEFINITELY don't tell the Irish",
        image: "https://www.veggieprezi.com/wp-content/uploads/2017/09/20170731_214129-555x688.jpg"
    },
    {
        name: "NotSoBot",
        desc: "Wait, how the fuck did that get in there?",
        image: "https://vignette.wikia.nocookie.net/hamy-shanky/images/0/08/NotSoBot.PNG/revision/latest?cb=20170917161125"
    },
    {
        name: "Nothing",
        desc: "That's anticlimactic"
    },
    {
        name: "A will to live",
        desc: "Finally!"
    },
    {
        name: "A bug in OcelotBOT",
        desc: "undefined"
    },
    {
        name: "A spider",
        desc: "FUCK",
        image: "https://ichef.bbci.co.uk/news/660/cpsprodpb/12631/production/_103331357_spider2.jpg"
    },
    {
        name: "A stock photo",
        desc: "funny corn lady",
        image: "https://i.kym-cdn.com/photos/images/newsfeed/000/954/161/b3a.jpg"
    },
    {
        name: "Yikes",
        desc: "Yikes, dude",
        image: "https://cdn.discordapp.com/emojis/499354390126264340.png?v=1"
    },
    {
        name: "OcelotBOT",
        desc: "It's all yours!",
        image: "https://images.discordapp.net/avatars/146293573422284800/9453e8e5b0394839542074338bb5c0f4.png?size=512"
    },
    {
        name: "You should never see this",
        desc: "If you do, I fucked up!"
    },
    {
        name: "Rick Astley",
        desc: "He's never gonna give you up",
        image: "https://twt-thumbs.washtimes.com/media/image/2017/07/27/Screen_Shot_2017-07-27_at_4.37.31_PM_c37-0-1103-622_s885x516.png?1d4ab247c526fe17a56499a882acf7dd410101b8"
    },
    {
        name: "A raccoon!",
        desc: "He's so cute",
        image: "https://images.mentalfloss.com/sites/default/files/styles/mf_image_16x9/public/527175-istock-514622028.jpg?itok=7pVBZr-X&resize=1100x1100"
    },
    {
        name: "A raccoon!",
        desc: "This one isn't so cute",
        image: "https://media.11alive.com/assets/WXIA/images/590497635/590497635_750x422.jpg"
    },
    {
        name: "Danny DeVito",
        desc: "Suicide is badass!",
        image: "https://i.kym-cdn.com/photos/images/newsfeed/001/057/817/e6a.png"
    },
    {
        name: "Egg",
        desc: "egg",
        image: "https://static.standard.co.uk/s3fs-public/thumbnails/image/2019/01/14/09/worldrecordegg1401a.jpg?w968"
    }
];

let crateIndex = 0;

module.exports = {
    name: "Open OcelotCRATE",
    usage: "open",
    categories: ["fun", "meta"],
    rateLimit: 10,
    hidden: true,
    commands: ["open", "crate"],
    init: function(bot){
        bot.crates = {};


        bot.bus.on("commandPerformed", function giveCrate(command, message){
            if(!message.guild)return;
            const now = new Date();
            if(now.getDay() !== 1 && now.getMonth() !== 3)return;
            if(Math.random() > message.getSetting("crate.chance")){
                if(bot.crates[message.author.id])
                    bot.crates[message.author.id]++;
                else
                    bot.crates[message.author.id] = 1;

                let embed = new Discord.RichEmbed();
                embed.setThumbnail("https://i.imgur.com/0JkoaVs.png");
                embed.setTitle("You got an OcelotCRATE");
                embed.setDescription(`Open it with ${message.getSetting("prefix")}open`);
                embed.setColor("#3ba13b");
                message.channel.send("", embed);
                bot.logger.log(`Giving a crate to ${message.author.username} (${message.author.id})`);
            }
        });

    },
    run: async function run(message, args, bot) {
       const now = new Date();
       if(now.getDay() !== 1 && now.getMonth() !== 3)return;
       if(bot.crates[message.author.id] && bot.crates[message.author.id] > 0){


           let i = crateIndex % crateTypes.length;

            if(i === 12) {
                let hasBadge = await bot.database.hasBadge(message.author.id, 53);
                if (!hasBadge) {
                    bot.badges.giveBadge(message.author, message.channel, 53);
                }else{
                    i = 0;
                }
            }

            const crate = crateTypes[i];

            let embed = new Discord.RichEmbed();

            embed.setTitle(`You got: ${crate.name}`);
            embed.setDescription(crate.desc);
            embed.setThumbnail("https://i.imgur.com/0JkoaVs.png");
            embed.setColor("#3ba13b");
            if(crate.image)
                embed.setImage(crate.image);

            message.channel.send("", embed);

            if(i !== 0)
                bot.crates[message.author.id]--;

            bot.logger.log(bot.crates[message.author.id]);

            crateIndex++;
       }else{
           message.channel.send("You don't have any crates!");
       }

    }
};