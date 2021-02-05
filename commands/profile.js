const Discord = require('discord.js');
const canvas = require('canvas');
const dateFormat = require('dateformat');
const wrap = require('word-wrap');


//Something tells me theres better ways to do this, but I'm doing it this way
const PROFILE_WIDTH     = 1024;
const PROFILE_HEIGHT    = 700;

const AVATAR_SIZE       = 256;
const AVATAR_OFFSET     = 50;

const USERNAME_SIZE     = 60;
const USERNAME_OFFSET   = 15;
const USERNAME_X        = AVATAR_OFFSET + AVATAR_SIZE + USERNAME_OFFSET;
const USERNAME_Y        = AVATAR_OFFSET + USERNAME_OFFSET;

const TAGLINE_SIZE      = 40;
const TAGLINE_X         = USERNAME_X;
const TAGLINE_Y         = USERNAME_Y + USERNAME_SIZE / 2 + TAGLINE_SIZE;

const BODY_OFFSET       = 50;
const BODY_Y            = AVATAR_OFFSET + BODY_OFFSET + AVATAR_SIZE;
const BODY_X            = AVATAR_OFFSET;
const BODY_WIDTH        = PROFILE_WIDTH - (AVATAR_OFFSET * 2);
const BODY_HEIGHT       = PROFILE_HEIGHT - AVATAR_OFFSET - AVATAR_SIZE - (BODY_OFFSET * 2) + 37; //And thus the system starts to break down
const BODY_PADDING      = 10;

const TAG_WIDTH         = 170;
const TAG_HEIGHT        = 40;
const TAG_PADDING_X     = 10;
const TAG_PADDING_Y     = 5;
const TAG_RADIUS        = 10;
const TAG_SIZE          = 20;
const TAG_ICON_SIZE     = 32;

const FEAT_BADGE_X      = BODY_X + BODY_PADDING;
const FEAT_BADGE_Y      = BODY_Y + BODY_PADDING;
const FEAT_BADGE_SIZE   = 64;
const FEAT_BADGE_WIDTH  = BODY_WIDTH / 2 - (BODY_PADDING * 2);
const FEAT_BADGE_PADDING= 5;
const FEAT_BADGE_HEIGHT = FEAT_BADGE_SIZE + FEAT_BADGE_PADDING * 2;
const FEAT_BADGE_TEXT   = 30;
const FEAT_BADGE_CAPTION= 20;

const REG_BADGE_X       = FEAT_BADGE_X;
const REG_BADGE_Y       = FEAT_BADGE_Y + FEAT_BADGE_HEIGHT + FEAT_BADGE_PADDING;
const REG_BADGE_SIZE    = FEAT_BADGE_SIZE;
const REG_BADGE_PADDING = 11;
const REG_BADGE_ROW_NUM = 6;

const STATS_SIZE        = 32;
const STATS_X           = BODY_X + BODY_PADDING + FEAT_BADGE_WIDTH + STATS_SIZE;
const STATS_Y           = BODY_Y + BODY_PADDING + STATS_SIZE;
const STATS_PADDING     = 5;

