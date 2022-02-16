/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Meme Storage",
    usage: "meme",
    commands: ["meme"],
    categories: ["tools"],
    nestedDir: "meme",
    slashOptions: [{
        "name": "add",
        "description": "Add Meme",
        "options": [
            {
                "name": "name",
                "description": "name",
                "required": true,
                "type": "STRING"
            },
            {
                "name": "image",
                "description": "image",
                "required": false,
                "type": "STRING"
            }
        ],
        "type": 1
    },
        {
            "name": "delete",
            "description": "Delete Meme",
            "options": [
                {
                    "name": "name",
                    "description": "The meme to remove",
                    "required": true,
                    "autocomplete": true,
                    "type": "STRING"
                }
            ],
            "type": 1
        },
        {
            "name": "info",
            "description": "Meme Info",
            "options": [
                {
                    "name": "name",
                    "description": "The meme to get info on",
                    "required": true,
                    "autocomplete": true,
                    "type": "STRING"
                }
            ],
            "type": 1
        },
        {
            "name": "list",
            "description": "List/Search Memes",
            "options": [
                {
                    "name": "search",
                    "description": "search",
                    "required": false,
                    "type": "STRING"
                }
            ],
            "type": 1
        },
        {
            "name": "random",
            "description": "Random Meme",
            "options": [],
            "type": 1
        },{
            "name": "get",
            "description": "Get a Meme",
            "options": [
                {
                    "name": "name",
                    "description": "The meme to get",
                    "required": true,
                    "autocomplete": true,
                    "type": "STRING"
                }
            ],
            "type": 1
        },],
    autocomplete: async function(input, interaction, bot) {
        const memes = await bot.redis.cache(`meme/search/${input}`,()=>bot.database.searchMeme(input, interaction.guildId || "global"), 10000);
        return memes.map((m)=>({name: m.name, value: m.name}));
    },
    run: async function run(context, bot) {
        if(!context.options.command)
            return bot.commandObjects["nestedCommandHelp.js"].run(context, bot);
        try {
            const meme = context.options.name || context.options.command;
            const memeResult = await bot.database.getMeme(meme.toLowerCase(), context.guild?.id  || "global");
            if (memeResult[0]) {
                return context.send(memeResult[0].meme);
            }
            return context.replyLang("MEME_NOT_FOUND");
        } catch (e) {
            console.log(e);
            bot.raven.captureException(e);
            return context.replyLang("MEME_ERROR");
        }
    }
};