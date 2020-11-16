module.exports = {
    name: "Set Role Message",
    usage: "setMessage",
    commands: ["setmessage", "sm"],
    run: async function (message, args, bot, roleData) {
        const result = await bot.database.addRoleMessage(message.channel.id, message.id);
        const id = result[0];

        roleData[message.guild.id] = {messageID: id, message: message};
        message.channel.send("Your message has been set as the role message. Role buttons will be added to that message, feel free to edit it as you please.");
    }
};