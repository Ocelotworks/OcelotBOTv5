module.exports = {
    name: "Help",
    usage: "help",
    commands: ["help", "commands", "usage"],
    slashHidden: true,
    run: async function (context, bot) {
        return context.send({content: "This command is now only available as a slash command. Please use </remind set:904885955486433292>", ephemeral: true});
    }
};