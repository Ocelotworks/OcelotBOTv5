
const shipLevels = {
    10: ["💔", "No Spark..."],
    20: ["🫀", "Just Friends...."],
    35: ["😏", "More than friends?"],
    50: ["🥰", "Could it be love?"],
    80: ["🌟", "Sparks Flying"],
    100: ["❤️", "Compatible!"],
    105: ["💖", "It's Love!"],
    150: ["💞", "Super Compatible!"],
    200: ["💝", "Ultra Compatible!"],
    300: ["💗", "Made for each other!"],
    500: ["😻", "Married at first sight!"],
    1000: ["🤯", "MERCILESS LOVE"],
    2000: ["🔥", "RUTHLESS LOVE"],
    3000: ["🔥", "RELENTLESS LOVE"],
    4000: ["🔥", "BRUTAL LOVE"],
    5000: ["🔥", "NUCLEAR LOVE"],
    6000: ["🔥", "UNSTOPPABLE LOVE"],
    7000: ["🔥", "GODLIKE LOVE"],
}

module.exports = {
    name: "Ship Generator",
    usage: "ship <@user1> <@user2> ...",
    rateLimit: 10,
    detailedHelp: "Ship two or more users together to test their compatibility.",
    usageExample: "ship @OcelotBOT @Big P",
    categories: ["fun"],
    requiredPermissions: [],
    commands: ["ship", "shipname", "relationship", "shipgenerator"],
    run: async function run(message, args, bot) {
        if(args.length < 3){
            message.channel.send(`Usage: ${args[0]} @user1 @user2`);
        }else{
            let split = message.content.split(" ");
            let people = message.mentions.members.map((m)=>m.displayName);
            for(let i = 1; i < split.length; i++){
                if(!split[i].startsWith("<")){
                    people.push(split[i]);
                }
            }

            let shipPoints = 0, shipName = people[0];
            for(let i = 1; i < people.length; i++){
                let result = ship(shipName, people[i], bot);
                shipPoints += result.shipPoints;
                shipName = result.shipName;
            }

            let shipTags = ["<a:pogshake:789340616785526825>", "IMPOSSIBLE LOVE!"];
            for(let level in shipLevels){
                if(shipLevels.hasOwnProperty(level) && shipPoints < level) {
                    shipTags = shipLevels[level];
                    break;
                }
            }

            if(shipName){
                let output = `**Ship Generator:**\n${shipTags[0]} Compatibility Score: **${Math.round(shipPoints).toLocaleString()}: **_${shipTags[1]}_\n:yellow_heart: Ship Name: \`${shipName}\``;
                if(people.includes(shipName))
                    output += `\n:thinking: **Wait... that's just the same name**`;
                message.channel.send(output);
            }else{
                message.channel.send(":broken_heart: I'm sorry... I couldn't ship these people. It just wouldn't work.");
            }

        }
    }
};

function ship(person1, person2, bot){
    let shipName = "", shipPoints = 0;
    if(person1.indexOf(" ") > -1 && person2.indexOf(" ") > -1) {
        bot.logger.log("Both names have spaces in");
        shipPoints += 25;
        shipName = person1.split(" ")[0]+" "+person2.split(" ")[1];
        return {shipName, shipPoints}
    }
    let possibleCombos = [];
    for(let f = 1; f < person1.length; f++){
        const firstChar = person1[f];
        if(firstChar === " ")continue;
        for(let s = 0; s < person2.length-1; s++){
            const secondChar = person2[s];
            if(secondChar === " ")continue;
            if(firstChar.toLowerCase() === secondChar.toLowerCase() || (bot.util.vowels.indexOf(firstChar.toLowerCase()) === -1 && bot.util.vowels.indexOf(secondChar.toLowerCase()) > -1)){
                possibleCombos.push([f,s]);
                shipPoints += 1;
            }
        }
    }

    let seenLetters = [];

    for(let i = 0; i < person2.length; i++) {
        let character = person2[i];
        if (seenLetters.includes(character)){
            shipPoints--;
        } else {
            seenLetters.push(character);
            shipPoints++;
        }
    }

    if(seenLetters.length < 5)
        shipPoints /= 2;

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

    return {shipName, shipPoints}
}