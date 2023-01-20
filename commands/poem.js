module.exports = {
    name: "Generate Poem",
    usage: "poem",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["poem"],
    commandPack: "ocelotworks",
    run: async function (context, bot) {
        if (!context.getSetting("ocelotworks")) return;
        let messageResult = await context.send("Generating Poem...");
        let poemResult = await bot.database.getRandomRosesPoem();
        context.edit(`.\nRoses Are Red\nViolets Are Blue\n_${poemResult[0].message}_\n\n-${poemResult[0].user} ${new Date(poemResult[0].time).getFullYear()}`, messageResult);
    }
};