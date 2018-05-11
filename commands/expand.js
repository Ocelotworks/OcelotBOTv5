/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Expand",
    usage: "expand <word>",
    commands: ["expand"],
    categories: ["fun"],
    run: function run(message, args) {
        if(args.length < 2){
            message.replyLang("EXPAND_NO_TEXT");
            return;
        }

        message.channel.send([...(message.content.substring(args[0].length+1))].join(" "));
    }
};