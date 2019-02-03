const Discord = require('discord.js');
const canvas = require('canvas');
const dateFormat = require('dateformat');
const wrap = require('word-wrap');
module.exports = {
    name: "User Profile",
    usage: "profile help",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["profile", "userprofile"],
    init: async function(bot){

        //const bg = await canvas.loadImage("static/profile/background.png");
        canvas.registerFont("static/profile/BITDUST1.TTF", {family: 'Bitdust'});
        const errorbg = await canvas.loadImage('static/profile/backgrounds/error.png');

        bot.generateProfileImage = async function generateProfileImage(user){
            try {
                let profileInfo = (await bot.database.getProfile(user.id))[0];

                if (!profileInfo) {
                    bot.logger.log("Creating profile for " + user.id);
                    await bot.database.createProfile(user.id);
                    profileInfo = {
                        caption: "I should do !profile help",
                        background: 0,
                        frames: 2,
                        board: 3
                    };
                }

                const backgroundInfo = (await bot.database.getProfileOption(profileInfo.background))[0];
                const frameInfo = (await bot.database.getProfileOption(profileInfo.frames))[0];
                const boardInfo = (await bot.database.getProfileOption(profileInfo.board))[0];

                const bg = await canvas.loadImage('static/profile/backgrounds/' + backgroundInfo.path);
                const frames = await canvas.loadImage('static/profile/frames/' + frameInfo.path);
                const board = await canvas.loadImage('static/profile/boards/' + boardInfo.path);

                const cnv = canvas.createCanvas(bg.width, bg.height);
                const ctx = cnv.getContext("2d");

                ctx.drawImage(bg, 0, 0);

                ctx.drawImage(board, 384, 20);

                const avatar = await canvas.loadImage(user.avatarURL);

                ctx.drawImage(avatar, 21, 14, 172, 172);



                if(frameInfo.textColour !== "over")
                    ctx.drawImage(frames, 17, 10);

                ctx.font = "30px Sans serif";
                ctx.fillStyle = backgroundInfo.textColour;
                ctx.fillText(user.username + "#" + user.discriminator, 211, 36);

                ctx.font = "15px Sans serif";

                ctx.fillText(wrap(profileInfo.caption, {width: 25}), 200, 56);

                ctx.font = "12px Bitdust";
                ctx.fillStyle = boardInfo.textColour === "inherit" ? backgroundInfo.textColour : boardInfo.textColour;
                ctx.fillText("Total Commands", 394, 68);
                ctx.fillText("Total Servers", 394, 108);
                ctx.fillText("First Seen", 394, 148);


                ctx.font = "14px Bitdust";
                ctx.fillStyle = "green";

                let mutualGuilds;
                if (bot.client.shard) {
                    let guildCollection = await bot.client.shard.broadcastEval(`
                this.guilds.filter((guild)=>guild.members.has('${user.id}')).map((guild)=>guild.name);
            `);
                    mutualGuilds = guildCollection.reduce((a, b) => a.concat(b), []);
                } else {
                    mutualGuilds = bot.client.guilds.filter((guild) => guild.members.has(user.id)).map((guild) => guild.name);
                }
                const commandCount = (await bot.database.getUserStats(user.id))[0].commandCount;
                ctx.fillText(commandCount.toLocaleString(), 394, 83);

                ctx.fillText(mutualGuilds.length, 394, 123);

                ctx.fillText(dateFormat(profileInfo.firstSeen, "dd/mm/yy"), 394, 163);

                const now = new Date();

                if(profileInfo.firstSeen)
                    await bot.badges.updateBadge(user, "year", parseInt((now-profileInfo.firstSeen) / 3.154e+10));
                await bot.updateServersBadge(user, mutualGuilds.length);

                const badges = await bot.database.getProfileBadges(user.id);

                for (let i = 0; i < badges.length; i++) {
                    const badge = badges[i];
                    const img = await canvas.loadImage("static/profile/badges/" + badge.image);
                    ctx.drawImage(img, 210 + ((i % 4) * (32 + 10)), 86 + (Math.floor(i / 4) * 39));
                }

                if(frameInfo.textColour === "over")
                    ctx.drawImage(frames, 17, 10);

                return cnv.toBuffer("image/png");
            }catch(e){
                bot.raven.captureException(e);
                const cnv = canvas.createCanvas(errorbg.width, errorbg.height);
                const ctx = cnv.getContext("2d");
                ctx.drawImage(errorbg, 0,0);
                ctx.fillStyle = "red";
                ctx.font = "15px Sans serif";
                ctx.fillText(e.toString(), 20, 20);
                return cnv.toBuffer("image/png");
            }
        };


        bot.badges = {};

        bot.badges.updateBadge = async function updateBadge(user, series, value){
            const userID = user.id;
            let eligibleBadge = (await bot.database.getEligbleBadge(userID, series, value))[0];
            if(eligibleBadge){
                bot.logger.log(`Awarding badge ${eligibleBadge.name} (${eligibleBadge.id}) to ${user.username} (${userID}). ${series} = ${value}`);
                await bot.database.deleteBadgeFromSeries(userID, series);
                await bot.database.giveBadge(userID, eligibleBadge.id);
                return eligibleBadge;
            }
            return null;
        };

        bot.updateCommandsBadge = async function(user, commands){
            await bot.badges.updateBadge(user, 'commands', commands);
        };

        bot.updateServersBadge = async function(user, servers){
            await bot.badges.updateBadge(user, 'servers', servers);
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
            message.channel.send(":information_source: Profile Help:\n!profile - Show your profile\n!profile @user - Show a users profile\n!profile badges - Badges explained\n!profile backgrounds - View Backgrounds\n!profile boards - View Boards\n!profile frames - View Frames\n!profile set - Customize profile");
        }else if(args[1] === "badges") {
            const result = await bot.database.getBadgeTypes();
            let output = "Badges:\n";
            for (let i = 0; i < result.length; i++) {
                const badge = result[i];
                if ((args[2] && args[2] === "all") || badge.display === 1)
                    output += `${args[3] && args[3] === "ids" ? badge.id : ""}${badge.emoji} **${badge.name}** ${badge.desc}\n`;

            }
            message.channel.send(output);
        }else if(args[1] === "backgrounds"){
            const result = await bot.database.getProfileOptions("background");
            let output = "Backgrounds:\n";
            for(let i = 0; i < result.length; i++){
                const background = result[i];
                output += `For **${background.name}**: \nΤype ${args[0]} set background ${background.key}\n`;
            }
            message.channel.send(output);
        }else if(args[1] === "boards"){
            const result = await bot.database.getProfileOptions("board");
            let output = "Boards:\n";
            for(let i = 0; i < result.length; i++){
                const background = result[i];
                output += `For **${background.name}**: \nΤype ${args[0]} set board ${background.key}\n`;
            }
            message.channel.send(output);
        }else if(args[1] === "frames"){
            const result = await bot.database.getProfileOptions("frame");
            let output = "Frames:\n";
            for(let i = 0; i < result.length; i++){
                const background = result[i];
                output += `For **${background.name}**: \nΤype ${args[0]} set frame ${background.key}\n`;
            }
            message.channel.send(output);
        }else if(args[1] === "set"){
            if(!args[2]){
                message.channel.send(`:information_source: Profile Set:\n${args[0]} set tagline <tagline>\n${args[0]} set background <background>\n${args[0]} set frame <frame>\n${args[0]} set board <board>\n**More coming soon...**`);
            }else if (args[2] === "tagline" && args[3]){
                const tagline = message.cleanContent.substring(message.cleanContent.indexOf(args[3]));
                if(tagline.length > 45){
                    message.channel.send(":warning: Tagline must be 45 characters or less.");
                }else{
                    await bot.database.setProfileTagline(message.author.id, tagline);
                    message.channel.send(`Tagline set to \`${tagline}\``);
                }

            }else if(args[2] === "background" && args[3]){
                const background = (await bot.database.getProfileOptionByKey(args[3], 'background'))[0];
                if(background){
                    await bot.database.setProfileOption(message.author.id, "background", background.id);
                    message.channel.send(`Set background to ${background.name}`);
                }else{
                    message.channel.send(`:warning: Invalid background. Try ${args[0]} backgrounds`);
                }
            }else if(args[2] === "board" && args[3]){
                const board = (await bot.database.getProfileOptionByKey(args[3], 'board'))[0];
                if(board){
                    await bot.database.setProfileOption(message.author.id, "board", board.id);
                    message.channel.send(`Set board to ${board.name}`);
                }else{
                    message.channel.send(`:warning: Invalid board. Try ${args[0]} boards`);
                }
            }else if(args[2] === "frame" && args[3]){
                const board = (await bot.database.getProfileOptionByKey(args[3], 'frame'))[0];
                if(board){
                    await bot.database.setProfileOption(message.author.id, "frames", board.id);
                    message.channel.send(`Set frame to ${board.name}`);
                }else{
                    message.channel.send(`:warning: Invalid frame. Try ${args[0]} frames`);
                }
            }else{
                message.channel.send(`:bangbang: Invalid usage. ${args[0]} set frame/board/background/tagline Or try **${args[0]} help**`);
            }
        }else {
            message.channel.send(`:bangbang: Invalid usage. Try: ${args[0]} help`);
        }
    }

};