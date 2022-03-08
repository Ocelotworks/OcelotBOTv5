module.exports = {
    name: "View Votes",
    usage: "votes :0id",
    commands: ["votes"],
    run: async function (context, bot) {
        const id = context.options.id;
        const poll = await bot.database.getPoll(context.options.id);
        if(!poll || poll.serverID !== context.guild.id)return context.sendLang({content: "POLL_NOT_FOUND", ephemeral: true});
        if(poll.creatorID != context.user.id)return context.sendLang({content: "POLL_NOT_OWNED", ephemeral: true});

        let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
        if(!message)return;
        const embed = message.embeds[0];

        const dm = await context.user.createDM().catch(()=>null);
        if(!dm)
            return context.send({content: "You need allow DMs from OcelotBOT to receive this.", ephemeral: true});

        const now = new Date();
        const answers = await bot.database.getAllPollAnswers(id).then((a)=>a.reduce((o,a)=>{o[a.choice] ? o[a.choice].push(a) : o[a.choice] = [a];return o;},{}));


        console.log(answers);
        // let output = `Poll Answers for '${embed.title}' as of ${now.toISOString()}\nOriginal poll message here: https://discord.com/channels/${poll.serverID}/${poll.channelID}/${poll.messageID}\n`
        //
        // for(let i = 0; i < answers.length; i++){
        //     const answer = answers[i];
        //     output += `${answer.choice[1]}. ${embed.fields[answer.choice].title}:\n`;
        //     output += answer
        // }


        return context.send({content: "Poll Answers have been sent to your DM", ephemeral: true});
    }
};
