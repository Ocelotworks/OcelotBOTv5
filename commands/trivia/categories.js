const Embeds = require("../../util/Embeds");
const {MessageCommandContext} = require("../../util/CommandContext");
const {axios} = require('../../util/Http');
module.exports = {
    name: "Categories",
    usage: "categories",
    commands: ["category", "catagory", "categories", "catagories"],
    run: async function (context, bot) {
        const embed = new Embeds.AuthorEmbed(context);
        embed.setTitle("Trivia Categories");
        embed.setDescription("Select a trivia category from the dropdown below.\nYou can use the ID number for quick access in the future.");


        let result = await axios.get("https://opentdb.com/api_category.php");
        let options = []

        for(let i = 0; i < result.data.trivia_categories.length; i++){
            const category = result.data.trivia_categories[i];
            let categoryNames = category.name.split(":")
            let option = {label: categoryNames[0], description: `ID: ${category.id}`, value: `${category.id}`};
            if(categoryNames[1]) {
                option.label = categoryNames[1];
                option.description = `${categoryNames[0]} (ID: ${category.id})`;
            }

            options.push(option);
        }

        let message = await context.send({embeds: [embed], ephemeral: true, components: [bot.util.actionRow(bot.interactions.addDropdown("Select Category...", options, (interaction)=>{
            const categoryID = parseInt(interaction.values[0]);
            // This is some real funky shit
            const args = [context.command, categoryID];
            bot.command.runCommand(bot.command.initContext(new MessageCommandContext(bot, context.message, args, context.command)));
            if(message)message.delete();
        }, 1, 1))]});


    }
};


