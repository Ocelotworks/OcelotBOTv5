const Discord = require('discord.js');
const canvas = require('canvas');
const dateFormat = require('dateformat');
module.exports = {
    name: "User Profile",
    usage: "profile help",
    categories: ["image", "fun"],
    rateLimit: 50,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["profile", "userprofile"],
    init: async function(bot){

        const bg = await canvas.loadImage("static/profile/background.png");
        canvas.registerFont("static/profile/BITDUST1.TTF", {family: 'Bitdust'});

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

            ctx.font = "12px Bitdust";
            ctx.fillText("Total Commands", 388, 68);
            ctx.fillText("Total Servers", 388, 108);
            ctx.fillText("First Seen", 388, 148);


            ctx.font = "14px Bitdust";
            ctx.fillStyle = "green";

            let mutualGuilds;
            if(bot.client.shard){
                let guildCollection = await bot.client.shard.broadcastEval(`
                this.guilds.filter((guild)=>guild.members.has('${user.id}')).map((guild)=>guild.name);
            `);
                mutualGuilds = guildCollection.reduce((a,b)=>a.concat(b), []);
            }else{
                mutualGuilds = bot.client.guilds.filter((guild)=>guild.members.has(user.id)).map((guild)=>guild.name);
            }

            const commandCount = (await bot.database.getUserStats(user.id))[0].commandCount;

            ctx.fillText(commandCount.toLocaleString(), 388, 83);

            ctx.fillText(mutualGuilds.length, 388, 123);

            ctx.fillText(dateFormat(profileInfo.firstSeen, "dd/mm/yy"), 388, 163);

            await bot.updateCommandsBadge(user, commandCount);
            await bot.updateServersBadge(user, mutualGuilds.length);

            const badges = await bot.database.getProfileBadges(user.id);

            for(let i = 0; i < badges.length; i++){
                const badge = badges[i];
                const img = await canvas.loadImage("static/profile/badges/"+badge.image);
                ctx.drawImage(img, 210+((i % 4)*(32+10)), 86+(Math.floor(i/4) * 39));
            }

            return cnv.toBuffer("image/png");
        };


        bot.updateCommandsBadge = async function(user, commands){
            if(commands >= 100 && commands < 1000 && !(await bot.database.hasBadge(user.id, 3)))
                await bot.database.giveBadge(user.id, 3);

            if(commands >= 1000 && !(await bot.database.hasBadge(user.id, 4))) {
                await bot.database.removeBadge(user.id, 3);
                await bot.database.giveBadge(user.id, 4);
            }
        };

        bot.updateServersBadge = async function(user, servers){
            if(servers >= 2 && servers < 4 && !(await bot.database.hasBadge(user.id, 7)))
                await bot.database.giveBadge(user.id, 7);

            if(servers >= 4 && servers < 10 && !(await bot.database.hasBadge(user.id, 10))) {
                await bot.database.removeBadge(user.id, 7);
                await bot.database.giveBadge(user.id, 10);
            }

            if(servers >= 10 && !(await bot.database.hasBadge(user.id, 11))){
                await bot.database.removeBadge(user.id, 7);
                await bot.database.removeBadge(user.id, 10);
                await bot.database.giveBadge(user.id, 11);
            }
        };
    },
    run: async function(message, args, bot){

        if(args.length === 1 || message.mentions.users && message.mentions.users.size > 0){
            const target = message.mentions.users.size > 0 ? message.mentions.users.first() : message.author;
            message.channel.startTyping();
            const attachment = new Discord.Attachment(await bot.generateProfileImage(target), "profile.png");
            message.channel.send("", attachment);
            message.channel.stopTyping();
        }else if(args[1] === "help"){
            message.channel.send(":information_source: Profile Help:\n!profile - Show your profile\n!profile @user - Show a users profile\n!profile badges - Badges explained\n!profile set - Customize profile");
        }else if(args[1] === "badges"){
            const result = await bot.database.getBadgeTypes();
            let output = "Badges:\n";
            for(let i = 0; i < result.length; i++){
                const badge = result[i];
                if((args[2] && args[2] === "all") || badge.display === 1)
                    output += `${args[3] && args[3] === "ids" ? badge.id : ""}${badge.emoji} **${badge.name}** ${badge.desc}\n`;

            }
            message.channel.send(output);
        }else if(args[1] === "set"){
            if(!args[2]){
                message.channel.send(":information_source: Profile Set:\n!profile set tagline <tagline>\n\n**More coming soon...**");
            }else if (args[2] === "tagline" && args[3]){
                const tagline = message.cleanContent.substring(message.cleanContent.indexOf(args[3]));
                if(tagline.length >= 36){
                    message.channel.send(":warning: Tagline must be 36 characters or less.");
                }else{
                    await bot.database.setProfileTagline(message.author.id, tagline);
                    message.channel.send(`Tagline set to \`${tagline}\``);
                }

            }
        }



    }
};