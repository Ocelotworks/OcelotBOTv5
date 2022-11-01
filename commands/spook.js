const Embeds = require("../util/Embeds");
const Strings = require("../util/String");
const Discord = require("discord.js");
const SpookRoles = require("../util/SpookRoles");
const now = new Date();
const end = new Date("1 November "+now.getFullYear());
const start = new Date("1 October "+now.getFullYear());
const roleMultipliers = [8, 25, 100, 1000, 2000, 5000];
let currentSpooks = {};
module.exports = {
    name: "Spook",
    usage: "spook :@user?",
    categories: ["fun"],
    detailedHelp: "A once a year event that runs for the entirety of October.",
    usageExample: "spook intro",
    requiredPermissions: [],
    commands: ["spook", "spooked"],
    guildOnly: true,
    nestedDir: "spook",
    argDescriptions: {
        base: {name: "tag", description: "Spook someone (or use @OcelotBOT spook @user)"}
    },
    init: async function (bot) {
        bot.spook = {};
        bot.spook.spooked = [];
        bot.client.on("guildMemberRemove", async (member)=> {
            if(bot.drain)return;
            if(!bot.config.getBool("global", "spook.doLeaveCheck"))return bot.logger.log("Ignoring leave as doLeaveCheck is off");
            const currentSpook = await bot.database.getSpooked(member.guild.id);
            if (!currentSpook || currentSpook.spooked !== member.id) return;
            module.exports.forceNewSpook(bot, currentSpook, "LEFT", member);
        });
        bot.client.once("ready", ()=>{
            let diff = start-new Date();
            bot.logger.log(`Spook starts in ${diff}ms`);
            if(diff < 0) {
                module.exports.startIdleCheck(bot);
                return module.exports.startSpook(bot);
            }
           bot.util.setLongTimeout(()=>module.exports.startSpook(bot), diff);
        });
    },
    startSpook(bot){
        bot.updatePresence = async ()=>{
            const now = new Date();
            if (now - bot.lastPresenceUpdate < 100000)return;
            bot.lastPresenceUpdate = now;
            let spookCount = await bot.database.getTotalSpooks()
            await bot.client.user.setPresence({
                activities: [{
                    name: `👻 /spook | ${spookCount.toLocaleString()} SPOOKED`,
                    type: "COMPETING",
                }]
            });
        }
        setInterval(()=>bot.updatePresence(), 400000)
        bot.updatePresence();
    },
    async startIdleCheck(bot){
        let spooksForShard = await bot.database.getCurrentlySpookedForShard([...bot.client.guilds.cache.keys()])
        bot.logger.log(`Got ${spooksForShard.length} current spooks for this shard.`);
        for(let i = 0; i < spooksForShard.length; i++){
            const spook = spooksForShard[i];
            module.exports.setIdleCheck(bot, spook.server, spook.spooked);
        }

        bot.client.on("message", (message)=>{
            if(bot.drain || !message.guild || message.author?.bot)return; // Ignore on drain, in DMs and from bots
            if(!currentSpooks[message.guild.id])return;
            clearTimeout(currentSpooks[message.guild.id]);
            module.exports.setIdleCheck(bot, message.guild.id, message.author.id);

        })
    },
    setIdleCheck(bot, server, spooked){
        currentSpooks[server] = setTimeout(()=>module.exports.handleIdleCheck(bot, server, undefined, spooked), 8.64e+7) // 24 hours
    },
    async handleIdleCheck(bot, server, channel, spooked){
        if(bot.drain)return;
        if(!bot.config.getBool(server, "spook.doIdleCheck"))return bot.logger.log("Ignoring idle as doIdleCheck is off");
        let currentSpook = await bot.database.getSpooked(server);
        if(!currentSpook)return bot.logger.warn(`Not running idle check for ${server} as the spook entry couldn't be found`);
        if(spooked && currentSpook.spooked !== spooked)return bot.logger.warn(`Not running as the spook has changed since then (${currentSpook.spooked} vs ${spooked})`);
        if(currentSpook.type === "IDLE")return bot.logger.log(`Not running idle check for ${server} as last spook type was ${currentSpook.type}`);
        const guild = await bot.client.guilds.fetch(currentSpook.server).catch(()=>null);
        if(!guild || guild.deleted)return bot.logger.warn(`Guild deleted or failed to fetch.`);
        let fromMember = await guild.members.fetch(currentSpook.spooked).catch(()=>null);
        if(!fromMember) {
            bot.logger.warn(`Could not retrieve guild member for ${currentSpook.spooked}, defaulting to OcelotBOT`);
            fromMember = guild.me; // Default to OcelotBOT if the member is missing
        }
        // Run the actual force spook
        return module.exports.forceNewSpook(bot, currentSpook, "IDLE", fromMember, false, channel);
    },
    async forceNewSpook(bot, currentSpook, reason, fromMember, sendHopelessMessage, channelId){
        bot.logger.log(`Generating new spook for ${currentSpook.server} (${reason})`);
        const guild = await bot.client.guilds.fetch(currentSpook.server).catch(()=>null);
        if(!guild || guild.deleted)return bot.logger.warn(`Guild deleted or failed to fetch.`);

        let channel = await guild.channels.fetch(channelId || currentSpook.channel).catch(()=>null);
        if(!channel || channel.deleted || channel.archived){
            // Channel not accessible anymore
            await guild.channels.fetch();
            channel = guild.channels.cache.find((c)=>!c.archived && !!c.deleted && c.type === "GUILD_TEXT" && c.permissionsFor(guild.me).has("SEND_MESSAGES"));
        }

        if(!channel || !channel.members)return bot.logger.warn(`No good available channels for spook update in ${currentSpook.server}`);

        let membersNotOptedOut =  channel.members.filter((m)=>!m.user.bot && !bot.config.getBool(currentSpook.server, "spook.optout", m.id) && m.user.id !== currentSpook.spooked);
        // Look for online members first
        let toMember = membersNotOptedOut.filter((m)=>m.presence && m.presence.status !== "offline").random();
        // If there are no online members, pick a random member
        if(!toMember)toMember = membersNotOptedOut.random();
        // No members at all. I'm all alone
        if(!toMember) {
            if(sendHopelessMessage)return channel.send("I couldn't find any active, valid members to spook. If you think this is a mistake, contact the support server.");
            return bot.logger.warn("No accessible members");
        }

        await module.exports.spook(bot, {channel}, fromMember, toMember, reason);

        return channel.send(bot.lang.getTranslation(currentSpook.server, `SPOOK_FORCED_${reason}`, {fromMember, toMember}));

    },
    middleware: async function(context, bot){
        const now = new Date();
        console.log(end-now);
        if(end-now < 0 && context.options.command !== "leaderboard"){
            context.defer();
            let spookLoser = await bot.redis.cache(`spook/loser/${context.guild.id}`, async ()=>await bot.database.getSpooked(context.guild.id), 60000);
            let spookStats = await bot.redis.cache(`spook/stats/${context.guild.id}`, async ()=>await bot.database.getSpookStats(context.guild.id), 60000);
            let roleStats = await bot.redis.cache(`spook/roles/${context.guild.id}`, async ()=>await module.exports.processRolesForServer(bot, context), 60000).catch(()=>null);
            if(!spookLoser)return false;
            console.log(roleStats);
            console.log(spookStats);
            console.log(spookLoser);
            let embed = new Embeds.LangEmbed(context);
            embed.setColor("#bf621a");
            embed.setTitleLang("SPOOK_END_TITLE"); // The Spooking has ended!
            embed.setDescriptionLang("SPOOK_END_DESC", {loser: spookLoser.spooked}); // Thankyou for participating in The Spooking 2021. The loser is {{loser}}!
            // Total Spooks - This server spooked a total of {{number:totalSpooks}} times. ({{percent}}% of all spooks!)
            embed.addFieldLang("SPOOK_END_TOTAL", "SPOOK_END_TOTAL_VALUE", false, {...spookStats, percent: ((spookStats.totalSpooks/spookStats.allSpooks)*100).toFixed(2)})
            // Most Spooked - <@{{mostSpooked.user}}> was spooked {{number:mostSpooked.count}} times.
            embed.addFieldLang("SPOOK_END_MOST_TITLE", "SPOOK_END_MOST_VALUE", false, spookStats)
            if(roleStats?.assigned > 0) { // Secret Roles - {{number:assigned}} of you had secret roles. {{number:successful}} succeeded. - {{number:assigned}} of you had secret roles. None of you succeeded! You literally had one job...
                embed.addFieldLang("SPOOK_END_ROLES_TITLE", roleStats.success > 0 ? "SPOOK_END_ROLES_VALUE" : "SPOOK_END_ROLES_VALUE_NONE", false, roleStats)
            }
            embed.setFooterLang("SPOOK_END_FOOTER");
            context.send({embeds: [embed]});
            return false;
        }
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
    async processRolesForServer(bot, context){
        let assignedRoles = await bot.database.getAssignedRolesForServer(context.guild.id);
        let success = 0;
        for(let i = 0; i < assignedRoles.length; i++){
            const roleData = assignedRoles[i];
            let wasSuccess = await SpookRoles.WasSuccessful(bot, roleData);
            if(wasSuccess){
                success++;
                if(context.getBool("spook.doBadges")) {
                    console.log(roleData.userID, context.channel.id, SpookRoles.BadgeMap[roleData.role])
                    await bot.badges.giveBadgeOnce({id: roleData.userID}, context.channel, SpookRoles.BadgeMap[roleData.role]).catch(console.log);
                }
            }
        }
        return {success, assigned: assignedRoles.length};
    },
    spook: async function(bot, context, fromMember, toMember, type = "REGULAR"){
        let toMemberRole = await bot.redis.cache(`spook/role/${toMember.guild.id}/${toMember.id}`, async ()=>await bot.database.getRoleForUser(toMember.id, toMember.guild.id), 60000);
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
                    let roleInfo = await bot.redis.cache(`spook/role/${assignableRoleId}`,()=>bot.database.getRoleInfo(assignableRoleId), 60000);
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
                        bot.redis.clear(`spook/role/${toMember.guild.id}/${toMember.id}`)
                    }
                } catch (e) {
                    bot.logger.error(e);
                }
            }
        }
        bot.updatePresence();
        clearTimeout(currentSpooks[fromMember.guild.id]);
        module.exports.setIdleCheck(bot, fromMember.guild.id, toMember.user.id);
        return bot.database.spook(toMember.id, fromMember.user.id, toMember.guild.id, context.channel.id,
            fromMember.user.username, toMember.user.username, fromMember.displayHexColor, toMember.displayHexColor, fromMember.user.avatarURL({format: "png", size: 32, dynamic: false}), toMember.user.avatarURL({format: "png", size: 32, dynamic: false}), type);
    },
    run: async function (context, bot) {
        // Check if this user has opted out
        if(context.getBool("spook.optout"))
            return context.sendLang({content: "SPOOK_OPTOUT", ephemeral: true});

        // Get the current spook
        const currentSpook = await bot.database.getSpooked(context.guild.id);

        if(!context.options.user) {
            const now = new Date();
            let spookedTime = 0;
            if(currentSpook) {
                spookedTime = now - currentSpook.timestamp;
                if (!context.getBool("spook.doIdleCheck") && spookedTime > 8.64e+7 && currentSpook.type !== "IDLE") {
                    context.send({ephemeral: true, content: "The current spook has timed out."});
                    return module.exports.handleIdleCheck(bot, context.guild.id, context.channel.id, currentSpook.spooked);
                }
            }
            return context.sendLang({content: currentSpook ? "SPOOK_CURRENT" : "SPOOK_NOBODY"}, {
                spooked: currentSpook?.spooked,
                time: end,
                server: context.guild.id,
                spookedTime: bot.util.prettySeconds(spookedTime/1000, context.guild.id, context.user.id),
            });
        }

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
            embed.addFieldLang("SPOOK_INTRO_SLASHCOMMANDS_TITLE", "SPOOK_INTRO_SLASHCOMMANDS_VALUE");
            embed.addFieldLang("SPOOK_INTRO_SPECIAL_ROLES_TITLE", "SPOOK_INTRO_SPECIAL_ROLES_VALUE");
            embed.addFieldLang("SPOOK_INTRO_REWARDS_TITLE", "SPOOK_INTRO_REWARDS_VALUE");
            embed.addFieldLang("SPOOK_INTRO_OPT_OUT_TITLE", "SPOOK_INTRO_OPT_OUT_VALUE");
            embed.addFieldLang("SPOOK_INTRO_ADMINS_TITLE",
                context.getSetting("settings.role") ? "SPOOK_INTRO_ADMINS_VALUE_ROLE": "SPOOK_INTRO_ADMINS_VALUE_ROLE", false, {role: context.getSetting("settings.role")});
            await context.send({embeds: [embed]});
        }

        module.exports.spook(bot, context, context.member, member);
        const result = await bot.database.getSpookCount(member.id, context.guild.id);
        return context.sendLang({content: "SPOOK"}, {spooked: member.id, count: Strings.GetNumberPrefix(parseInt(result)+1)});

    }
};
