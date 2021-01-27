/**
 *   ╔════   Copyright 2021 Peter Maguire
 *  ║ ════╗  Created 06/01/2021
 * ╚════ ║   (ocelotbotv5) twitter
 *  ════╝
 */
let axios = require('axios');
let config = require('config');
let Discord = require('discord.js')
module.exports = {
    name: "Botlists",
    id: "botlists",
    alias: ["botlists"],
    hidden: true,
    validate: async function(data){
        return {data};
    },
    check: async function check(id, lastCheck){
        let result = await axios.get(`https://botblock.org/api/lists`);
        let lists = Object.keys(result);
        let output = [];
        for(let i = 0; i < lists.length; i++){
            let list = lists[i];
            if(lastCheck < list.added*1000) {
                let embed = new Discord.MessageEmbed()
                embed.setTitle("New Bot List");
                embed.setDescription(`${list.name} - ${list.url}`);
                output.push(embed);
            }
        }
        return output;
    },
};
