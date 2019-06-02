const Discord = require('discord.js');
const numWords = require('num-words');

module.exports = {
    name: "Poll",
    usage: "poll <option 1, option 2, option 3..>",
    categories: ["fun"],
    commands: ["poll"],
    run: async function (message, args, bot) {
        let fullArgs = Discord.escapeMarkdown(args.slice(1).join(" "));
        let options = fullArgs.split(',');
        let count = 1;
        let output = "Poll:\n";
        let votes = [];
        let voters = [];
        let currentVotes = {};
        let voteReactions = {};


        //write line for each entry
        options.forEach(function (item) {
            output += ":" + numWords(count) + ": - " + item + "\n";
            votes[count-1] = 0;
            count++
        });

        //send the message and add reactions
        let sentMessage = await message.channel.send(output);
        for (let i = 1; i < count; i++) {
            await sentMessage.react(i + "⃣");
        }


        await sentMessage.awaitReactions(async function (reaction, user) {
            if (user.id === bot.client.user.id) return false;
            let vote = reaction.emoji.name.substr(0, 1)-1;

            //Have they voted before?
            if (voters.indexOf(user.id) !== -1) {
                //remove their vote and reaction
                votes[currentVotes[user.id]]--;
                if(voteReactions[user].emoji.name !== reaction.emoji.name)
                    voteReactions[user].remove(user);
            }

            //add them to the voting table, set their vote, record reaction, add vote
            voters.push(user.id);
            currentVotes[user.id] = vote;
            voteReactions[user] = reaction;
            votes[vote]++;

        }, {time: 120000 / 4});


        //Count which option wins
        let winningOption = 0;
        let draw = false;

        for(let i = 0; i < votes.length; i++){
            if (votes[i] > votes[winningOption])
                winningOption = i;
        }

        if(votes.indexOf(winningOption) > 1){
            draw = true;
        }

        if (!sentMessage.deleted) {
            bot.logger.info(`Reactions on ${sentMessage.id} have expired.`);
            sentMessage.clearReactions();
        }

        if(!draw) {
            message.channel.send(options[winningOption] + " wins the vote!");
        } else {
            message.channel.send("There was a draw!");
        }
    }
};