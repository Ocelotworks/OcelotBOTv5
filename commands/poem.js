module.exports = {
    name: "Generate Poem",
    usage: "poem",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["poem"],
    hidden: true,
    run: async function(message, args, bot){
        if(!message.getSetting("ocelotworks"))return;
        let messageResult = await message.channel.send("Generating Poem...");
        let poemResult = await bot.database.getRandomRosesPoem();
        messageResult.edit(`.\nRoses Are Red\nViolets Are Blue\n_${poemResult[0].message}_\n\n-${poemResult[0].user} ${new Date(poemResult[0].time).getFullYear()}`);
    }
};