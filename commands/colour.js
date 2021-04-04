/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/11/2019
 * ╚════ ║   (ocelotbotv5) colour
 *  ════╝
 */
module.exports = {
    name: "Colour Code",
    usage: "colour <code> [code] ...",
    detailedHelp: "Accepts HTML Colour codes e.g #FF0000",
    usageExample: "colour #FF0000",
    categories: ["tools"],
    rateLimit: 40,
    commands: ["colour", "color"],
    run: function run(message, args, bot) {
        if (!args[1]) {
            return message.replyLang("COLOUR_USAGE", {arg: args[0]});
        }
        const size = parseInt(message.getSetting("colour.size"));
        const colours = [];
        for(let i = 1; i < args.length; i++){
            let input = args[i];
            if(!input.startsWith("#"))input = "#"+input;
            if(input.length !== 7 && input.length !== 9)continue;
            colours.push(input);
        }
        if(colours.length === 0){
            return message.channel.send("Please enter a full colour code like #00FF00 or #FF00FFFF");
        }

        const filter = [];
        const stripWidth = size/colours.length;
        if(stripWidth < 1)return message.channel.send("Too many colours!");
        for(let i = 0; i < colours.length; i++){
            filter.push({
               name: "rectangle",
                args: {
                    x: i*stripWidth,
                    y: 0,
                    w: stripWidth,
                    height: size,
                    colour: colours[i],
                }
            })
        }

        return bot.util.imageProcessor(message, {
            components: [{
                pos: {
                    x: 0,
                    y: 0,
                    w: size,
                    h: size,
                },
                filter,
            }],
            width: size,
            height: size,
        }, 'colour')

    },
};