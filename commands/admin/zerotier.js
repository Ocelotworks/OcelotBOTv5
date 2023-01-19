const columnify = require('columnify');
const axios = require('axios');
const Util = require("../../util/Util");
module.exports = {
    name: "Zerotier List",
    usage: "zerotier [approve?:approve] :idorsearch? :name+?",
    commands: ["zerotier", "zt"],
    noCustom: true,
    run: async function (context, bot) {
        if (!context.options.approve) {
            try {
                let result = await bot.util.getJson("https://ob-prod-api.d.int.unacc.eu/api/zt/nodes");
                let header = Object.keys(result)[0];
                let nodes = result[header].map((node)=>({...node, Approved: node.Approved === "Y" ? "✅" : "🚫", Status: node.Status === "ONL" ? "✅" : "❌"}));
                if (context.options.idorsearch)
                    nodes = nodes.filter((node) => node.Name.toLowerCase().indexOf(context.options.idorsearch.toLowerCase()) > -1)

                let hosts = nodes.chunk(20);
                return Util.StandardPagination(bot, context, hosts, async function (page, index) {
                    let output;
                    output = `\`\`\`\n${header}\n----\n${columnify(page)}\n----\nPage ${index + 1}/${hosts.length}\n\`\`\``;
                    return {content: output};
                }, true);
            } catch (e) {
                context.send("JSON Parse Error: " + e);
            }
            return;
        }
        if (!context.options.idorsearch || !context.options.name)
            return context.send({content: `**Usage:**\n${context.getSetting("prefix")}admin ${context.options.command} approve \`id\` \`name\``, ephemeral: true});
        try {
            let name = context.options.name;
            let result = await axios.post("https://ob-prod-api.d.int.unacc.eu/api/zt/nodes", {
                id: context.options.idorsearch,
                name
            });
            context.send(result.data.success || result.data.error)
        } catch (e) {
            context.send(e)
        }
    }
};