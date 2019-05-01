var JSZM = require('../jszm.js');
var fs = require("fs");
var gameInProgress = false;
var game;



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

            game.print = function* (text, scripting){
                console.log("print");
                buffer += text;
                if(text.endsWith("\n")) {
                    if(buffer.length > 1)
                        message.channel.send(buffer);
                    buffer = "";
                }
            };

            game.verify = function(){
                return true;
            };

            game.read = function*() {
                return yield function(callback){
                    callback(null, "ass");
                }
            };
        }

        if(args[1] && waitingRead){
            console.log("Got waiting read");
           return waitingRead(null, message.content.substring(args[0].length+1));
        }

        console.log("Run");
        gameInProgress = true;

        (function* () {
            yield* game.run();
        })().next();
    }
};