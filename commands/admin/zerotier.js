const columnify = require('columnify');
const axios = require('axios');
const Util = require("../../util/Util");
module.exports = {
    name: "Zerotier List",
    usage: "zerotier [approve?:approve] :idOrSearch? :name+?",
    commands: ["zerotier", "zt"],
    noCustom: true,
    run: async function (context, bot) {
        if (!context.options.approve) {
            try {
                let result = await bot.util.getJson("https://ob.bint.cc/api/zt/nodes");
                let header = Object.keys(result)[0];
                let nodes = result[header].map((node)=>({...node, Approved: node.Approved === "Y" ? "✅" : "🚫", Status: node.Status === "ONL" ? "✅" : "❌"}));
                if (context.options.idOrSearch)
                    nodes = nodes.filter((node) => node.Name.toLowerCase().indexOf(context.options.idOrSearch.toLowerCase()) > -1)

                let hosts = nodes.chunk(20);
                return Util.StandardPagination(bot, context, hosts, async function (page, index) {
                    let output;
                    output = `\`\`\`\n${header}\n----\n${columnify(page)}\n----\nPage ${index + 1}/${hosts.length}\n\`\`\``;
                    return {content: output};
                }, true, context.getSetting("meme.pageTimeout"));
            } catch (e) {
                context.send("JSON Parse Error: " + e);
            }
            return;
        }
        if (!context.options.idOrSearch || !context.options.name) return context.send({content: "!admin zerotier approve id name", ephemeral: true});
        try {
            let name = context.options.name;
            let result = await axios.post("https://ob.bint.cc/api/zt/nodes", {
                id: args[3],
                name
            });
            context.send(result.data.success || result.data.error)
        } catch (e) {
            context.send(e)
        }
    }
};