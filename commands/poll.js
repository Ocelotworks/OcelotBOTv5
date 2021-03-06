const Discord = require('discord.js');
const emojis = [
    "1⃣",
    "2⃣",
    "3⃣",
    "4⃣",
    "5⃣",
    "6⃣",
    "7⃣",
    "8⃣",
    "9⃣",
    "🔟",
    "🇦",
    "🇧",
    "🇨",
    "🇩",
    "🇪",
    "🇫",
    "🇬",
    "🇭",
    "🇮",
    "🇯"
];

module.exports = {
    name: "Poll",
    usage: "poll <option 1, option 2, option 3...>",
    detailedHelp: "Separate each option in the poll with a comma",
    categories: ["tools"],
    commands: ["poll"],
    run: async function (message, args, bot) {
        let fullArgs = Discord.escapeMarkdown(args.slice(1).join(" "));
        let options = fullArgs.split(',');
        if (options.length < 2)
            return message.channel.send(`:bangbang: You need to enter at least 2 poll items. For example, ${args[0]} Dogs, Cats`);

        if (options.length > 20)
            return message.channel.send(":bangbang: You can only enter a maximum of 20 poll options.");

        bot.tasks.startTask("poll", message.id);

        let count = 0;
        let output = "Poll (30 Seconds):\n";
        let votes = [];
        let voters = [];
        let currentVotes = {};
        let voteReactions = {};


        //write line for each entry
        options.forEach(function (item) {
            output += `${emojis[count]} - ${item.trim()}\n`;
            votes[count] = 0;
            count++
        });

        //send the message and add reactions
        let sentMessage = await message.channel.send(output);
        for (let i = 0; i < count; i++) {
            console.log(emojis[i]);
            await sentMessage.react(emojis[i]);
        }


        await sentMessage.awaitReactions(async function (reaction, user) {
            if (user.id === bot.client.user.id) return false;
            let vote = reaction.emoji.name.substr(0, 1) - 1;

            //Have they voted before?
            if (voters.indexOf(user.id) !== -1) {
                //remove their vote and reaction
                votes[currentVotes[user.id]]--;
                if (voteReactions[user].emoji.name !== reaction.emoji.name)
                    voteReactions[user].users.remove(user);
            }

            //add them to the voting table, set their vote, record reaction, add vote
            voters.push(user.id);
            currentVotes[user.id] = vote;
            voteReactions[user] = reaction;
            votes[vote]++;

        }, {time: 30000});


        //Count which option wins
        let winningOption = 0;
        let draw = false;

        for (let i = 0; i < votes.length; i++) {
            if (votes[i] > votes[winningOption])
                winningOption = i;
        }

        if (votes.indexOf(winningOption) > 1) {
            draw = true;
        }

        if (!sentMessage.deleted) {
            bot.logger.info(`Reactions on ${sentMessage.id} have expired.`);
            sentMessage.reactions.removeAll();
        }

        if (!draw) {
            message.channel.send(options[winningOption] + " wins the vote!");
        } else {
            message.channel.send("There was a draw!");
        }

        bot.tasks.endTask("poll", message.id);
    }
};