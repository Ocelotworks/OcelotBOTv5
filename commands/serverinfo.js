const SourceQuery = require('sourcequery');
const config = require('config').get("Commands.serverinfo");
const sq = new SourceQuery(1000);
const Discord = require('discord.js');
module.exports = {
    name: "Source Server Info",
    usage: "serverinfo :address+",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["serverinfo", "si"],
    categories: ["stats"],
    run: function(context, bot){
        const preset = config.get("presets")[context.options.address];
        const gameColours = config.get("gameColours");
        let ip = context.options.address;
        let port = 27015;

        if(preset){
            ip = preset[0];
            port = preset[1];
        }

        if(ip.indexOf(":") > -1){
            const split = ip.split(":");
            ip = split[0];
            port = split[1];
        }

        if(port <= 0 || port > 65535)
            return context.send({content: ":warning: Invalid port.", ephemeral: true});


        context.defer();
        sq.open(ip, port);
        sq.getInfo(function sourceQueryInfo(err, info){
            bot.logger.log("Retrieved server info for "+args[1]);
            if(err){
                context.send({content: ":warning: Error retrieving server information: "+err, ephemeral: true});
            }else{
                sq.getPlayers(async function sourceQueryPlayers(err, players){
                    let output = ".";
                    for(let i in players){
                        output += players[i].name + "\n";
                        if(i > 10){
                            output += `...and ${players.length-i} more`;
                            break;
                        }
                    }

                    let embed = new Discord.MessageEmbed();

                    if(context.getSetting("serverinfo.colour")){
                        embed.setColor(context.getSetting("serverinfo.colour"));
                    }else {
                        embed.setColor(gameColours[info.folder] || "#45a569");
                    }

                    embed.setTitle(info.name);
                    embed.addField(context.getLang("SERVERINFO_PLAYERS"), `${info.bots}+${info.players}/${info.maxplayers}`, true);
                    embed.addField(context.getLang("SERVERINFO_MAP"), info.map, true);
                    embed.addField(context.getLang("SERVERINFO_GAMEMODE"), info.game, true);
                    embed.addField(context.getLang("SERVERINFO_VERSION"), info.version, true);
                    embed.addField(context.getLang("SERVERINFO_PLAYERS"), output);
                    embed.setDescription(`steam://connect/${ip}:${port}`);

                    context.send({embeds: [embed]});

                    sq.close();
                });
            }
        });

    }
};