const Util = require("../util/Util");
const Sentry = require('@sentry/node');
const columnify = require("columnify");
let commandCount = 0;
const eggs = [
    {name: "green", id: "1089978613509652620"},
    {name: "blue", id: "1089978611156652134"},
    {name: "pink", id: "1089978603502063647"},
    {name: "violet", id: "1089978605796343958"},
    {name: "yellow", id: "1089978608958849024"},
    {name: "red", id: "1089978607499227206"}
];
module.exports = {
    name: "Easter Egg Hunt",
    usage: "easter [leaderboard?:server,global]",
    detailedHelp: "Participate in the easter-egg hunt",
    rateLimit: 10,
    categories: ["fun", "meta"],
    commands: ["easter"],
    guildOnly: true,
    init: async function(bot){
        let nextEgg = await bot.database.getNextEasterEgg();
        setInterval(async ()=>{
            // bot.logger.log("Fetching next easter egg...");
            const newEgg = await bot.database.getNextEasterEgg();
            if(newEgg && newEgg.rowid !== nextEgg?.rowid) {
                nextEgg = newEgg;
                bot.logger.log(`Next egg (${nextEgg.rowid}) unlocks at ${nextEgg.claimable_after}`);
            }
        }, 120000);
        bot.addCommandMiddleware(async (context)=>{
            try {
                commandCount++;
                const eggInterval = parseInt(context.getSetting("easter.interval"));
                const eggChance = parseInt(context.getSetting("easter.chance")) / 100;

                if (!context.getBool("easter.enabled") || !context.guild || !nextEgg || commandCount % eggInterval > 0) return true;
                const now = new Date();
                console.log(now, nextEgg.claimable_after, now - nextEgg.claimable_after);
                // Egg not claimable yet
                if (now - nextEgg.claimable_after < 0) return true;
                // Random chance to get the egg
                const chance = Math.random();
                if (chance > eggChance) return true;
                // Make sure the egg is still claimable
                const egg = await bot.database.getEgg(nextEgg.rowid)
                // Egg has already been claimed
                if (egg.messageid) return true;
                await bot.database.setEggMessageId(egg.rowid, context.id, context.guild.id)
                context.setBeforeSend(async (options) => {
                    const emoji = Util.ArrayRand(eggs);
                    const button = {type: 2, style: 1, emoji, custom_id: `G${egg.rowid}`};
                    if (!options.components) {
                        options.components = [bot.util.actionRow(button)];
                    } else if (options.components.length < 4) {
                        options.components.push(bot.util.actionRow(button));
                    }
                });
                bot.database.getNextEasterEgg().then((e) => nextEgg = e);
                return true;
            }catch(e){
                Sentry.captureException(e);
                return true;
            }
        }, "Easter Eggs");

        bot.interactions.addHandler("G", async (interaction, context)=>{
            const eggId = interaction.customId.substring(1);
            const egg = await bot.database.getEgg(eggId);

            // Disable the button with this customId - stolen from interactions.js, should be moved to a helper func
            for (let i = 0; i < interaction.message.components.length; i++) {
                for (let j = 0; j < interaction.message.components[i].components.length; j++) {
                    if (interaction.message.components[i].components[j].customId === interaction.customId) {
                        interaction.message.components[i].components[j].disabled = true;
                        break;
                    }
                }
            }
            await interaction.update({components: interaction.message.components});

            // Check if the egg was claimed already
            if(egg.claimed_at != null){
                return context.send({ephemeral: true, content: "Sorry, someone claimed that egg before you!"})
            }

            await bot.database.setEggClaimed(eggId, context.guild.id, context.user.id);
            const {name, id} = interaction.component.emoji;
            const nameUpper = name[0].toUpperCase()+name.substring(1);
            const emoji = `<:${name}:${id}>`;
            bot.modules.statistics.incrementStat(context.guild.id, context.user.id, "eggs_claimed");
            let eggCount = await bot.database.getEggCount(context.user.id);
            return context.send({content: `<@${context.user.id}> claimed the ${emoji} **${nameUpper} Egg**!\nYou have collected ${(eggCount+1).toLocaleString()} ${eggCount > 0 ? "eggs" : "egg"}!\nCollect the most eggs to win, check /easter to see the current leaderboard.`});
        });

    },
    run: async function run(context, bot) {
        await context.defer();
        const isGlobalLeaderboard = context.options.leaderboard === "global";
        const {leaderboard, totalStats} = await bot.database.getEggStats(isGlobalLeaderboard ? "all" : context.guild.id);
        let output = `🐰 Easter Egg Hunt 2024!\nFind eggs by using commands, claim the most eggs to win!\n`;
        output += `${isGlobalLeaderboard ? "Global" : "Server"} leaderboard:\n`;
        let userPosition = leaderboard.findIndex(({userid})=>userid === context.user.id);
        const lbData = await Promise.all(leaderboard.slice(0, 10).map(async ({userid, value}, i)=> {
            return bot.util.getUserTag(userid).then((tag) => ({"#": i + 1, user: tag, eggs: value}))
        }));
        if(lbData.length > 0) {
            if (userPosition === -1)
                output += `You're not on the leaderboard yet. Use some more commands to find some eggs!\n`
            else
                output += `You are #${(userPosition+1).toLocaleString()} out of ${leaderboard.length.toLocaleString()} users ${isGlobalLeaderboard ? "globally" : "in this server"}.\n`;
            output += `\`\`\`yaml\n${columnify(lbData)}\n\`\`\`\n`;
        } else
            output += "Nobody has placed on the leaderboard yet! Use some more commands to find some more eggs!\n"

        console.log(totalStats);
        if(!isGlobalLeaderboard && totalStats[context.guild.id])
            output += `<:violet:1089978605796343958> ${totalStats[context.guild.id].toLocaleString()} eggs collected **in this server**.\n`;
        output += `<:red:1089978607499227206> ${totalStats.all.toLocaleString()} eggs collected **globally**.\n`
        return context.send({content: output});
    }
}