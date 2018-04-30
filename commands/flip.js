/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Coin Flip",
    usage: "flip",
    commands: ["flip", "coin"],
    run: function run(message, args, bot) {
        message.replyLang("FLIP_"+(bot.rigFlip || (Math.random() > 0.5 ? "HEADS" : "TAILS")))
    }
};