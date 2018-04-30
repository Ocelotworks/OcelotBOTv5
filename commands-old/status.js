/**
 * Created by Peter on 02/07/2017.
 */
const ping = require('ping');
const async = require('async');
const hosts = require('config').get("Commands.status.hosts");
const pm2 = require('pm2');
module.exports = {
    name: "Service Status",
    usage: "status",
    accessLevel: 0,
    commands: ["status"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        var output = "**Service Status:**\n--Servers:--\n";

        async.eachSeries(hosts, function(host, cb){
            ping.sys.probe(host.host, function(isAlive){
                output += `${isAlive ? ":white_check_mark:" : ":no_entry:"} **${host.name}**\n`;
                cb()
            });
        }, function(){
            output += "--Services--\n";
            pm2.connect(function(){
                pm2.list(function(err, processes){
                    if(err){
						bot.raven.captureException(err);
                    }else{
						async.eachSeries(processes, function(process, cb){
							output += `${process.pm2_env.status === 'online' ? ":white_check_mark:" : ":no_entry:"} **${process.name}** Uptime: ${bot.util.prettySeconds((new Date().getTime() - process.pm2_env.pm_uptime) / 1000)}\n`;

							cb();
						}, function(){
							recv.sendMessage({
								to: channel,
								message: output
							});
							pm2.disconnect();
						});
					}
                });

            });
        });

    }
};