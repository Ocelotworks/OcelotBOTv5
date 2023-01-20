module.exports = {
    name: "Wait for Drain",
    usage: "waitfordrain",
    commands: ["waitfordrain", "drain"],
    slashHidden: true,
    run: function (context, bot) {
        let content = "```ansi\n";
        content += `Docker Host:\t${process.env.DOCKER_HOST.red}\n`;
        content += `Current Ver:\t${bot.version.red}\n`;
        content += `Drain:\t${bot.version.red}\n`;
        content += `Waiting for drain event...\n`.grey;
        content += `\n\`\`\``;
        context.send({
            content
        });
        bot.bus.on("spawned", (m)=>{
            context.send({
                content: `:warning: Shard spawned: ${m.version} ${m.meta.appId} ${m.id}`
            });
        })
    }
};