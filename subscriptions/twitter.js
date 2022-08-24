/**
 *   ╔════   Copyright 2021 Peter Maguire
 *  ║ ════╗  Created 06/01/2021
 * ╚════ ║   (ocelotbotv5) twitter
 *  ════╝
 */
let axios = require('axios');
let config = require('config');
let Discord = require('discord.js');
const Sentry = require('@sentry/node');
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
        let {data} = await axios.get(`https://api.twitter.com/2/users/${id}/tweets?start_time=${new Date(lastCheck).toISOString()}&media.fields=preview_image_url,url&expansions=author_id,attachments.media_keys&user.fields=username,name,profile_image_url&tweet.fields=created_at,attachments&exclude=retweets`,{
            headers: {
                authorization: `Bearer ${config.get("API.twitter.bearer")}`
            }
        });
        let user = data?.includes?.users?.[0];
        if(!user) {
            return []
        }

        const mediaKeys = data.includes?.media?.reduce((acc, key)=>{
            acc[key.media_key] = key.url;
            return acc;
        }, {}) || {};

        let output = [];
        for(let i = 0; i < data.data.length; i++){
            let tweet = data.data[i];
            let embed = new Discord.MessageEmbed()
            embed.setAuthor(`${user.name} (@${user.username})`, user.profile_image_url, `https://twitter.com/${user.username}`);
            embed.setDescription(tweet.text)
            embed.setColor(0x1d9bf0);
            embed.setTimestamp(new Date(tweet.created_at));
            embed.setURL(`https://twitter.com/${user.username}/status/${tweet.id}`);
            const media = tweet.attachments?.media_keys;
            if(media?.length > 0){
                embed.setImage(mediaKeys[media[0]]);
                if(media.length > 1)
                    embed.setFooter(`+${media.length-1} more images`);
            }
            output.push(embed);
        }
        return output;
    },
};
