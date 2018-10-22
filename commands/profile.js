const Discord = require('discord.js');
const canvas = require('canvas');
module.exports = {
    name: "",
    usage: "profile [@user]",
    categories: ["image", "fun"],
    rateLimit: 50,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["profile", "userprofile"],
    init: async function(bot){

        const bg = await canvas.loadImage("static/profile/background.png");

        bot.generateProfileImage = async function generateProfileImage(user){

            let profileInfo = (await bot.database.getProfile(user.id))[0];
            if(!profileInfo){
                bot.logger.log("Creating profile for "+user.id);
                await bot.database.createProfile(user.id);
                profileInfo = {
                    caption: "I'm uninteresting"
                };
            }

            const cnv = canvas.createCanvas(bg.width, bg.height);
            const ctx = cnv.getContext("2d");

            ctx.drawImage(bg,0,0);

            const avatar = await canvas.loadImage(user.avatarURL);

            ctx.drawImage(avatar, 21, 14, 172, 172);

            ctx.font = "30px Sans serif";
            ctx.fillStyle = "white";
            ctx.fillText(user.username+"#"+user.discriminator, 211, 36);

            ctx.font = "15px Sans serif";
            ctx.fillText(profileInfo.caption, 216, 56);

            const badges = await bot.database.getProfileBadges(user.id);

            let row = 0;
            for(let i = 0; i < badges.length; i++){
                const badge = badges[i];
                const img = await canvas.loadImage("static/profile/badges/"+badge.image);
                ctx.drawImage(img, 210+((i % 4)*(32+10)), 86+(Math.floor(i/4) * 39));
            }

            return cnv.toBuffer("image/png");
        }
    },
    run: async function(message, args, bot){

        const attachment = new Discord.Attachment(await bot.generateProfileImage(message.author), "profile.png");
        message.channel.send("", attachment);

    }
};