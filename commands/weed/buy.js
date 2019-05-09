module.exports = {
    name: "Buy",
    usage: "buy",
    commands: ["buy"],
    run: async function(message, args, bot, data){
        if(!data.plants[message.author.id]){
            data.plants[message.author.id] = [];
        }

        if(data.weedbux[message.author.id] >= 500) {
            let plant = new data.Plant(message.author.id)
            data.plants[message.author.id].push(plant);

            data.weedbux[message.author.id] = data.weedbux[message.author.id] - 500;

            plant.id = bot.database.addNewPlant(plant);

            message.channel.send("Bought new plant.");
        } else {
            message.channel.send("Insufficient funds.");
        }
    }
};