module.exports = {
    name: "View Privacy Policy",
    usage: "policy",
    commands: ["policy", "privacypolicy"],
    run: async function (context, bot) {
        return context.send(`OcelotBOT's privacy policy is available here: <https://ocelotbot.xyz/privacy.html>\nBy using the bot, you agree to this policy. To view your options for data collection, type ${context.command} help.`);
    }
};