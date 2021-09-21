const chrono = require("chrono-node");
const Embeds = require("../../util/Embeds");
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");
module.exports = {
    name: "Create Event",
    usage: "create :timeAndName+",
    commands: ["add", "new", "create"],
    run: async function (context, bot) {
        // TODO: This is duplicated across reminders, countdowns and events, this should be standardised
        const now = new Date();
        const input = context.options.timeAndName;
        const rargs = regex.exec(input);
        const chronoParse = (chrono.parse(input, now))[0];

        let at = null;
        if (chronoParse?.start)
            at = chronoParse.start.date();

        if (!chronoParse?.text)
            return context.sendLang("EVENTS_UNKNOWN_TIME");

        let message = null;
        if (!rargs || rargs.length < 3) {
            const guessedContent = input.substring(input.indexOf(chronoParse.text) + chronoParse.text.length);
            if (!guessedContent)
                return context.sendLang("EVENTS_INVALID_MESSAGE");
            message = guessedContent;
        } else
            message = rargs[2];

        message = message.trim();

        if(message.length > 256)
            return context.sendLang({content: "EVENTS_NAME_TOO_LONG"});

        if(!at)
            return context.sendLang({content: "EVENTS_INVALID_TIME"});

        if(at < now)
            return context.sendLang({content: "EVENTS_TIME_PAST"});

        if (at.getTime() >= 2147483647000)
            return context.sendLang({content: "EVENTS_TIME_TOO_FAR"});


        let event = await bot.database.createEvent(context.guild.id, context.channel.id, context.user.id, message, at);

        let eventEmbed = new Embeds.LangEmbed(context);

        eventEmbed.setAuthorLang("EVENTS_UPCOMING_AUTHOR", {},"https://cdn.discordapp.com/emojis/850831485418340352.png?v=1"); // TODO: Host that image somewhere
        eventEmbed.setTitle(message);
        eventEmbed.setDescriptionLang("EVENTS_UPCOMING_DESC", {at});
        return context.send({embeds: [eventEmbed], components: [bot.util.actionRow(
         {type: 2, custom_id: `E${event[0]}:GOING`, label: context.getLang("EVENTS_GOING"), style: 3, emoji: "✔️"},
                {type: 2, custom_id: `E${event[0]}:INTERESTED`, label: context.getLang("EVENTS_INTERESTED"), style: 1, emoji: "⭐"},
                {type: 2, custom_id: `E${event[0]}:NOT_GOING`, label: context.getLang("EVENTS_NOT_GOING"), style: 2, emoji: "❌"}
            )]})
    }
}