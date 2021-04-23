const columnify = require('columnify');
module.exports = {
    name: "Proxmox Nodes",
    usage: "pve",
    commands: ["proxmox", "pve"],
    noCustom: true,
    run: async function (message, args, bot) {
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
                message.channel.send(output)
            } else {
                message.channel.send("Error: " + result.error);
            }
        } catch (e) {
            message.channel.send("JSON Parse Error: " + e);
        }
    }
};