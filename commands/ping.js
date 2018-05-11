/**
 * Created by Peter on 01/07/2017.
 */
const ping = require('ping');
module.exports = {
    name: "Ping Address",
    usage: "ping <address> [timeout]",
    commands: ["ping"],
    categories: ["tools"],
    run: async function run(message, args){
        if(args.length < 2){
            message.replyLang("PING_NO_ADDRESS");
            return;
        }

        const sentMessage = await message.replyLang("PING_PINGING", args[1]);

        const res = await ping.promise.probe(args[1].replace(/[<>|]/g, ""), {
            timeout: args[2] ? args[2] : 1000
        });

        if(res.alive){
            sentMessage.editLang("PING_RESPONSE", res.output);
        }else{
            sentMessage.editLang("PING_NO_RESPONSE");
        }
    }
};