const dateformat = require('dateformat');
module.exports = {
    name: "On This Day",
    usage: "onthisday",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["onthisday", "otd"],
    hidden: true,
    run: async function(message, args, bot){
        // noinspection EqualityComparisonWithCoercionJS
        if(!message.guild || message.guild.id != "478950156654346292")return;

        const now = new Date();

        let sentMessage = await message.channel.send("Loading...");

        (async function() {
            await sentMessage.react("⏮");
            await sentMessage.react("◀");
            await sentMessage.react("▶");
            await sentMessage.react("⏭");
        })();

        const result = await bot.database.getOnThisDayMessages(now.getDate(), now.getMonth()+1);

        const pages = result.chunk(10);
        let index = parseInt(Math.random()*(pages.length-1));

        let buildPage = async function(){
            const page = pages[index];
            let output = `Page ${index+1}/${pages.length}\n\`\`\`\n`;
            for(let i = 0; i < page.length; i++){
                let row = page[i];
                output += `[${dateformat(new Date(row.time), 'UTC:dd/mm/yy HH:MM:ss Z')}] <${row.user}> ${row.message}\n`;
            }
            output += "\n```";
            await sentMessage.edit(output);
        };

        await buildPage();

        await sentMessage.awaitReactions(async function(reaction, user){
            if (user.id === bot.client.user.id) return false;
            switch(reaction.emoji.name){
                case "⏮":
                    index = 0;
                    await buildPage();
                    break;
                case "◀":
                    if(index > 0)
                        index--;
                    else
                        index = pages.length-1;
                    await buildPage();
                    break;
                case "▶":
                    if(index < pages.length-1)
                        index++;
                    else
                        index = 0;
                    await buildPage();
                    break;
                case "⏭":
                    index = pages.length-1;
                    await buildPage();
                    break;
            }
            reaction.remove(user);

        }, {time: 60000});
        sentMessage.clearReactions();



    }
};