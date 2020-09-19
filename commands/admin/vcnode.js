module.exports = {
    name: "Switch VC node",
    usage: "vcnode <node>",
    commands: ["vcnode"],
    init: function init(bot){
        if(bot.client.shard){
            bot.logger.log("Loading shard receiver for !admin sayTo");
            process.on("message", async function(msg){
                if(msg.type === "switchNode"){
                    const node = bot.lavaqueue.manager.nodes[msg.message.node];
                    if(!node)return;
                    if(!node.connected)await node.connect();
                    if(!node.connected)return;
                    for (const player of bot.lavaqueue.manager.players) {
                        if(player.node.id === node.id)continue;
                        bot.logger.log(`Switching player ${player.id} to ${node.host}`);
                        await bot.lavaqueue.manager.switch(player, node);
                    }
                }
            });
        }
    },
    run:  function(message, args, bot){
        if(!args[2])return message.channel.send("You must enter a node to switch to. Refer to !admin vcs");
        if(!bot.lavaqueue.manager.nodes[args[2]])return message.channel.send("That node does not exist. Refer to !admin vcs");
        if(!bot.lavaqueue.manager.nodes[args[2]].connected)return message.channel.send("That node is not connected. Refer to !admin vcs");
        bot.client.shard.send({type: "switchNode", message: {node: args[2]}});

    }
};