/**
 * Created by Peter on 01/07/2017.
 */
const ping = require('ping');
const domainRegex = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/gi;
const ipRegex = /(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
module.exports = {
    name: "Ping Address",
    usage: "ping <address>",
    commands: ["ping"],
    rateLimit: 30,
    categories: ["tools"],
    run: async function run(message, args){
        if(args.length < 2){
            message.replyLang("PING_NO_ADDRESS");
            return;
        }
        let output = ipRegex.exec(args[1]);
        if(!output)
            output = domainRegex.exec(args[1]);
        if(!output)
            return message.channel.send("Invalid address, enter a domain name or IP address.");

        output = output[0];

        const sentMessage = await message.replyLang("PING_PINGING", {address: output});

        const res = await ping.promise.probe(output, {
            timeout: 1000
        });

        if(res.alive){
            return sentMessage.editLang("PING_RESPONSE", {response: res.output});
        }else{
            return sentMessage.editLang("PING_NO_RESPONSE");
        }
    }
};