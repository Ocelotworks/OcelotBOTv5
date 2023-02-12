module.exports = {
    name: "Create Daily Poll",
    usage: "dailypoll :data+",
    commands: ["daily", "dailypoll", "dp"],
    noCustom: true,
    run: async function (context, bot) {
       const data = context.options.data.split(",");
       const title = data[0];
       const options = data.slice(1);
       if(title.length > 256)
           return context.send({content: "Title is too long, must be <256 characters", ephemeral: true});

       let nextDate = await bot.database.getNextEmptyPollDate();
       await bot.database.createDailyPoll(nextDate, title, options);
       return context.send({content: `Poll will run on ${nextDate.toDateString()}`})
    }
};