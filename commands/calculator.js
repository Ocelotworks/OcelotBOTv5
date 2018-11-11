const math = require('mathjs');
const limitedEval = math.eval;

math.import({
    'import': function () { throw new Error('Function import is disabled') },
    'createUnit': function () { throw new Error('Function createUnit is disabled') },
    'eval': function () { throw new Error('Function eval is disabled') },
    'parse': function () { throw new Error('Function parse is disabled') },
    'simplify': function () { throw new Error('Function simplify is disabled') },
    'derivative': function () { throw new Error('Function derivative is disabled') }
}, {override: true});


let scope = {};

module.exports = {
    name: "Calculator",
    usage: "calc [sum]",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["calc", "calculator"],
    run: async function(message, args, bot){
        if(!args[1]){
            message.channel.send(`Usage: (message.guild && bot.prefixCache[message.guild.id]) || "!"calc <expression>`);
        }else {
            try {
                message.channel.send(limitedEval(message.content.substring(args[0].length + 1), scope).toString());
            } catch (e) {
                message.channel.send(e.toString());
            }
        }
    }
};