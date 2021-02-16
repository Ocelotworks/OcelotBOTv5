const columnify = require('columnify');
const axios = require('axios');
module.exports = {
    name: "Zerotier List",
    usage: "zerotier [search]/[approve] [id] [name]",
    commands: ["zerotier", "zt"],
    run: async function(message, args, bot){
        if(!args[2] || args[2].toLowerCase() !== "approve"){
            try {
                let result = await bot.util.getJson("https://ob.bint.cc/api/zt/nodes");
                let header = Object.keys(result)[0];
                let nodes = result[header];
                if(args[2])
                    nodes = nodes.filter((node)=>node.Name.toLowerCase().indexOf(args[2].toLowerCase()) > -1)
                let hosts = nodes.chunk(20);
                bot.util.standardPagination(message.channel, hosts, async function(page, index){
                    let output;
                    output = `\`\`\`\n${header}\n----\n${columnify(page)}\n----\nPage ${index+1}/${hosts.length}\n\`\`\``;
                    return output;
                }, true, message.getSetting("meme.pageTimeout"));
            }catch(e){
                message.channel.send("JSON Parse Error: "+e);
            }
            return;
        }
        if(!args[3] || !args[4])return message.channel.send("!admin zerotier approve id name");
        try {
            let name = message.content.substring(message.content.indexOf(args[4]));
            let result = await axios.post("https://ob.bint.cc/api/zt/nodes", {
                id: args[3],
                name
            });
            message.channel.send(result.data.success || result.data.error)
        }catch(e){
            message.channel.send(e)
        }
    }
};