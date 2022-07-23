const Discord = require('discord.js');
const dateFormat = require('dateformat');
const Image = require('../util/Image');

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
    usage: "profile :@user?",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["profile", "userprofile"],
    nestedDir: "profile",
    contextMenu: {
        type: "user",
        value: "user",
        prefix: "View"
    },
    init: async function(bot){
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
                channel.send({content: `<@${user.id}>`, embeds: [embed]});
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
            await channel.send({content: output, embeds: [embed]});
        };

        bot.badges.updateBadge = async function updateBadge(user, series, value, channel){
            if(bot.config.get("global", "profile.disableBadgeUpdates") === "1")return;
            const userID = user.id;
            let eligibleBadge = (await bot.database.getEligibleBadge(userID, series, value))[0];
            if(eligibleBadge?.id){
                bot.logger.log(`Awarding badge ${eligibleBadge.name} (${eligibleBadge.id}) to ${user.username} (${userID}). ${series} = ${value}`);
                await bot.database.deleteBadgeFromSeries(userID, series);
                await bot.database.giveBadge(userID, eligibleBadge.id);
                if(channel){
                    let embed = new Discord.MessageEmbed();
                    embed.setThumbnail(`https://ocelotbot.xyz/badge.php?id=${eligibleBadge.id}`);
                    embed.setTitle(`You just earned ${eligibleBadge.name}`);
                    embed.setDescription(`${eligibleBadge.desc}\nNow available on your **${channel.guild ? channel.guild.getSetting("prefix") : bot.config.get("global", "prefix")}profile**`);
                    embed.setColor("#3ba13b");
                    channel.send({content: `<@${userID}>`, embeds: [embed]});
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
    run: async function(context, bot){
        const target = context.options?.user ? (await context.getMember(context.options.user))?.user : context.user;
        if(!target)
            return context.send("Couldn't find that user. Make sure they are in this channel.");
        context.defer();

        let imageRequest = {
            components: [],
            width: PROFILE_WIDTH,
            height: PROFILE_HEIGHT,
        };

        let profileInfo = (await bot.database.getProfile(target.id))[0];
        if (!profileInfo) {
            bot.logger.log("Creating profile for " + target.id);
            bot.database.createProfile(target.id).then(()=>bot.logger.log("Created profile"));
            console.log("Created profile");
            profileInfo = {
                caption: "I should do\n!profile help",
                background: 0,
                frames: 2,
                board: 3,
                font: 33
            };
        }

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


        const [guildCounts, userStats, voteStats, guessStats, triviaStats, points] = await Promise.all([
            bot.rabbit.broadcastEval(`this.guilds.cache.filter((guild)=>guild.members.cache.has('${target.id}')).size`),
            bot.database.getUserStats(target.id),
            bot.database.getVoteCount(target.id),
            bot.database.getTotalCorrectGuesses(target.id),
            bot.database.getTriviaCorrectCount(target.id),
            bot.database.getPoints(target.id)
        ]);


        const mutualGuilds = guildCounts.reduce((a,b)=>a+b, 0);

        if(profileInfo.firstSeen)
            await bot.badges.updateBadge(target, "year", parseInt((new Date() - profileInfo.firstSeen) / 3.154e+10));

        await bot.updateServersBadge(target, mutualGuilds);

        if(context.guild && bot.config.get(context.guild.id, "profile.complimentaryBadge", target.id))
            await bot.badges.giveBadgeOnce(target, null, bot.config.get(target.id, "profile.complimentaryBadge", target.id));

        let valuesContent = "";
        let labelsContent = "";

        function drawStat(stat, label){
            if(typeof stat === "number")
                stat = stat.toLocaleString();
            valuesContent += `${stat}\n`;
            labelsContent += `${stat} ${label.toUpperCase()}\n`;
        }


        drawStat(mutualGuilds, "servers");
        drawStat(userStats[0].count.toLocaleString(), "commands");
        drawStat(voteStats[0] && voteStats[0]['COUNT(*)'] ? voteStats[0]['COUNT(*)'] : 0, "votes");
        drawStat(guessStats[0] && guessStats[0]['COUNT(*)'] ? guessStats[0]['COUNT(*)'] : 0, "songs guessed");
        drawStat(triviaStats[0] && triviaStats[0]['count(*)'] ? triviaStats[0]['count(*)'] : 0, "trivia correct");
        drawStat(dateFormat(profileInfo.firstSeen, "dd/mm/yy"), "first command");
        if(context.getBool("points.enabled"))
            drawStat("1 "+points.toLocaleString(), "points");

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
                    x: BODY_WIDTH/2 + BODY_PADDING,
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
                    x: BODY_WIDTH/2 + BODY_PADDING,
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

        if(context.getBool("points.enabled"))
            imageRequest.components.push({
                pos: {
                    x: BODY_X + (BODY_WIDTH/2) + 3,
                    y: BODY_Y + (35)*6,
                    w: 32,
                    h: 32,
                },
                url: "coin.png",
                local: true,
            })

        const badges = await bot.database.getProfileBadges(target.id);
        for(let i = 0; i < badges.length; i++){
            const badge = badges[i];
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
                            x: 0,
                            y: 0,
                            w: FEAT_BADGE_WIDTH,
                            h: FEAT_BADGE_HEIGHT,
                            colour: "#ffffff55"
                        }
                    },{
                        name: "text",
                        args: {
                            x: FEAT_BADGE_SIZE+FEAT_BADGE_PADDING*2,
                            y: FEAT_BADGE_PADDING,
                            w: FEAT_BADGE_WIDTH,
                            ax: 0,
                            ay: 0,
                            spacing: 1.5,
                            align: 0,
                            font: "arial.ttf",
                            content: badge.name,
                            fontSize: FEAT_BADGE_TEXT,
                            colour: "#000000"
                        }
                    },{
                        name: "text",
                        args: {
                            x: FEAT_BADGE_SIZE+(FEAT_BADGE_PADDING*2) + 5,
                            y: FEAT_BADGE_TEXT + FEAT_BADGE_PADDING + 5 ,
                            w: FEAT_BADGE_WIDTH,
                            ax: 0,
                            ay: 0,
                            spacing: 1.5,
                            align: 0,
                            font: "arial.ttf",
                            content: badge.desc,
                            fontSize: FEAT_BADGE_CAPTION,
                            colour: "#000000"
                        }
                    }]
                }, {
                    url: `profile/new/badges/${badge.image}`,
                    local: true,
                    pos: {
                        x:  FEAT_BADGE_X + FEAT_BADGE_PADDING,
                        y: y + FEAT_BADGE_PADDING,
                        w: FEAT_BADGE_SIZE,
                        h: FEAT_BADGE_SIZE,
                    }
                })
            }else{
                imageRequest.components.push({
                    url: `profile/new/badges/${badge.image}`,
                    local: true,
                    pos: {
                        x: REG_BADGE_X + 1 + ((REG_BADGE_PADDING + REG_BADGE_SIZE) * ((i-1) % REG_BADGE_ROW_NUM)),
                        y: REG_BADGE_Y + ((REG_BADGE_PADDING + REG_BADGE_SIZE) * Math.floor((i-1) / REG_BADGE_ROW_NUM)),
                        w: REG_BADGE_SIZE,
                        h: REG_BADGE_SIZE,
                    }
                })
            }
        }

        return Image.ImageProcessor(bot, context,  imageRequest, "profile");

    }

};