const subredditRegex = new RegExp(/^\/?(r\/)?(.*)/i);
const Discord = require('discord.js');
module.exports = {
    name: "Reddit Browser",
    usage: "reddit :subreddit",
    categories: ["image", "search"],
    commands: ["reddit"],
    run: async function run(context, bot) {
        let exec = subredditRegex.exec(context.options.subreddit);
        const subreddit = exec[2];
        const result = await bot.util.getJson(`https://reddit.com/r/${subreddit}.json`)

        if(result.error){
            let output;
            switch(result.reason){
                case "quarantined":
                    output = `This subreddit is quarantined:\n>${result.quarantine_message}`
                    break;
                case "banned":
                    output = `This subreddit is banned.`;
                    break;
                case "private":
                    output = `This subreddit is private.`;
                    break;
                default:
                    output = `Unable to access subreddit. Reddit said: ${result.reason || result.message}`;
            }
            return context.send(output)
        }

        if(result.data && result.data.children){
            const posts = !context.guild || context.channel.nsfw ? result.data.children : result.data.children.filter((post)=>!post.data.over_18 && !post.data.quarantine);
            if(posts.length === 0)
                return context.send(!context.channel.nsfw ? "No Posts Found. If you're looking for NSFW results, use a NSFW channel." : "No Posts Found.");
            return bot.util.standardPagination(context.channel, posts, async function (post, index) {
                const postData = post.data;
                let embed = new Discord.MessageEmbed();
                embed.setColor("#FF5700")
                embed.setTitle( postData.spoiler ? `||${postData.title.substring(0,256)}||` : postData.title.substring(0,256));
                embed.setAuthor(postData.author, "https://www.shareicon.net/data/64x64/2016/11/03/849484_reddit_512x512.png", `https://reddit.com/u/${postData.author}`);
                embed.setURL(`https://reddit.com${postData.permalink}`);
                embed.setFooter(`${postData.ups} points on r/${postData.subreddit} • Page ${index+1}/${posts.length}`);
                embed.setTimestamp(new Date(postData.created_utc*1000));
                if(postData.selftext)
                    embed.setDescription(postData.spoiler ?  `||${postData.selftext.substring(0, 1024)}||`: postData.selftext.substring(0, 1024));

                if(postData.spoiler) {
                    embed.addField("Spoiler", "Post marked as a spoiler, so images are disabled.");
                }else if(postData.preview && postData.preview.images && postData.preview.images[0] && postData.preview.images[0].source) {
                    //Why do you do this, reddit?
                    embed.setImage(postData.preview.images[0].source.url.replace(/&amp;/g, "&"));
                }else if(postData.url.indexOf("i.imgur") > -1 || postData.url.indexOf("i.redd.it") > -1) {
                    embed.setImage(post.url);
                }else if(postData.thumbnail && postData.thumbnail.startsWith("http")) {
                    embed.setThumbnail(postData.thumbnail);
                }

                let notes = [];
                if(postData.archived)
                    notes.push("Archived");
                if(postData.distinguished)
                    notes.push("Admin/Mod Post");
                if(postData.locked)
                    notes.push("Locked");
                if(postData.stickied)
                    notes.push("Stickied");
                if(postData.contest_mode)
                    notes.push("Contest");
                if(postData.quarantine)
                    notes.push("Quarantined");
                if(postData.over_18)
                    notes.push("NSFW");
                if(notes.length > 0)
                    embed.description = `${embed.description || ""}\n${notes.join(", ")}`

                return {embeds: [embed]};
            }, true);
        }else{
            console.log(result);
        }

    }
};