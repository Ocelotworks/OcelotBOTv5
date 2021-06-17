/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Coin Flip",
    usage: "flip :0coins?",
    detailedHelp: "Heads or tails",
    usageExample: "flip",
    responseExample: "🌕 TAILS!",
    commands: ["flip", "coin"],
    categories: ["tools"],
    run: function run(context, bot) {
        if(context.options.coins && !isNaN(context.options.coins) && context.options.coins > 1 && context.options.coins < 100000){
            const coins = parseInt(context.options.coins);
            let heads = 0;
            for(let i = 0; i < coins; i++)
                if(Math.random() > 0.5)heads++;
            return context.send(`Flipped ${coins.toLocaleString()} coins:\n:full_moon: **${heads.toLocaleString()}** HEADS\n:new_moon: **${(coins-heads).toLocaleString()}** TAILS`);
        }
        return context.sendLang("FLIP_" + (Math.random() > 0.5 ? "HEADS" : "TAILS"))
    }
};