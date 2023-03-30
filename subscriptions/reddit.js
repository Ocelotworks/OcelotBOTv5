
const Discord = require('discord.js');
const util = require('util');
const request = util.promisify(require('request'));
const Sentry = require('@sentry/node');
const {axios} = require("../util/Http");
//Reddit API
module.exports = {
    name: "Reddit",
    id: "reddit",
    alias: ["subreddit"],
    validate: function(input){
        if(!input)
            return {error: "Enter a subreddit in the format r/name e.g r/discord_irl or r/aww/new"}
        if(input.startsWith("r/"))
            return {data: input};
        return {error: ":warning: Subreddits should be in the following format: r/name e.g: **r/discord_irl** or **r/aww/new**"};
    },
    check: async function check(sub, lastCheck){
        const {data} = await axios.get(`https://json.reddit.com/${sub}`)
        let output = [];
        try{
            if(data.data){
                for(let i = 0; i < data.data.children.length; i++){
                    let post = data.data.children[i].data;
                    if(post.created_utc*1000 > lastCheck){
                        console.log("Post time", post.created_utc*1000);
                        console.log("Last check",lastCheck);
                        let embed = new Discord.MessageEmbed();
                        embed.setColor("#FF5700")
                        embed.setTitle(post.title?.substring(0,256) || `Commented on ${post.link_title.substring(0, 200)}`);
                        embed.setAuthor(post.author, "https://www.shareicon.net/data/64x64/2016/11/03/849484_reddit_512x512.png", `https://reddit.com/u/${post.author}`);
                        embed.setURL(`https://reddit.com${post.permalink}`);
                        embed.setFooter(`${post.ups} points on r/${post.subreddit}`);
                        embed.setTimestamp(new Date(post.created_utc*1000));
                        if(post.body)
                            embed.setDescription(post.body.substring(0, 1024));
                        else if(post.selftext)
                            embed.setDescription(post.selftext.substring(0,1024));
                        else
                            embed.setDescription("(No Body)")

                        if(post.preview?.images?.[0]?.source) {
                            console.log("Setting preview image");
                            //Why do you do this, reddit?
                            embed.setImage(post.preview.images[0].source.url.replace(/&amp;/g, "&"));
                        }else if(post.url?.indexOf("imgur") > -1) {
                            console.log("Setting post url");
                            embed.setImage(post.url);
                        }else if(post.thumbnail?.startsWith("http")) {
                            console.log("Setting thumbnail");
                            embed.setThumbnail(post.thumbnail);
                        }else{
                            console.log("dick all");
                        }

                        console.log(embed.title);
                        console.log("-"+embed.description);

                        output.push(embed);
                    }
                }
            }
        }catch(e){
            console.error("Error checking sub "+sub);
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
        return output;
    },
    added: function added(sub){

    }
};
