const columnify = require('columnify');
module.exports = {
    name: "Proxmox Nodes",
    usage: "pve",
    commands: ["proxmox", "pve"],
    noCustom: true,
    run: async function (context, bot) {
        try {
            let result = await bot.util.getJson("https://ob.bint.cc/api/pve/nodes");
            console.log(result);
            if (result.success) {
                let output = "";
                let keys = Object.keys(result.success)
                for (let i = 0; i < keys.length; i++) {
                    output += `${keys[i]}\n\`\`\`\n`;
                    output += columnify(result.success[keys[i]]);
                    output += "\n\`\`\`\n"
                }
                context.send(output)
            } else {
                context.send("Error: " + result.error);
            }
        } catch (e) {
            context.send("JSON Parse Error: " + e);
        }
    }
};