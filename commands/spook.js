const Embeds = require("../util/Embeds");
const Strings = require("../util/String");
const Discord = require("discord.js");
const SpookRoles = require("../util/SpookRoles");
const end = new Date("1 November 2021");
const start = new Date("1 October 2021");
const roleMultipliers = [8, 25, 100, 1000, 2000, 5000];
module.exports = {
    name: "Spook",
    usage: "spook :@user?",
    categories: ["fun"],
    requiredPermissions: [],
    commands: ["spook", "spooked"],
    guildOnly: true,
    nestedDir: "spook",
    init: async function (bot) {
        bot.spook = {};
        bot.spook.spooked = [];
        bot.client.on("guildMemberRemove", async (member)=> {
            if(!bot.config.getBool("global", "spook.doLeaveCheck"))return bot.logger.log("Ignoring leave as doLeaveCheck is off");
            const currentSpook = await bot.database.getSpooked(member.guild.id);
            if (!currentSpook || currentSpook.spooked !== member.id) return;
            module.exports.forceNewSpook(bot, currentSpook, "LEFT", member);
        });
    },
    async forceNewSpook(bot, currentSpook, reason, fromMember){
        bot.logger.log(`Generating new spook for ${currentSpook.server} (${reason})`);
        const guild = await bot.client.guilds.fetch(currentSpook.server).catch(()=>null);
        if(!guild || guild.deleted)return bot.logger.warn(`Guild deleted or failed to fetch.`);

        let channel = await guild.channels.fetch(currentSpook.channel).catch(()=>null);
        if(!channel || channel.deleted || channel.archived){
            // Channel not accessible anymore
            await guild.channels.fetch();
            channel = guild.channels.cache.find((c)=>!c.archived && !!c.deleted && c.type === "GUILD_TEXT" && c.permissionsFor(guild.me).has("SEND_MESSAGES"));
        }

        if(!channel)return bot.logger.warn(`No good available channels for spook update in ${currentSpook.server}`);

        let membersNotOptedOut =  channel.members.filter((m)=>!m.user.bot && !bot.config.getBool(currentSpook.server, "spook.optout", m.id));
        // Look for online members first
        let toMember = membersNotOptedOut.filter((m)=>m.presence.status !== "offline").random();
        // If there are no online members, pick a random member
        if(!toMember)toMember = membersNotOptedOut.random();
        // No members at all. I'm all alone
        if(!toMember)return bot.logger.warn("No accessible members");

        await module.exports.spook(bot, {channel}, fromMember, toMember, reason);

        return channel.send(bot.lang.getTranslation(currentSpook.server, `SPOOK_FORCED_${reason}`, {fromMember, toMember}));

    },
    middleware: async function(context, bot){
        const now = new Date();
        if(start-now > 0 && !context.getBool("spook.testing")) {
            const setReminder = bot.interactions.fullSuggestedCommand(context, `remind on 1st October at 00:0${bot.util.intBetween(0, 9)}:0${bot.util.intBetween(0,9)} **The Spooking** starts now!`);
            if (setReminder) {
                setReminder.label = "Set Reminder";
                setReminder.emoji = "⏱️";
            }
            context.sendLang({content: "SPOOK_TEASER", components: [bot.util.actionRow(setReminder)]}, {
                time: bot.util.prettySeconds((start - now) / 1000, context.guild && context.guild.id, context.user.id),
                year: now.getFullYear()
            });
            return false;
        }
        return true;
    },
    spook: async function(bot, context, fromMember, toMember, type = "REGULAR"){
        let toMemberRole = await bot.database.getRoleForUser(toMember.id, toMember.guild.id);
        if(!toMemberRole) {
            let currentRoleCounts = await bot.database.getRoleCountsForServer(toMember.guild.id);
            let memberCount = fromMember.guild.memberCount;
            let roleMultiplier = 7;

            for (let i = 0; i < roleMultipliers.length; i++) {
                if (memberCount <= roleMultipliers[i]) {
                    roleMultiplier = i + 1;
                    break;
                }
            }

            bot.logger.log(`Role multiplier for ${toMember.guild.id} is ${roleMultiplier}`);

            let assignableRoleId;
            for (let i = 0; i < currentRoleCounts.length; i++) {
                let role = currentRoleCounts[i];
                if (role.count < (role.rate * roleMultiplier)) {
                    bot.logger.log(`Found assignable role ${role.id} with ${role.count}/${role.rate * roleMultiplier} filled`);
                    assignableRoleId = role.id;
                    break;
                }
            }

            if (assignableRoleId) {
                try {
                    bot.logger.log(`Attempting to assign role ${assignableRoleId} to ${toMember.id}`);
                    let roleInfo = await bot.redis.cache(`spook/role/${assignableRoleId}`, async ()=>await bot.database.getRoleInfo(assignableRoleId), 60000);
                    let roleData = await SpookRoles.GetDataForSpookRole(bot, toMember, roleInfo);
                    if(roleData) {
                        let embed = new Discord.MessageEmbed();
                        embed.setColor("#bf621a");
                        embed.setAuthor(`You have been assigned a secret role in '${toMember.guild.name}'!`);
                        embed.setTitle(roleInfo.name);
                        embed.setDescription(`${Strings.Format(roleInfo.desc, roleData)}\nOnly spooks inside '${toMember.guild.name}' will count towards this.\n**Keep this role secret, someone else might be working against you!**`);
                        embed.setThumbnail(roleInfo.image);
                        let channel = await toMember.user.createDM();
                        await channel.send({embeds: [embed]});
                        await bot.database.addSpookRole(toMember.id, toMember.guild.id, assignableRoleId, roleData)
                    }
                } catch (e) {
                    bot.logger.error(e);
                }
            }
        }

        return bot.database.spook(toMember.id, fromMember.user.id, toMember.guild.id, context.channel.id,
            fromMember.user.username, toMember.user.username, fromMember.displayHexColor, toMember.displayHexColor, fromMember.user.avatarURL({format: "png", size: 32, dynamic: false}), toMember.user.avatarURL({format: "png", size: 32, dynamic: false}), type);
    },
    run: async function (context, bot) {
        // Check if this user has opted out
        if(context.getBool("spook.optout"))
            return context.sendLang({content: "SPOOK_OPTOUT", ephemeral: true});

        // Get the current spook
        const currentSpook = await bot.database.getSpooked(context.guild.id);

        if(!context.options.user)
            return  context.sendLang({content: currentSpook ? "SPOOK_CURRENT" : "SPOOK_NOBODY"}, {spooked: currentSpook?.spooked, time: end, server: context.guild.id});

        // Check that the current user can actually spook
        if(currentSpook && currentSpook.spooked !== context.user.id)
            return context.sendLang({content: "SPOOK_UNABLE", ephemeral: true}, currentSpook);

        // Get the target user and check that they're in this channel
        const member = await context.getMember(context.options.user);
        if(!member)
            return context.sendLang({content: "SPOOK_USER_NOT_IN_CHANNEL", ephemeral: true});

        // Check they haven't opted out
        if(bot.config.getBool("global", "spook.optout", member.id))
            return context.sendLang({content: "SPOOK_USER_OPTOUT", ephemeral: true});

        if(context.member.presence?.status === "offline")
            return context.sendLang({content: "SPOOK_APPEAR_OFFLINE", ephemeral: true});

        if(member.id === bot.client.user.id)
            return context.sendLang({content: "SPOOK_OCELOTBOT", ephemeral: true});

       if(member.id === context.user.id)
           return context.sendLang({content: "SPOOK_SELF", ephemeral: true});

        if(member.user.bot)
            return context.sendLang({content: "SPOOK_BOT", ephemeral: true});

        if(member.presence?.status === "offline")
            return context.sendLang({content: "SPOOK_OFFLINE", ephemeral: true});

        // Send an introductory message before actioning the spook
        if(!currentSpook){
            const embed = new Embeds.LangEmbed(context);
            embed.setColor("#bf621a");
            embed.setTitleLang("SPOOK_INTRO_TITLE", {series: start.getFullYear()});
            embed.setDescriptionLang("SPOOK_INTRO_DESC", {start, end});
            embed.addFieldLang("SPOOK_INTRO_SPECIAL_ROLES_TITLE", "SPOOK_INTRO_SPECIAL_ROLES_VALUE");
            embed.addFieldLang("SPOOK_INTRO_REWARDS_TITLE", "SPOOK_INTRO_REWARDS_VALUE");
            embed.addFieldLang("SPOOK_INTRO_OPT_OUT_TITLE", "SPOOK_INTRO_OPT_OUT_VALUE");
            embed.addFieldLang("SPOOK_INTRO_ADMINS_TITLE",
                context.getSetting("settings.role") ? "SPOOK_INTRO_ADMINS_VALUE_ROLE": "SPOOK_INTRO_ADMINS_VALUE_ROLE", false, {role: context.getSetting("settings.role")});
            await context.send({embeds: [embed]});
        }

        module.exports.spook(bot, context, context.member, member);
        const result = await bot.database.getSpookCount(member.id, context.guild.id);
        return context.sendLang({content: "SPOOK"}, {spooked: member.id, count: Strings.GetNumberPrefix(result+1)});

    }
};
