/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 07/09/2019
 * ╚════ ║   (ocelotbotv5) list
 *  ════╝
 */
const columnify = require('columnify');
module.exports = {
    name: "List Birthdays",
    usage: "list",
    commands: ["list", "view"],
    run: async function(message, args, bot){
        let allBirthdays = await bot.database.getBirthdays(message.guild.id);
        if(allBirthdays.length === 0)
            return message.replyLang("BIRTHDAY_NONE", {command: args[0]});

        const now = new Date();

        let header = "```asciidoc\n";

        allBirthdays = allBirthdays.map((birthday)=>{
            let d = birthday.birthday; //Yes
            d.setYear(now.getFullYear());
            if(d <= now)
                d.setYear(now.getFullYear()+1);

            birthday.days = Math.floor((d-now)/8.64e+7);
            return birthday;
        }).sort((a,b)=>a.days-b.days);

        let chunkedBirthdays = allBirthdays.chunk(20);
        bot.util.standardPagination(message.channel, chunkedBirthdays, async function(birthdays, index){
            let formatted = [];
            for(let i = 0; i < birthdays.length; i++){
                const birthday = birthdays[i];
                let user = await bot.util.getUserInfo(birthday.user);
                if(!user)continue;
                let d = birthday.birthday; //Yes
                let days = birthday.days;
                if(days === 365)
                    days = await bot.lang.getTranslation(message.guild.id, "BIRTHDAY_TODAY", null, message.author.id);
                else
                    days = await bot.lang.getTranslation(message.guild.id, days !== 1 ? "BIRTHDAY_DAYS" : "BIRTHDAY_DAY", {days}, message.author.id);
                formatted.push({
                    "user ::": `${user.username}#${user.discriminator} ::`,
                    birthday: await bot.lang.getTranslation(message.guild.id, "BIRTHDAY_DATE", {day: bot.util.getNumberPrefix(d.getDate()), month: bot.util.months[d.getMonth()]}, message.author.id),
                    in: days
                });
            }

            return header+columnify(formatted)+"\n```";
        });
    }
};