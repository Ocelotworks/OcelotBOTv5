module.exports = {
    name: "Switch VC node",
    usage: "vcnode :node",
    commands: ["vcnode"],
    noCustom: true,
    init: function init(bot) {
        bot.bus.on("switchNode", async (msg) => {
            const node = bot.lavaqueue.manager.nodes.get(msg.message.node);
            if (!node) return;
            if (!node.connected) await node.connect();
            if (!node.connected) return;
            // noinspection ES6MissingAwait
            bot.lavaqueue.manager.players.forEach(async (player) => {
                if (player.node.id === node.id) return;
                bot.logger.log(`Switching player ${player.id} to ${node.host}`);
                await bot.lavaqueue.manager.switch(player, node);
            })
        })
    },
    run: function (context, bot) {
        if (!bot.lavaqueue.manager.nodes.has(context.options.node)) return context.send(`Node ${args[2]} does not exist. Refer to !admin vcs`);
        if (!bot.lavaqueue.manager.nodes.get(context.options.node).connected) return context.send("That node is not connected. Refer to !admin vcs");
        bot.rabbit.event({type: "switchNode", message: {node: context.options.node}});

    }
};