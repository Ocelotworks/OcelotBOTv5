/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/11/2019
 * ╚════ ║   (ocelotbotv5) colour
 *  ════╝
 */
const presets = {
    "red": "#ff0000",
    "green": "#00ff00",
    "blue": "#0000ff",
    "white": "#ffffff",
    "black": "#000000",
    "yellow": "#ffff00",
    "cyan": "#00ffff",
    "magenta": "#ff00ff",
    "grey": "#c3c3c3",
    "indigo": "#4B0082",
    "violet": "#9400D3",
    "discord": "#7289da",
    "ocelotbot": "#03f783",
    "google": ["#4285F4", "#DB4437", "#F4B400", "#0F9D58"],
    "rainbow": ["#9400D3", "#4B0082", "#0000FF", "#00FF00", "#FFFF00", "#FF7F00", "#FF0000"],
    "gay": ["#E70000","#FF8C00","#FFEF00","#00811F","#0044FF","#760089"],
    "neapolitan": ["#efa3f5", "#794b4b", "#f5e6ba"],
    "france": ["#002395", "#ffffff", "#ED2939"]
}
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
            const preset = presets[input.toLowerCase()]
            if(preset){
                if(typeof preset === "object")
                    colours.push(...preset);
                else
                    colours.push(preset)
                continue;
            }
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