module.exports = {
    name: "Buy",
    usage: "buy",
    commands: ["buy"],
    run: async function(message, args, bot, data){
        if(!data.plants[message.author.id]){
            data.plants[message.author.id] = [];
        }

        if(data.weedbux[message.author.id] >= 500) {
            data.plants[message.author.id].push(new data.Plant(message.author.id));
            data.weedbux[message.author.id] = data.weedbux[message.author.id] - 500;

            message.channel.send("Bought new plant.");
        } else {
            message.channel.send("Insufficient funds.");
        }
    }
};