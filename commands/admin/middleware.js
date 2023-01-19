module.exports = {
    name: "View Middleware",
    usage: "middleware [action?:view,disable,enable] :0id? :name+?",
    commands: ["middleware", "mw", "middlewares"],
    run: async function (context, bot) {
        if(context.options.action){
            let middlewareName;
            if(context.options.id){
                middlewareName = bot.command.middlewareOrder[context.options.id-1];
            }else if(context.options.name){
                middlewareName = context.options.name;
            }

            const middleware = bot.command.commandMiddleware[middlewareName];
            if(!middlewareName || !middleware){
                return context.send("Couldn't find a middleware by that name or ID.");
            }

            switch(context.options.action){
                case "view":
                    return context.send(`\`\`\`js\n${middleware.func.toString()}\n\`\`\``);
                case "enable":
                    if(middleware.priority >= 0)return context.send(`Middleware '${middlewareName}' is not disabled.`);
                    middleware.priority = middleware.oldPriority || 0;
                    return context.send(`Enabled '${middlewareName}' and set priority to ${middleware.priority}`);
                case "disable":
                    if(middleware.priority < 0)return context.send(`Middleware '${middlewareName}' is already disabled.`);
                    middleware.oldPriority = middleware.priority;
                    middleware.priority = -1;
                    return context.send(`Disabled '${middlewareName}'`);
            }
            return;
        }
        let output = "**Middlewares:**\n";
        for(let i = 0; i < bot.command.middlewareOrder.length; i++){
            const middlewareData = bot.command.commandMiddleware[bot.command.middlewareOrder[i]];
            console.log(middlewareData);
            output += `${i+1}. ${bot.command.middlewareOrder[i]} (${middlewareData.priority < 0 ? "Disabled" : middlewareData.priority})\n`
        }
        return context.send(output);
    }
};