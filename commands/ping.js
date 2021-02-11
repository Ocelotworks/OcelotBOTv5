/**
 * Created by Peter on 01/07/2017.
 */
const ping = require('ping');
const domainRegex = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/i;
const ipRegex = /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i;
module.exports = {
    name: "Ping Address",
    usage: "ping <address>",
    commands: ["ping"],
    rateLimit: 30,
    categories: ["tools"],
    run: async function run(message, args, bot){
        if(args.length < 2){
            message.replyLang("PING_NO_ADDRESS");
            return;
        }

        if(!ipRegex.test(args[1]) && !domainRegex.test(args[1])){
            return message.channel.send("Invalid address, enter a domain name or IP address.");
        }

        const sentMessage = await message.replyLang("PING_PINGING", {address: args[1]});

        const res = await ping.promise.probe(args[1], {
            timeout: 1000
        });

        if(sentMessage.deleted)
            return bot.logger.log("Message was deleted before the ping completed.");

        if(res.alive){
            return sentMessage.editLang("PING_RESPONSE", {response: res.output});
        }else{
            return sentMessage.editLang("PING_NO_RESPONSE");
        }
    }
};