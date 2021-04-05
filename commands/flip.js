/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Coin Flip",
    usage: "flip [coins]",
    detailedHelp: "Heads or tails",
    usageExample: "flip",
    responseExample: "🌕 TAILS!",
    commands: ["flip", "coin"],
    categories: ["tools"],
    run: function run(message, args, bot) {
        if(args[1] && !isNaN(args[1]) && args[1] > 1 && args[1] < 100000){
            const coins = parseInt(args[1]);
            let heads = 0;
            for(let i = 0; i < coins; i++)
                if(Math.random() > 0.5)heads++;
            return message.channel.send(`Flipped ${coins.toLocaleString()} coins:\n:full_moon: **${heads.toLocaleString()}** HEADS\n:new_moon: **${(coins-heads).toLocaleString()}** TAILS`);
        }
        return message.replyLang("FLIP_" + (bot.rigFlip || (Math.random() > 0.5 ? "HEADS" : "TAILS")))
    },
    test: function (test) {
        test('flip', function (t) {
            const message = {
                replyLang: function (message) {
                    if (message.startsWith("FLIP_"))
                        t.pass();
                }
            };
            module.exports.run(message, [], {});
        });
        test('flip rigged', function (t) {
            const message = {
                replyLang: function (message) {
                    t.is(message, "FLIP_HEADS")
                }
            };
            module.exports.run(message, [], {rigFlip: "HEADS"});
        });
    }
};