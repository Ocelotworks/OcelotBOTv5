module.exports = {
    name: "Roles",
    usage: "roles help",
    categories: ["tools"],
    commands: ["roles", "autorole"],
    hidden: true,
    roleData: {
        serverID: {
            message: "",
            messageID: "",
        }, loaded: {
            discordMessageId: {emoji: "role"}
        }
    },
    init: function init(bot) {
        bot.util.standardNestedCommandInit("roles");

        bot.client.on("ready", async () => {
            const messages = await bot.database.loadRoleMessagesForShard([...bot.client.channels.cache.keys()])

            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                module.exports.roleData.loaded[message.message] = {};
                try {
                    const channel = await bot.client.channels.fetch(message.channel);
                    const discordMessage = await channel.messages.fetch(message.message);
                    let buttons = await bot.database.getButtonsForRoleMessage(message.id);
                    for (let j = 0; j < buttons.length; j++) {
                        const button = buttons[j];
                        module.exports.roleData.loaded[message.message][button.emoji] = button.role;
                        if (!discordMessage.reactions.cache.find((reaction) => reaction.toString() === button.emoji)) {
                            console.log("adding missing reaction ", button);
                            // Stupid shit aint working
                            if (button.emoji.startsWith("<")) {
                                console.log(button.emoji.split(":")[2].replace(">", ""))
                                await discordMessage.react(button.emoji.split(":")[2].replace(">", ""));
                            } else {
                                await discordMessage.react(button.emoji);
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`Unable to load message ${message.id}:`);
                    console.warn(e);
                }
            }
        })

        bot.client.on("messageReactionAdd", async (reaction, user) => {
            if (!reaction.message.guild || user.bot) return;
            const reactionData = module.exports.roleData.loaded[reaction.message.id];
            if (!reactionData) return;
            reaction = await reaction.fetch();
            const role = reactionData[reaction.emoji.toString()];
            if (!role) return;
            try {
                let member = await reaction.message.guild.members.fetch(user.id);
                await member.roles.add(role, "Clicked reaction button");
            } catch (e) {
                console.log("Could not add role: ");
                console.log(e);
                await reaction.remove();
            }
        });

        bot.client.on("messageReactionRemove", async (reaction, user) => {
            if (!reaction.message.guild || user.bot) return;
            const reactionData = module.exports.roleData.loaded[reaction.message.id];
            if (!reactionData) return;
            reaction = await reaction.fetch();
            const role = reactionData[reaction.emoji.toString()];
            if (!role) return;
            try {
                let member = await reaction.message.guild.members.fetch(user.id);
                await member.roles.remove(role, "Clicked reaction button");
            } catch (e) {
                console.log("Could not remove role: ");
                console.log(e);
                await reaction.remove();
            }
        });
    },
    run: async function run(message, args, bot) {

    }
};