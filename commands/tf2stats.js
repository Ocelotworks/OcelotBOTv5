const {axios} = require('../util/Http');
const Embeds = require("../util/Embeds");
module.exports = {
    name: "TF2 Server Info",
    usage: "tf2 :address",
    rateLimit: 10,
    detailedHelp: "Get information about a TF2 server by providing it's IP address (and port)",
    usageExample: "tf2 85.117.240.3:27030",
    categories: ["stats"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["tf2", "tf2server"],
    run: async function(context, bot){
        await context.defer();
        const {data} = await axios.get(`https://ob.bint.cc/api/gameserver?type=source&address=${encodeURIComponent(context.options.address)}`, {validateStatus: ()=>true})
        if(!data?.success){
            return context.send({content: (data?.error || "Couldn't connect to the server you specified.")+"\nCheck the address or try again later.", ephemeral: true});
        }
        console.log(data);
        const embed = new Embeds.LangEmbed(context);
        embed.setColor("#cf6a32");
        embed.setAuthor(`${data.success.game}`, "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/7ad21446-0af2-4334-ac21-c5a0b6308d04/d78kp9s-07d61235-7c6a-4faf-a76f-1b0b1bf8dfc4.png");
        embed.setTitle(data.success.name);
        embed.setDescription(data.success.gamemode);
        if(data.success.map)
            embed.addField("Map", data.success.map, true);
        if(data.success.maxplayers)
            embed.addField("Max Players", ""+data.success.maxplayers, true);
        let playerList = `\`\`\`${data.success.playerlist.slice(0, 20).join("\n")}`;
        if(data.success.playerlist.length > 20)
            playerList += `\nAnd ${data.success.playerlist.length-20} more...`;
        playerList += "\n```";
        embed.addField("Players", playerList);
        return context.send({embeds: [embed]});
    }
};