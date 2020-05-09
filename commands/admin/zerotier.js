const child_process = require('child_process');
module.exports = {
    name: "Zerotier List",
    usage: "zerotier [approve] [id] [name]",
    commands: ["zerotier", "zt"],
    run: async function(message, args, bot){
        if(!args[2] || args[2].toLowerCase() !== "approve"){
            child_process.exec("zerotier_show_users.py --network_id 8056c2e21c3d00b2 --api_key_path /home/peter/.secrets/zerotier.yaml --discord", function(err, stdout, stderr){
                if(err){
                    message.channel.send("Error: "+err);
                }else{
                    message.channel.send(`\`\`\`\n${stdout.substring(0,1992)}\n\`\`\``);
                }
            });
            return;
        }

        if(!args[3])return message.channel.send("You must enter an ID");
        if(!args[4])return message.channel.send("You must enter a name");
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