/**
 * Created by Peter on 01/07/2017.
 */
const ping = require('ping');
const domainRegex = /(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z\d][a-z\d-]{0,61}[a-z\d]/i;
const ipRegex = /((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/i;
module.exports = {
    name: "Ping Address",
    usage: "ping :address",
    commands: ["ping"],
    rateLimit: 30,
    categories: ["tools"],
    run: async function run(context, bot) {
        if (!ipRegex.test(context.options.address) && !domainRegex.test(context.options.address))
            return context.send({content:"Invalid address, enter a domain name or IP address.", ephemeral: true});

        const sentMessage = await context.sendLang("PING_PINGING", {address: context.options.address});
        const res = await ping.promise.probe(context.options.address, {
            timeout: 1000
        });

        if (sentMessage?.deleted)
            return bot.logger.log("Message was deleted before the ping completed.");

        if (res.alive)
            return context.editLang("PING_RESPONSE", {response: res.output}, sentMessage);

        return context.editLang("PING_NO_RESPONSE", {}, sentMessage);
    }
};