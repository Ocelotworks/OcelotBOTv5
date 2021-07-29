const Image = require('../util/Image');
module.exports = {
    name: "Fake Tweet",
    usage: "faketweet :username :text+",
    detailedHelp: "Makes a fake tweet from a specified twitter account",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["faketweet", "tweet"],
    rateLimit: 10,
    categories: ["text"],
    unwholesome: true,
    usageExample: "faketweet jack just setting up my twttr",
    handleError: function(context){
        return context.send({content: `You need to enter a Twitter username and a message. e.g **${context.getSetting("prefix")}${context.command} jack just setting up my twttr**`, ephemeral: true});
    },
    run: function (context) {
        return Image.NekobotGenerator(context, "tweet", `text=${context.text}&username=${context.options.username.replace("@","")}`);
    }
};