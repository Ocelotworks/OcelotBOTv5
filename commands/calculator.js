const mathjs = require('mathjs');
const math = mathjs.create(mathjs.all)
const Discord = require('discord.js');
const limitedEval = math.eval;
let scope = {};

module.exports = {
    name: "Calculator",
    usage: "calc [sum]",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["calc", "calculator", "math"],
    init: function(bot, test = false){
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
    run: async function(message, args, bot){
        if(!args[1]){
            message.channel.send(`Usage: ${message.getSetting("prefix")}calc <expression>`);
        }else {
            try {
                message.channel.send(Discord.escapeMarkdown(limitedEval(message.content.substring(args[0].length + 1), scope).toString()).replace(/[@!#]/gi, ""));
            } catch (e) {
                message.channel.send(e.toString());
            }
        }
    },
    test: function(test){
        const bot = {
            logger: {
                warn: function(){}
            },
            raven: {
                captureException: function(){}
            }
        };
        module.exports.init(bot, true);

        test('calc no arguments', function(t){
            const args = ["calc"];
            const message = {
                channel: {
                    send: function(message){
                        if(message.startsWith("Usage:"))
                            t.pass();
                        else
                            t.fail();
                    }
                },
                getSetting: function(key){
                    t.is(key, "prefix");
                    return "!";
                }
            };
            module.exports.run(message, args);
        });

        test('calc 1+1 single argument', function(t){
            const args = ["calc", "1+1"];
            const message = {
                content: "calc 1+1",
                channel: {
                    send: function(message){
                       t.is(message, "2");
                    }
                }
            };
            module.exports.run(message, args);
        });

        test('calc 1+1 triple argument', function(t){
            const args = ["calc", "1+1"];
            const message = {
                content: "calc 1 + 1",
                channel: {
                    send: function(message){
                        t.is(message, "2");
                    }
                }
            };
            module.exports.run(message, args);
        });

        function disabledTest(name){
            test('calc disabled '+name, function(t){
                const args = ["calc", "aaaa"];
                const message = {
                    content: `calc ${name}(1,5)`,
                    channel: {
                        send: function(message){
                            t.is(message, `Error: Function ${name} is disabled`)
                        }
                    }
                };
                module.exports.run(message, args);
            });
        }
        disabledTest('import');
        disabledTest('createUnit');
        disabledTest('eval');
        disabledTest('parse');
        disabledTest('simplify');
        disabledTest('derivative');
        disabledTest('range');
    }
};