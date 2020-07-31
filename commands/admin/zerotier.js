const child_process = require('child_process');
const columnify = require('columnify');
module.exports = {
    name: "Zerotier List",
    usage: "zerotier [approve] [id] [name]",
    commands: ["zerotier", "zt"],
    run: async function(message, args, bot){
        if(!args[2] || args[2].toLowerCase() !== "approve"){
            child_process.exec("zerotier_show_users.py --network_id 8056c2e21c3d00b2 --api_key_path /home/peter/.secrets/zerotier.yaml --discord --json", function(err, stdout, stderr){
                if(err)
                    return message.channel.send("Error: "+err);
                const jsonStart = stdout.indexOf("\n");
                let header = stdout.substring(0,jsonStart);
                let jsonData = stdout.substring(jsonStart);
                try {
                    let hosts = JSON.parse(jsonData).chunk(20);
                    bot.util.standardPagination(message.channel, hosts, async function(page, index){
                       let output;
                        output = `\`\`\`\n${header}\n----\n${columnify(page)}\n----\nPage ${index+1}/${hosts.length}\n\`\`\``;
                        return output;
                    }, true, message.getSetting("meme.pageTimeout"));
                }catch(e){
                    message.channel.send("JSON Parse Error: "+e);
                    console.log(stdout);
                }
            });
            return;
        }

        if(!args[3] || !args[4])return message.channel.send("!admin zerotier approve id name");
        let name = message.content.substring(message.content.indexOf(args[4]));
        child_process.exec(`zerotier_approve_node.py --network_id 8056c2e21c3d00b2 --api_key_path /home/peter/.secrets/zerotier.yaml --node_id ${args[3]} --node_name ${name}`, function(err, stdout, stderr){
            if(err){
                message.channel.send("Error: "+err);
            }else{
                message.channel.send(`\`\`\`\n${stdout.substring(0,1992)}\n\`\`\``);
            }
        });
    }
};