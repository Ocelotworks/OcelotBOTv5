/**
 * Created by Peter on 12/01/2018.
 */


const dice1 = ["KISS", "BLOW", "LICK", "SUCK", "TEASE", "WHISPER INTO", "TOUCH", "SPANK", "TICKLE"];
const dice2 = ["THIGH", "NECK", "HAND", "ASS", "NAVEL", "EARS", "BREAST", "VAGINA", "URETHRA", "CHEST", "LIPS", "TONGUE", "EYES", "HAIR"];

module.exports = {
	name: "Sexy Dice",
	usage: "sexydice",
	accessLevel: 0,
	commands: ["sexydice", "sexdice", "lovedice"],
	run: function run(user, userID, channel, message, args, event, bot, recv){
		recv.sendMessage({
			to: channel,
			message: `:game_die: \`${bot.util.arrayRand(dice1)}\` :game_die: \`${bot.util.arrayRand(dice2)}\``
		});

	}
};