const chrono = require("chrono-node");
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");
module.exports = {
    name: "Create Countdown",
    usage: "to :date :id :name+",
    commands: ["to", "from", "create", "add", "new"],
    run: async function (context, bot) {
        const guild = context.guild?.id || context.channel.id;
        const now = new Date();
        const input = `${context.options.date} ${context.options.id} ${context.options.name}`;
        const rargs = regex.exec(input);
        const chronoParse = (chrono.parse(input, now))[0];

        let at = null;
        if (chronoParse?.start)
            at = chronoParse.start.date();

        if (!chronoParse?.text)
            return context.sendLang("REMIND_INVALID_MESSAGE");

        let id = input.substring(input.indexOf(chronoParse.text) + chronoParse.text.length+1);
        id = id.substring(0, id.indexOf(" "));
        let countdownMessage = null;
        if (!rargs || rargs.length < 3) {
            const guessedContent = input.substring(input.indexOf(chronoParse.text) + chronoParse.text.length);
            if (!guessedContent)
                return context.sendLang("REMIND_INVALID_MESSAGE");
            countdownMessage = guessedContent;
        } else
            countdownMessage = rargs[2];

        id = id.toLowerCase().trim();
        countdownMessage = countdownMessage.trim();
        if(id.length > 512)
            return context.sendLang({content: "COUNTDOWN_ID_TOO_LONG"});

        if(countdownMessage.length > 2000)
            return context.sendLang({content: "COUNTDOWN_MESSAGE_TOO_LONG"});

        let currentCountdown = await bot.database.getCountdown(id, guild);

        if(currentCountdown)
            return context.sendLang({content: "COUNTDOWN_ALREADY_EXISTS", ephemeral: true}, {id});


        await bot.database.addCountdown(id, guild, context.user.id, at, countdownMessage);

        return context.sendLang({content: "COUNTDOWN_SUCCESS"}, {id, at});

    }
}