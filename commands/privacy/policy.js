module.exports = {
    name: "View Privacy Policy",
    usage: "policy",
    commands: ["policy", "privacypolicy"],
    run: async function (message, args, bot) {
        return message.channel.send(`OcelotBOT's privacy policy is available here: <https://ocelotbot.xyz/privacy.html>\nBy using the bot, you agree to this policy. To view your options for data collection, type ${args[0]} help.`);
    }
};