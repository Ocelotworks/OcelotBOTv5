const math = require('mathjs');
const request = require('request');
const config = require('config');
const limitedEval = math.eval;
let scope = {};

const aliases = {
    USD: "$",
    GBP: "£",
    EUR: "€"
};

module.exports = {
    name: "Calculator",
    usage: "calc [sum]",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["calc", "calculator", "math"],
    init: function(bot){
        request(`http://data.fixer.io/api/latest?access_key=${config.get("Commands.math.key")}`, function(err, resp, body){
            if(!err) {

                try {
                    const data = JSON.parse(body);
                    if (data.base && data.rates) {
                        math.createUnit(data.base);
                        for (let currency in data.rates) {
                            if(!data.rates.hasOwnProperty(currency))continue;
                            if(currency === data.base)continue;
                            math.createUnit(currency, {
                                definition: `${data.rates[currency]} ${data.base}`,
                                aliases: currency !== "CUP" ? [currency.toLowerCase()] : null
                            });
                        }
                    }
                } catch (e) {
                    bot.logger.warn(`Error parsing currencies: ${e}`);
                    bot.raven.captureException(e);
                }
            }else{
                bot.logger.warn(`Error getting currencies: ${err}`);
                bot.raven.captureException(err);
            }

            math.import({
                'import': function () { throw new Error('Function import is disabled') },
                'createUnit': function () { throw new Error('Function createUnit is disabled') },
                'eval': function () { throw new Error('Function eval is disabled') },
                'parse': function () { throw new Error('Function parse is disabled') },
                'simplify': function () { throw new Error('Function simplify is disabled') },
                'derivative': function () { throw new Error('Function derivative is disabled') }
            }, {override: true});
        });
    },
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