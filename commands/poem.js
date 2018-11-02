module.exports = {
    name: "Generate Poem",
    usage: "poem",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["poem"],
    run: async function(message, args, bot){
        // noinspection EqualityComparisonWithCoercionJS
        if(!message.guild || message.guild.id != "478950156654346292")return;
        let messageResult = await message.channel.send("Generating Poem...");
        let poemResult = await bot.database.getRandomRosesPoem();
        messageResult.edit(`.\nRoses Are Red\nViolets Are Blue\n_${poemResult[0].message}_\n\n-${poemResult[0].user} ${new Date(poemResult[0].time).getFullYear()}`);
    }
};