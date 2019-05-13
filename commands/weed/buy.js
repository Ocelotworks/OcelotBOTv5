/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) test
 */

module.exports = {
    name: "Buy",
    usage: "buy",
    commands: ["buy"],
    run: async function(message, args, bot, data){
        if(!data.getPlants()[message.author.id]){
            data.getPlants()[message.author.id] = [];
        }

        if(message.getSetting("weed.bux") >= 500) {
            let plant = new data.Plant(message.author.id)
            data.getPlants()[message.author.id].push(plant);

            plant.id = await bot.database.addNewPlant(plant);

            message.channel.send("Bought new plant.");
            data.removeBux(bot, message, 500);
        } else {
            message.channel.send("Insufficient funds.");
        }
    }
};