const Util = require("../../util/Util");
module.exports = {
    name: "View Playlists",
    usage: "playlists",
    commands: ["playlists", "pl", "list", "playlist"],
    run: async function (context, bot) {
        const playlists = await bot.database.getGuessPlaylists(context.guild.id);
        const chunkedPlaylists = playlists.chunk(12);
        let spaceLength = 0;
        for(let i = 0; i < playlists.length; i++){
            if(playlists[i].id.length > spaceLength)spaceLength = playlists[i].id.length+1;
        }
        const header = `Select a playlist using **${context.getSetting("prefix")}${context.command} play** followed by a spotify playlist URL, or one of the following:\n\`\`\`\n`
        return Util.StandardPagination(bot, context, chunkedPlaylists, async function (page, index) {
            let output = "";
            output += header;
            for (let i = 0; i < page.length; i++) {
                const name = page[i].id;
                output += `${name}${((i+1)/4) % 1 ? " ".repeat(spaceLength-name.length) : "\n"}`;
            }
            output += "\n```";
            return {content: output};
        });
    }
}