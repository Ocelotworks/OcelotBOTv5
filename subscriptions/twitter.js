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
    name: "Twitter Feed",
    id: "twitter",
    alias: ["tweet"],
    validate: async function(input){
        try {
            let result = await axios.get(`https://api.twitter.com/2/users/by/username/${encodeURIComponent(input)}`, {
                headers: {
                    authorization: `Bearer ${config.get("API.twitter.bearer")}`
                }
            });

            if (result.data && result.data.errors)
                return {error: result.data.errors[0].detail};

            return {data: result.data.data.id};
        }catch(e){
            return {error: e}
        }
    },
    check: async function check(id, lastCheck){
        let result = await axios.get(`https://api.twitter.com/2/users/${id}/tweets?start_time=${new Date(lastCheck).toISOString()}&media.fields=url&expansions=author_id&user.fields=username,name,profile_image_url&tweet.fields=created_at`,{
            headers: {
                authorization: `Bearer ${config.get("API.twitter.bearer")}`
            }
        });
        let user = result.data.includes.users[0];
        let output = [];
        for(let i = 0; i < result.data.data.length; i++){
            let tweet = result.data.data[i];
            let embed = new Discord.MessageEmbed()
            embed.setAuthor(`${user.name} (@${user.username})`, user.profile_image_url, `https://twitter.com/${user.username}`);
            embed.setDescription(tweet.text)
            embed.setTimestamp(new Date(tweet.created_at));
            embed.setURL(`https://twitter.com/${user.username}/status/${tweet.id}`);
            output.push(embed);
        }
        return output;
    },
};
