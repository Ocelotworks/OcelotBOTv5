/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Coin Flip",
    usage: "flip",
    commands: ["flip", "coin"],
    categories: ["tools", "fun"],
    run: function run(message, args, bot) {
        message.replyLang("FLIP_"+(bot.rigFlip || (Math.random() > 0.5 ? "HEADS" : "TAILS")))
    },
    test: function(test){
        test('flip', function(t){
            const message = {
                replyLang: function(message){
                    if(message.startsWith("FLIP_"))
                        t.pass();
                }
            };
            module.exports.run(message, [], {});
        });
        test('flip rigged', function(t){
            const message = {
                replyLang: function(message){
                   t.is(message, "FLIP_HEADS")
                }
            };
            module.exports.run(message, [], {rigFlip: "HEADS"});
        });
    }
};