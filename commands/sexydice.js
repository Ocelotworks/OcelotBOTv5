const dice1 = ["KISS", "BLOW", "LICK", "SUCK", "TEASE", "WHISPER INTO", "TOUCH", "SPANK", "TICKLE"];
const dice2 = ["THIGH", "NECK", "HAND", "ASS", "NAVEL", "EARS", "BREAST", "VAGINA", "URETHRA", "CHEST", "LIPS", "TONGUE", "EYES", "HAIR"];

module.exports = {
    name: "Sexy Dice",
    usage: "sexydice",
    nsfw: true,
    commands: ["sexydice", "sexdice", "lovedice"],
    categories: ["nsfw", "fun"],
    hidden: true,
    run: function run(context, bot) {
        return context.send(`:game_die: \`${bot.util.arrayRand(dice1)}\` :game_die: \`${bot.util.arrayRand(dice2)}\``);
    }
};