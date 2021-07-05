const mathjs = require('mathjs');
const math = mathjs.create(mathjs.all)
const Discord = require('discord.js');
const limitedEval = math.evaluate;
let scope = {};
//×
module.exports = {
    name: "Calculator",
    usage: "calc :sum+",
    detailedHelp: "Calculate something",
    usageExample: "calc 8.30662386292^2",
    responseExample: "69.00000000003199",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["calc", "calculator", "math"],
    init: function(bot){
        math.import({
            'import': function () { throw new Error('Function import is disabled') },
            'createUnit': function () { throw new Error('Function createUnit is disabled') },
            'eval': function () { throw new Error('Function eval is disabled') },
            'parse': function () { throw new Error('Function parse is disabled') },
            'simplify': function () { throw new Error('Function simplify is disabled') },
            'derivative': function () { throw new Error('Function derivative is disabled') },
            'range': function () { throw new Error('Function range is disabled') }
        }, {override: true});
    },
    run: async function(context, bot){
        try {
            let expression = context.options.sum;
            expression.replace(/×/g, "*");
            expression.replace(/÷/g, "/");
            context.send(Discord.Util.escapeMarkdown(limitedEval(expression, scope).toString()).replace(/[@!#]/gi, ""));
        } catch (e) {
            context.send({content: e.toString()});
        }
    }
};