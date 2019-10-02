const consonantPoints = {
  b: 20,
  c: 13,
  d: 20,
  f: 35,
  g: 12,
  h: 2,
  j: 4,
  k: 19,
  l: 25,
  m: 23,
  n: 33,
  p: 45,
  q: -10,
  r: 5,
  s: 6,
  t: 6,
  v: 3,
  w: 1,
  x: -5,
  y: 0,
  z: -5
};
module.exports = {
    name: "Ship Generator",
    usage: "ship <@user1> <@user2> ...",
    rateLimit: 10,
    categories: ["fun", "memes"],
    requiredPermissions: [],
    commands: ["ship", "shipname", "relationship", "shipgenerator"],
    run: async function run(message, args, bot) {
        if(args.length < 3){
            message.channel.send(`Usage: ${args[0]} @user1 @user2`);
        }else{
            let split = message.cleanContent.split(" ");
            let person1, person2, shipName, shipPoints = 0;
            let robotLove = false;
            if(message.mentions.members && message.mentions.members.size > 0){
                person1 = message.mentions.members.first().displayName;
                if(message.mentions.members.size > 1){
                    person2 = message.mentions.members.last().displayName;
                    if(message.mentions.members.first().user.bot && message.mentions.members.last().user.bot)
                        robotLove = true;
                }else{
                    person2 = split[2];
                }
            }else{
                person1 = split[1];
                person2 = split[2];
            }

            if(person1.length > 100 || person2.length > 100){
                message.channel.send(":bangbang: These names are too long...");
                return;
            }

            if(person1 === person2){
                message.channel.send(":bangbang: Shipping someone to themselves is a sin.");
                return;
            }

            bot.logger.log(`Got ${person1} & ${person2}`);
            if(person1.indexOf(" ") > -1 && person2.indexOf(" ") > -1){
                bot.logger.log("Both names have spaces in");
                shipPoints += 25;
                const firstLetter = person1[0];
                // if(bot.util.vowels.indexOf(firstLetter.toLowerCase()) === -1){
                //     bot.logger.log("First letter is not a vowel");
                //     shipPoints += consonantPoints[firstLetter.toLowerCase()] || -1;
                //     shipName = firstLetter.toUpperCase()+(person2.toLowerCase().substring(1));
                // }else{
                    shipName = person1.split(" ")[0]+" "+person2.split(" ")[1];
                    shipPoints += 15;
                //}
            }else{
                let possibleCombos = [];
                for(let f = 1; f < person1.length; f++){
                    const firstChar = person1[f];
                    if(firstChar === " ")continue;
                    for(let s = 0; s < person2.length-1; s++){
                        const secondChar = person2[s];
                        if(secondChar === " ")continue;
                        if(firstChar.toLowerCase() === secondChar.toLowerCase() || (bot.util.vowels.indexOf(firstChar.toLowerCase()) === -1 && bot.util.vowels.indexOf(secondChar.toLowerCase()) > -1)){
                            possibleCombos.push([f,s]);
                            const combo = person1.substring(0, f)+person2.substring(s);
                            bot.logger.log(`Combo ${combo}`);
                        }
                    }
                }

                if(possibleCombos.length > 0){
                    bot.logger.log(possibleCombos.length+" possible combinations");
                    shipPoints += 3*possibleCombos.length;
                    const combo = possibleCombos[parseInt(possibleCombos.length/2)];
                    shipName = person1.substring(0, combo[0])+person2.substring(combo[1]);
                    shipPoints += (bot.util.vowels.indexOf(person1[combo[0]].toLowerCase()) > -1) ? 7 : 18;
                }else{
                    shipName = person1.substring(0, bot.util.intBetween(1,person1.length))+person2.substring(bot.util.intBetween(0,person2.length));
                    shipPoints -= 10;
                }
            }

            if(shipName){
                //shipPoints += shipName.length;
                if(robotLove)
                    shipPoints += 1000;
                let output = `**Ship Generator:**\n:heart: Compatibility Score: __${shipPoints}__\n:yellow_heart: Ship Name: \`${shipName}\``;
                if(robotLove)
                    output += `\n:robot: **Android Love Bonus** https://www.youtube.com/watch?v=UOJ12b7iNmw`;
                if(shipName === person1 || shipName === person2)
                    output += `\n:thinking: **Wait... that's just the same name**`;
                message.channel.send(output);
            }else{
                message.channel.send(":broken_heart: I'm sorry... I couldn't ship these two people. It just wouldn't work.");
            }

        }
    }
};