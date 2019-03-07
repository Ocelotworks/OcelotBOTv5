/**
 * Created by Peter on 01/07/2017.
 */

const request = require('request');
module.exports = {
    name: "Urban Dictionary",
    usage: "defineud <word>",
    categories: ["tools", "fun"],
    commands: ["defineud", "ud", "urban", "urbandictionary"],
    run: function run(message, args, bot) {
        if(!args[1]){
            message.channel.send(`Usage: ${(message.guild && bot.prefixCache[message.guild.id]) || "!"}defineud <term>`);
            return;
        }
        const term = encodeURIComponent(args.slice(1).join(" "));
        request(`http://api.urbandictionary.com/v0/define?term=${term}`, async function(err, resp, body){
            if(err){
                bot.raven.captureException(err);
                bot.logger.error(err.stack);
                message.replyLang("UD_ERROR");
            }else{
                try{
                    const data = JSON.parse(body);
                    if(data && data.list.length > 0){
                        let index = 0;
                        const entry = data.list[index];
                        const sentMessage = await message.replyLang("UD_DEFINITION", {word: entry.word, definition: entry.definition, example: entry.example});
                        const permissions = await message.channel.permissionsFor(bot.client.user);
                        if(permissions.has(["ADD_REACTIONS", "MANAGE_MESSAGES"])){
                            await sentMessage.react("⬅");
                            await sentMessage.react("➡");
                            sentMessage.awaitReactions(async function processReaction(reaction, user) {
                                if (user.id === bot.client.user.id) return false;

                                if (reaction.emoji.name === "➡") { //Move forwards
                                    index++;
                                } else if (reaction.emoji.name === "⬅") { //Move backwards
                                    index--;
                                }

                                if (index < 0) index = data.list.length - 1;
                                if (index > data.list.length - 1) index = 0;

                                const newEntry = data.list[index];

                                sentMessage.editLang("UD_DEFINITION", {
                                    word: newEntry.word,
                                    definition: newEntry.definition.substring(0, 800),
                                    example: newEntry.example.substring(0, 800)
                                });

                                reaction.remove(user);

                                return true;
                            }, {
                                time: 60000
                            }).then(function removeReactions() {
                                bot.logger.log(`Reactions on !defineud ${message.id} have expired.`);
                                sentMessage.clearReactions();
                            }).catch(function reactionError(err) {
                                bot.logger.error(`!defineud ${message.id} errored on reaction. ${err}`);
                                bot.raven.captureException(err);
                                sentMessage.clearReactions();
                            });
                        }else{
                            bot.logger.log(`Channel ${message.channel.id} (${message.channel.name} in ${message.channel.guild.name}) doesn't allow MANAGE_MESSAGES or ADD_REACTIONS`);
                            sentMessage.edit(":information_source: _Tip: You can scroll though definitions if OcelotBOT has 'Manage Messages' and 'Add Reactions' permissions._\n"+sentMessage.content);
                        }

                    }else{
                        message.replyLang("UD_NO_DEFINITIONS");
                    }
                }catch(e){
                    bot.raven.captureException(e);
                    bot.logger.error(e.stack);
                    message.replyLang("UD_INVALID_RESPONSE");
                }
            }
        });

    }
};