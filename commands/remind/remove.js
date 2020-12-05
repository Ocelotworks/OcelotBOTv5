module.exports = {
    name: "List Reminders",
    usage: "list",
    commands: ["remove", "delete", "del"],
    run: async function(message, args, bot){
      if(!args[2] || isNaN(args[2]))
          return message.channel.send(`To remove a reminder, find it's ID from **${args[0]} list** and enter it here, e.g ${args[0]} remove 420`);


      let reminder = await bot.database.getReminderById(args[2]);
      if(!reminder[0])
          return message.channel.send(`Couldn't find a reminder by that ID. Check the ID at **${args[0]} list** and then try again.`);

      if(reminder[0].user !== message.author.id)
          return message.channel.send(`That reminder doesn't belong to you. Check the ID at **${args[0]} list** and then try again.`);

      if(reminder[0].receiver !== bot.client.user.id)
          return message.channel.send(`That reminder doesn't belong to this bot. To prevent mistakes, please use the bot that created the reminder to remove it.`);

        if(reminder[0].server !== message.guild.id)
            return message.channel.send(`That reminder doesn't belong to this server. To prevent mistakes, please use the server that created the reminder to remove it.`);

        // Trying to prevent another birthdays situation
      if(reminder.length > 1)
          return message.channel.send("Something terrible happened.");

      await bot.database.removeReminderByUser(args[2], message.author.id);
      message.channel.send("Successfully removed reminder "+args[2]);
    }
};