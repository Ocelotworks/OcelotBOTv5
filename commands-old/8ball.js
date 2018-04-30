/**
 * Created by Peter on 01/07/2017.
 */
//noinspection JSValidateTypes
/**
 * @type {Array}
 */

module.exports = {
    name: "Magic 8-ball",
    usage: "8ball <question>",
    accessLevel: 0,
    commands: ["8ball"],
    run: async function run(message, args) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "8BALL_NO_QUESTION")
            });
        }else{
            recv.sendMessage({
                to: channel,
                message: `:8ball: \`${await bot.lang.getTranslation(server, "8BALL_RESPONSE_"+(parseInt(Math.random()*14)))}\``
            });
        }
    }
};