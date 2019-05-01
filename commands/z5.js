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
            game = new JSZM(fs.readFile("../zdungeon.z5",{}));
            game.print = function*(text, scripting){
                message.channel.send(text);
            };

            game.read = function*(maxlen){
                return yield args[1];
            };
        }
        gameInProgress = true;
        game.run();
    }
};