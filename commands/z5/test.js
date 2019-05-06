
module.exports = {
    name: "Test",
    usage: "Test",
    commands: ["test"],
    run: async function(message, args, bot){
        message.channel.send("Test yourself");
    }
};