module.exports = {
    name: "User Profile",
    usage: "profile help",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["profile", "userprofile"],
    init: async function(bot){

        //const bg = await canvas.loadImage("static/profile/background.png");
        // canvas.registerFont(profileBase+"/BITDUST1.TTF", {family: 'Bitdust'});
        // const errorbg = await canvas.loadImage(profileBase+"/backgrounds/error.png");
        //

        // bot.logger.log("Registering Fonts...");
        // let fonts = await bot.database.getProfileOptions("font");
        // for(let i = 0; i < fonts.length; i++){
        //     if(!fonts[i].path)continue;
        //     try {
        //         bot.logger.log(`Registering font ${fonts[i].name}`);
        //         canvas.registerFont(`${profileBase}/fonts/${fonts[i].path}`, {family: fonts[i].name})
        //     }catch(e){
        //         bot.raven.captureException(e);
        //         bot.logger.warn(`Unable to load ${fonts[i].path}: ${e}`);
        //     }
        // }

        bot.util.standardNestedCommandInit("profile");

        //
        // async function generateProfileHeader(ctx, name, tagline, avatar, tags){
        //     //Load the avatar
        //     let avatarURL = await canvas.loadImage(avatar);
        //
        //     //Draw the avatar backdrop
        //     let span = bot.util.startSpan("Draw avatar backdrop");
        //     ctx.fillStyle = "rgba(25,25,25,0.56)";
        //     ctx.fillRect(AVATAR_OFFSET-1, AVATAR_OFFSET-1, AVATAR_SIZE+2, AVATAR_SIZE+2);
        //     span.end();
        //
        //     //Draw the avatar
        //     span = bot.util.startSpan("Draw avatar");
        //     ctx.drawImage(avatarURL, AVATAR_OFFSET, AVATAR_OFFSET, AVATAR_SIZE, AVATAR_SIZE);
        //     span.end();
        //
        //     //Draw the avatar outline
        //     span = bot.util.startSpan("Draw avatar outline");
        //     ctx.fillStyle = "black";
        //     ctx.strokeRect(AVATAR_OFFSET-1, AVATAR_OFFSET-1, AVATAR_SIZE+2, AVATAR_SIZE+2);
        //     span.end();
        //
        //     span = bot.util.startSpan("Draw header text");
        //     bot.util.drawOutlinedText(ctx, name, USERNAME_X, USERNAME_Y, USERNAME_SIZE);
        //     bot.util.drawOutlinedText(ctx, wrap(tagline, {width: 35}), TAGLINE_X, TAGLINE_Y, TAGLINE_SIZE);
        //     span.end();
        // }
        //
        //
        // async function drawBadges(ctx, user){
        //     let span = bot.util.startSpan("Get badges");
        //     const badges = await bot.database.getProfileBadges(user.id);
        //     span.end();
        //     let regularIndexOffset;
        //     await Promise.all(badges.map(async function(badge, i){
        //         span = bot.util.startSpan("Load badge");
        //         badge.loadedImage = await canvas.loadImage(`${newProfileBase}/badges/${badge.image}`);
        //         span.end();
        //         span = bot.util.startSpan("Draw badge");
        //         if(i === 0 || badges.length <= 4){
        //             drawFeaturedBadge(ctx, badge, i);
        //         }else{
        //             if(!regularIndexOffset)
        //                 regularIndexOffset = i;
        //             drawRegularBadge(ctx, badge, i-regularIndexOffset);
        //         }
        //         span.end();
        //     }));
        // }
        //
        // async function drawRegularBadge(ctx, badge, i){
        //     const x = REG_BADGE_X + 1 + ((REG_BADGE_PADDING + REG_BADGE_SIZE) * (i % REG_BADGE_ROW_NUM));
        //     const y = REG_BADGE_Y + ((REG_BADGE_PADDING + REG_BADGE_SIZE) * Math.floor(i / REG_BADGE_ROW_NUM)) ;
        //     ctx.drawImage(badge.loadedImage,  x , y, REG_BADGE_SIZE, REG_BADGE_SIZE);
        // }
        //
        // async function drawFeaturedBadge(ctx, badge, i){
        //     const y = FEAT_BADGE_Y + (FEAT_BADGE_HEIGHT * i) + (5 * i);
        //     ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        //     ctx.fillRect(FEAT_BADGE_X, y, FEAT_BADGE_WIDTH, FEAT_BADGE_HEIGHT);
        //     ctx.drawImage(badge.loadedImage,  FEAT_BADGE_X + FEAT_BADGE_PADDING , y + FEAT_BADGE_PADDING, FEAT_BADGE_SIZE, FEAT_BADGE_SIZE);
        //     ctx.fillStyle = "black";
        //     ctx.font = `${FEAT_BADGE_TEXT}px Sans-serif`;
        //     ctx.fillText(badge.name, FEAT_BADGE_X + FEAT_BADGE_SIZE + (FEAT_BADGE_PADDING * 2), y + FEAT_BADGE_TEXT + FEAT_BADGE_PADDING);
        //     ctx.font = `${FEAT_BADGE_CAPTION}px Sans-serif`;
        //     ctx.fillText(badge.desc, FEAT_BADGE_X + FEAT_BADGE_SIZE + (FEAT_BADGE_PADDING * 2) + 5, y + (FEAT_BADGE_TEXT * 2));
        // }
        //
        //
        // function drawStat(ctx, value, name, i){
        //     ctx.font = STATS_SIZE+"px Bitdust";
        //     ctx.fillStyle = "black";
        //     ctx.fillText(value+" "+name, STATS_X, STATS_Y + ((STATS_SIZE + STATS_PADDING) * i));
        //     ctx.fillStyle = "green";
        //     ctx.fillText(value, STATS_X, STATS_Y + ((STATS_SIZE + STATS_PADDING) * i));
        // }
        //
        // async function drawStats(ctx, user, profileInfo){
        //     let span = bot.util.startSpan("Get stats");
        //     const [guildCounts, userStats, voteStats, guessStats, triviaStats] = await Promise.all([
        //         bot.rabbit.broadcastEval(`this.guilds.cache.filter((guild)=>guild.members.cache.has('${user.id}')).size`),
        //         bot.database.getUserStats(user.id),
        //         bot.database.getVoteCount(user.id),
        //         bot.database.getTotalCorrectGuesses(user.id),
        //         bot.database.getTriviaCorrectCount(user.id),
        //     ]);
        //     span.end();
        //     span = bot.util.startSpan("Draw stats");
        //     let i = 0;
        //     drawStat(ctx, userStats[0].commandCount.toLocaleString(), "commands", i++);
        //     drawStat(ctx, guildCounts.reduce((a,b)=>a+b, 0), "servers", i++);
        //     drawStat(ctx, voteStats[0] && voteStats[0]['COUNT(*)'] ? voteStats[0]['COUNT(*)'] : 0, "votes", i++);
        //     drawStat(ctx, guessStats[0] && guessStats[0]['COUNT(*)'] ? guessStats[0]['COUNT(*)'] : 0, "songs guessed", i++);
        //     drawStat(ctx, triviaStats[0] && triviaStats[0]['count(*)'] ? triviaStats[0]['count(*)'] : 0, "trivia correct", i++);
        //     drawStat(ctx, dateFormat(profileInfo.firstSeen, "dd/mm/yy"), "first seen", i++);
        //     span.end();
        // }
        //
        // function generateProfileBody(ctx, user, profileInfo){
        //     //Draw background
        //     let span = bot.util.startSpan("Draw background");
        //     ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        //     ctx.fillRect(BODY_X, BODY_Y, BODY_WIDTH, BODY_HEIGHT);
        //     span.end();
        //     //Draw separator line
        //
        //     span = bot.util.startSpan("Draw separator");
        //     ctx.fillStyle = "rgba(25,25,25,0.56)";
        //     ctx.fillRect(BODY_X+(BODY_WIDTH/2), BODY_Y, 2, BODY_HEIGHT);
        //     span.end();
        //     return Promise.all([drawBadges(ctx, user), drawStats(ctx, user, profileInfo)]);
        // }

        // bot.generateNewProfileImage = async function(user, guild){
        //     let imageRequest = {
        //         components: [],
        //         width: PROFILE_WIDTH,
        //         height: PROFILE_HEIGHT,
        //     };
        //     let span = bot.util.startSpan("Fetch profile");
        //     let profileInfo = (await bot.database.getProfile(user.id))[0];
        //
        //     if (!profileInfo) {
        //         bot.logger.log("Creating profile for " + user.id);
        //         await bot.database.createProfile(user.id);
        //         console.log("Created profile");
        //         profileInfo = {
        //             caption: "I should do\n!profile help",
        //             background: 0,
        //             frames: 2,
        //             board: 3,
        //             font: 33
        //         };
        //     }
        //
        //     span.end();
        //     span = bot.util.startSpan("Get mutual guilds");
        //     let now = new Date();
        //     let mutualGuilds;
        //     if (bot.client.shard) {
        //         let guildCollection = await bot.rabbit.broadcastEval(`
        //         this.guilds.cache.filter((guild)=>guild.members.cache.has('${user.id}')).map((guild)=>guild.name);
        //     `);
        //         mutualGuilds = guildCollection.reduce((a, b) => a.concat(b), []);
        //     } else {
        //         mutualGuilds = bot.client.guilds.cache.filter((guild) => guild.members.cache.has(user.id)).map((guild) => guild.name);
        //     }
        //     span.end();
        //     span = bot.util.startSpan("Give badges");
        //     if(profileInfo.firstSeen)
        //         await bot.badges.updateBadge(user, "year", parseInt((now-profileInfo.firstSeen) / 3.154e+10));
        //     await bot.updateServersBadge(user, mutualGuilds.length);
        //
        //     if(guild && bot.config.get(guild.id, "profile.complimentaryBadge", user.id))
        //         await bot.badges.giveBadgeOnce(user, null, bot.config.get(guild.id, "profile.complimentaryBadge", user.id));
        //     span.end();
        //
        //
        //     const cnv = canvas.createCanvas(PROFILE_WIDTH, PROFILE_HEIGHT);
        //     const ctx = cnv.getContext("2d");
        //     const backgroundInfo  = (await bot.database.getProfileOption(profileInfo.background))[0];
        //
        //
        //
        //     return imageRequest
        //
        //     await Promise.all([
        //         generateProfileHeader(ctx, user.tag, profileInfo.caption, user.avatarURL({dynamic: true, format: "png"}), []),
        //         generateProfileBody(ctx, user, profileInfo)
        //     ]);
        //
        //     return cnv.toBuffer("image/png");
        // };

        bot.badges = {};

        bot.badges.giveBadge = async function(user, channel, id){
            let span = bot.util.startSpan("Give badge");
            await bot.database.giveBadge(user.id, id);
            const badge = (await bot.database.getBadge(id))[0];
            if(channel) {
                let embed = new Discord.MessageEmbed();
                embed.setThumbnail(`https://ocelotbot.xyz/badge.php?id=${id}`);
                embed.setTitle(`You just earned ${badge.name}`);
                embed.setDescription(`${badge.desc}\nNow available on your **${channel.guild.getSetting("prefix")}profile**`);
                embed.setColor("#3ba13b");
                channel.send(user, embed);
            }
            span.end();
        };

        bot.badges.giveBadgeOnce = async function(user, channel, id){
            if(await bot.database.hasBadge(user.id, id))return;
            return bot.badges.giveBadge(user, channel, id);
        };


        bot.badges.giveBadgesOnce = async function(users, channel, id){
            const skip = await bot.database.haveBadge(users, id);
            let output = "";
            for(let i = 0; i < users.length; i++){
                const user = users[i];
                if(skip.indexOf(user) > -1)continue;
                output += `<@${user}> `;
                await bot.database.giveBadge(user, id);
            }
            if(output.length === 0)return;
            const badge = (await bot.database.getBadge(id))[0];
            let embed = new Discord.MessageEmbed();
            embed.setThumbnail(`https://ocelotbot.xyz/badge.php?id=${id}`);
            embed.setTitle(`You just earned ${badge.name}`);
            embed.setDescription(`${badge.desc}\nNow available on your **${channel.guild.getSetting("prefix")}profile**`);
            embed.setColor("#3ba13b");
            await channel.send(output, embed);
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
                    let embed = new Discord.MessageEmbed();
                    embed.setThumbnail(`https://ocelotbot.xyz/badge.php?id=${eligibleBadge.id}`);
                    embed.setTitle(`You just earned ${eligibleBadge.name}`);
                    embed.setDescription(`${eligibleBadge.desc}\nNow available on your **${channel.guild ? channel.guild.getSetting("prefix") : bot.config.get("global", "prefix")}profile**`);
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

            let imageRequest = {
                components: [],
                width: PROFILE_WIDTH,
                height: PROFILE_HEIGHT,
            };

            let profileInfo = (await bot.database.getProfile(target.id))[0];
            const backgroundInfo  = (await bot.database.getProfileOption(profileInfo.background))[0];

            // Profile Background
            imageRequest.components.push({
                url: `profile/new/backgrounds/${backgroundInfo.path}`,
                local: true,
                pos: {
                    x: 0,
                    y: 0,
                    w: PROFILE_WIDTH,
                    h: PROFILE_HEIGHT
                }
            })

            // Avatar
            imageRequest.components.push({
                url: target.avatarURL({dynamic: true, format: "png"}),
                background: "#191919AA",
                pos: {
                    x: AVATAR_OFFSET,
                    y: AVATAR_OFFSET,
                    w: AVATAR_SIZE,
                    h: AVATAR_SIZE
                },
                filter: [{
                    name: "rectangle",
                    args: {
                        x: 0,
                        y: 0,
                        w: AVATAR_SIZE/2,
                        h: AVATAR_SIZE/2,
                        colour: "#000000",
                        fill: false,
                    },
                }]
            })


            // Username
            imageRequest.components.push(bot.util.imageProcessorOutlinedText(target.tag, USERNAME_X, USERNAME_Y, PROFILE_WIDTH-USERNAME_X, USERNAME_SIZE, USERNAME_SIZE))

            // Tagline
            imageRequest.components.push(bot.util.imageProcessorOutlinedText(profileInfo.caption, TAGLINE_X, TAGLINE_Y, PROFILE_WIDTH-TAGLINE_X, PROFILE_HEIGHT-BODY_X, TAGLINE_SIZE))


            const [guildCounts, userStats, voteStats, guessStats, triviaStats] = await Promise.all([
                bot.rabbit.broadcastEval(`this.guilds.cache.filter((guild)=>guild.members.cache.has('${target.id}')).size`),
                bot.database.getUserStats(target.id),
                bot.database.getVoteCount(target.id),
                bot.database.getTotalCorrectGuesses(target.id),
                bot.database.getTriviaCorrectCount(target.id),
            ]);

            let valuesContent = "";
            let labelsContent = "";

            function drawStat(stat, label){
                if(typeof stat === "number")
                    stat = stat.toLocaleString();
                valuesContent += `${stat}\n`;
                labelsContent += `${stat} ${label.toUpperCase()}\n`;
            }

            drawStat(guildCounts.reduce((a,b)=>a+b, 0), "servers");
            drawStat(voteStats[0] && voteStats[0]['COUNT(*)'] ? voteStats[0]['COUNT(*)'] : 0, "votes");
            drawStat(guessStats[0] && guessStats[0]['COUNT(*)'] ? guessStats[0]['COUNT(*)'] : 0, "songs guessed");
            drawStat(triviaStats[0] && triviaStats[0]['count(*)'] ? triviaStats[0]['count(*)'] : 0, "trivia correct");
            drawStat(dateFormat(profileInfo.firstSeen, "dd/mm/yy"), "first command");

            imageRequest.components.push({
                pos: {
                    x: BODY_X,
                    y: BODY_Y,
                    w: BODY_WIDTH,
                    h: BODY_HEIGHT,
                },
                filter: [{
                    name: "rectangle",
                    args: {
                        x: 0,
                        y: 0,
                        w: BODY_WIDTH,
                        h: BODY_HEIGHT,
                        colour: "#ffffff55"
                    },
                },
                {
                    name: "rectangle",
                    args: {
                        x: (BODY_WIDTH/2)-1,
                        y: 0,
                        w: 2,
                        h: BODY_HEIGHT,
                        colour: "#00000055"
                    }
                },
                {
                    name: "text",
                    args: {
                        x: BODY_WIDTH/2,
                        y: BODY_PADDING,
                        w: BODY_WIDTH/2,
                        ax: 0,
                        ay: 0,
                        spacing: 1.5,
                        align: 0,
                        font: "BITDUST1.TTF",
                        content: labelsContent,
                        fontSize: 30,
                        colour: "#000000"
                    }
                },
                {
                    name: "text",
                    args: {
                        x: BODY_WIDTH/2,
                        y: BODY_PADDING,
                        w: BODY_WIDTH/2,
                        ax: 0,
                        ay: 0,
                        spacing: 1.5,
                        align: 0,
                        font: "BITDUST1.TTF",
                        content: valuesContent,
                        fontSize: 30,
                        colour: "#03f783"
                    }
                }]
            })

            const badges = await bot.database.getProfileBadges(target.id);

            for(let i = 0; i < badges; i++){
                if(i === 0 || badges.length <= 4){
                    const y = FEAT_BADGE_Y + (FEAT_BADGE_HEIGHT * i) + (5 * i);
                    imageRequest.components.push({
                        pos: {
                            x: FEAT_BADGE_X,
                            y,
                            w: FEAT_BADGE_WIDTH,
                            h: FEAT_BADGE_HEIGHT,
                        },
                        filter: [{
                            name: "rectangle",
                            args: {
                                colour: "#ffffff11"
                            }
                        }]
                    }, {
                        url: ``,
                        local: true,
                        pos: {
                            x:  FEAT_BADGE_X + FEAT_BADGE_PADDING,
                            y: y + FEAT_BADGE_PADDING,
                            w: FEAT_BADGE_SIZE,
                            h: FEAT_BADGE_SIZE,
                        }
                    })
                }else{

                }
            }

            console.log(JSON.stringify(imageRequest));
            message.channel.stopTyping();
            return bot.util.imageProcessor(message, imageRequest);
        }else{
            await bot.util.standardNestedCommand(message,args,bot,'profile');
        }
    }

};