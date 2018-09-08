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

module.exports = {
    name: "Calculator",
    usage: "calc [sum]",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["calc", "calculator"],
    run: async function(message, args, bot){
        // noinspection EqualityComparisonWithCoercionJS
        try{
            message.channel.send(limitedEval(message.content.substring(args[0].length+1)).toString())
        }catch(e){
            message.channel.send(e.toString());
        }
    }
};