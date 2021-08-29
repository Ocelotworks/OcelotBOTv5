const Image = require('../util/Image');
module.exports = {
    name: "Trump Tweet",
    usage: "trumptweet :text+",
    detailedHelp: "Makes a fake Trump tweet",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["trumptweet", "trump"],
    rateLimit: 10,
    categories: ["text"],
    unwholesome: true,
    slashCategory: "images",
    usageExample: "trumptweet This has been the worst trade deal in history!",
    handleError: function(context){
        return context.sendLang({content: "GENERIC_TEXT", ephemeral: true});
    },
    run: function (context) {
        return Image.NekobotTextGenerator(context, "trumptweet", context.options.text);
    }
};