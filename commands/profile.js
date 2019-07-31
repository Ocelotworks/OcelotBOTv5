const Discord = require('discord.js');
const canvas = require('canvas');
const dateFormat = require('dateformat');
const wrap = require('word-wrap');

const profileBase = `${__dirname}/../static/profile`;

module.exports = {
    name: "User Profile",
    usage: "profile help",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["profile", "userprofile"],
    init: async function(bot){

        //const bg = await canvas.loadImage("static/profile/background.png");
        canvas.registerFont(profileBase+"/BITDUST1.TTF", {family: 'Bitdust'});
        const errorbg = await canvas.loadImage(profileBase+"/backgrounds/error.png");


        bot.logger.log("Registering Fonts...");
        let fonts = await bot.database.getProfileOptions("font");
        for(let i = 0; i < fonts.length; i++){
            if(!fonts[i].path)continue;
            try {
                bot.logger.log(`Registering font ${fonts[i].name}`);
                canvas.registerFont(`${profileBase}/fonts/${fonts[i].path}`, {family: fonts[i].name})
            }catch(e){
                bot.raven.captureException(e);
                bot.logger.warn(`Unable to load ${fonts[i].path}: ${e}`);
            }
        }

        bot.util.standardNestedCommandInit("profile");

        bot.generateProfileImage = async function generateProfileImage(user){
            try {
                let profileInfo = (await bot.database.getProfile(user.id))[0];

                if (!profileInfo) {
                    bot.logger.log("Creating profile for " + user.id);
                    await bot.database.createProfile(user.id);
                    console.log("Created profile");
                    profileInfo = {
                        caption: "I should do\n!profile help",
                        background: 0,
                        frames: 2,
                        board: 3,
                        font: 33
                    };
                }

                const   premium           = bot.config.get(user.id, "premium") && bot.config.get(user.id, "premium") === "1",
                        backgroundInfo    = (await bot.database.getProfileOption(profileInfo.background))[0],
                        frameInfo         = (await bot.database.getProfileOption(profileInfo.frames))[0],
                        boardInfo         = (await bot.database.getProfileOption(profileInfo.board))[0],
                        fontInfo          = (await bot.database.getProfileOption(profileInfo.font))[0],
                        bg                = await canvas.loadImage(`${profileBase}/backgrounds/${backgroundInfo.path}`),
                        board             = await canvas.loadImage(`${profileBase}/boards/${boardInfo.path}`);


                const cnv = canvas.createCanvas(bg.width, bg.height);
                const ctx = cnv.getContext("2d");
                let frames;

                ctx.drawImage(bg, 0, 0);

                ctx.drawImage(board, 384, 20);

                if(user.avatarURL && frameInfo.path !== "transparent") {
                    frames = await canvas.loadImage(`${profileBase}/frames/${frameInfo.path}`);
                    const avatar = await canvas.loadImage(user.avatarURL);

                    ctx.drawImage(avatar, 21, 14, 172, 172);

                    if(frameInfo.textColour !== "over")
                        ctx.drawImage(frames, 17, 10);
                }


                ctx.font = `30px ${fontInfo.name}`;
                ctx.fillStyle = backgroundInfo.textColour;


                const username = user.username + "#" + user.discriminator;

                const measurement = ctx.measureText(username).width;
                let y = 36;

                if(measurement > 320) {
                    ctx.font = `20px ${fontInfo.name}`;
                    y = 31;
                }

                ctx.fillText(username, 211, y);

                ctx.font = `15px ${fontInfo.name}`;

                ctx.fillText(wrap(profileInfo.caption, {width: 23}), 200, 56);

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
                    const img = await canvas.loadImage(`${profileBase}/badges/${badge.image}`);
                    ctx.drawImage(img, 210 + ((i % 4) * (32 + 10)), 86 + (Math.floor(i / 4) * 39));
                }

                if(frameInfo.path !== "transparent" && frameInfo.textColour === "over")
                    ctx.drawImage(frames, 17, 10);

                if(premium){
                    const premium = await canvas.loadImage(`${profileBase}/premium.png`);
                    ctx.drawImage(premium, 0,0 );
                }

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

        bot.badges.giveBadge = async function(user, channel, id){
            await bot.database.giveBadge(user.id, id);
            const badge = (await bot.database.getBadge(id))[0];
            let embed = new Discord.RichEmbed();
            embed.setThumbnail(`https://ocelot.xyz/badge.php?id=${id}`);
            embed.setTitle(`You just earned ${badge.name}`);
            embed.setDescription(`${badge.desc}\nNow available on your **${channel.guild.getSetting("prefix")}profile**`);
            embed.setColor("#3ba13b");
            channel.send(user, embed);
        };

        bot.badges.updateBadge = async function updateBadge(user, series, value, channel){
            if(bot.config.get("global", "profile.disableBadgeUpdates") && bot.config.get("global", "profile.disableBadgeUpdates") === "1")return;
            const userID = user.id;
            let eligibleBadge = (await bot.database.getEligbleBadge(userID, series, value))[0];
            if(eligibleBadge){
                bot.logger.log(`Awarding badge ${eligibleBadge.name} (${eligibleBadge.id}) to ${user.username} (${userID}). ${series} = ${value}`);
                await bot.database.deleteBadgeFromSeries(userID, series);
                await bot.database.giveBadge(userID, eligibleBadge.id);


                if(channel){
                    let embed = new Discord.RichEmbed();
                    embed.setThumbnail(`https://ocelot.xyz/badge.php?id=${eligibleBadge.id}`);
                    embed.setTitle(`You just earned ${eligibleBadge.name}`);
                    embed.setDescription(`${eligibleBadge.desc}\nNow available on your **${channel.guild ? channel.guild.getSetting("prefix") : bot.config.getSetting("global", "prefix")}profile**`);
                    embed.setColor("#3ba13b");
                    channel.send(`<@${userID}>`, embed);
                }else{
                    bot.logger.log("No channel was given for sending the award message.");
                }

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
        }else{
            bot.util.standardNestedCommand(message,args,bot,'profile');
        }
    }

};