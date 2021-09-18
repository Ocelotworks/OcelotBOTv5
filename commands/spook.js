const Embeds = require("../util/Embeds");
const Strings = require("../util/String");
const end = new Date("1 November 2021");
 const start = new Date("1 October 2021");
 //const start = new Date("1 September 2021");
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
    },
    middleware: async function(context, bot){
        const now = new Date();
        if(start-now > 0 && !context.getBool("spook.testing")) {
            const setReminder = bot.interactions.fullSuggestedCommand(context, `remind on 1st October at 00:0${bot.util.intBetween(0, 9)} **The Spooking** starts now!`);
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
    spook: async function(bot, context, fromMember, toMember, rollback = false){
        return bot.database.spook(toMember.id, fromMember.user.id, fromMember.guild.id, context.channel.id,
            fromMember.user.username, toMember.user.username, fromMember.displayHexColor, toMember.displayHexColor, fromMember.user.avatarURL({format: "png", size: 32, dynamic: false}), toMember.user.avatarURL({format: "png", size: 32, dynamic: false}), rollback);
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

        await module.exports.spook(bot, context, context.member, member);

        const result = await bot.database.getSpookCount(member.id, context.guild.id);

        return context.sendLang({content: "SPOOK"}, {spooked: member.id, count: Strings.GetNumberPrefix(result)});

    }
};
