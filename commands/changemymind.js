const Image = require('../util/Image');
module.exports = {
    name: "Change My Mind Meme",
    usage: "changemymind :text+",
    usageExample: "changemymind OcelotBOT is the best bot",
    detailedHelp: "A 'Change My Mind' meme",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["changemymind"],
    rateLimit: 10,
    categories: ["memes"],
    slashCategory: "images",
    handleError: function(context){
        return context.sendLang({content: "GENERIC_TEXT", ephemeral: true});
    },
    run: function (context) {
        return Image.NekobotTextGenerator(context, "changemymind", context.options.text);
    }
};