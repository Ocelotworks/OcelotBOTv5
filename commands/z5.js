let JSZM = require('../jszm.js');
let fs = require("fs");
let gameInProgress = false;
let game;
let gameIterator;



let curriedR = function(originalFunction, argumentIndex) {
    if(argumentIndex === undefined || argumentIndex === null)
        argumentIndex = originalFunction.length-1;

    return function() {
        arguments.length = originalFunction.length;
        return function(callback){
            arguments[argumentIndex] = function(result){
                return callback(null, result);
            }
            return originalFunction.apply(this,arguments);
        };
    };

};

let waitingRead;

let gameRead =function*() {
    return yield function(callback){
        callback(null, "ass");
    }
};

module.exports = {
    name: "Z5 Interpreter",
    usage: "z7",
    commands: ["z5"],
    categories: ["fun"],
    run: async function(message, args, bot){

        if(!gameInProgress){
            let file = fs.readFileSync("./MINIZORK.Z3",{});
            game = new JSZM(file);
            console.log("Created new game");

            let buffer = "";

            game.print = function* (text){
                console.log("print");
                buffer += text;
                if(text.endsWith("\n")) {
                    if(buffer.length > 1)
                        message.channel.send(buffer);
                    buffer = "";
                }
            };

            game.read = function*() {
                return yield function(){return "go north";};
            };

            game.save = function*(data){
                try{
                    yield fs.writeFileSync("./z5saves/" + "", new Buffer(data.buffer), {});
                    //TODO: Fix this, generate unique file name and send save name to channel
                    return true;
                } catch(e) {
                    return false;
                }
            };

            gameIterator = game.run();
            console.log("Run");
            gameInProgress = true;
        }

        if(args[1] && waitingRead){
            console.log("Got waiting read");
           return waitingRead(null, message.content.substring(args[0].length+1));
        }

        gameIterator.next();
    }
};