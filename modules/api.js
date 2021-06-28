const os = require("os");
module.exports = {
    name: "HTTP API",
    init: async function (bot) {
        function writeOpenMetric(name, value) {
            return `# TYPE ${name} gauge\n${name}{shard="${bot.util.shard}", dockerHost="${process.env.DOCKER_HOST}", hostname="${os.hostname()}"} ${value}\n`
        }

        bot.api.use((req, res, next) => {
            res.setHeader("X-Shard", bot.util.shard);
            next();
        });

        bot.api.get("/", (req, res) => {
            res.json({
                shard: bot.util.shard,
                totalShards: process.env.SHARD_COUNT,
                drain: bot.drain,
                version: process.env.VERSION,
                dockerHost: process.env.DOCKER_HOST,
            });
        });

        bot.api.get("/commands", (req, res) => {
            res.json(bot.commandObjects);
        })

        bot.api.get("/metrics", (req, res) => {
            let output = "";
            for (let key in bot.stats) {
                if (bot.stats.hasOwnProperty(key)) {
                    output += writeOpenMetric(key, bot.stats[key]);
                }
            }

            output += writeOpenMetric("wsPing", bot.client.ws.shards.first().ping);
            output += writeOpenMetric("wsStatus", bot.client.ws.shards.first().status);
            output += writeOpenMetric("guilds", bot.client.guilds.cache);
            output += writeOpenMetric("channels", bot.client.channels.cache.size);
            output += writeOpenMetric("users", bot.client.users.cache.size);
            output += writeOpenMetric("uptime", bot.client.uptime);
            output += writeOpenMetric("guildsUnavailable", bot.client.guilds.cache.filter((g) => !g.available).size);
            output += writeOpenMetric("drain", +bot.drain);
            output += writeOpenMetric("tasks", bot.tasks.running.length);

            res.header('Content-Type', 'text/plain')
            res.send(output);
        })

        bot.api.listen(process.env.PORT || 8006, function listen() {
            bot.logger.log("Listening on port 8006");
        });
    }
}


