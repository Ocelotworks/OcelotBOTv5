"use strict";

const G=require("genasync"); // A package I wrote
const JSZM=require("./jszm.js"); // version 2
const readline=require("readline");
const fs=require("fs");

const In=readline.createInterface({input: process.stdin});
const Out=process.stdout;

G.defineER(fs,"readFile","readFileG",2);
G.defineER(fs,"writeFile","writeFileG",3);
G.defineR(In,"question","questionG",1);

G.run((function*() {
    var story=yield fs.readFileG(process.argv[2],{});
    var game=new JSZM(story);
    game.print=function*(x) {
        Out.write(x,"ascii");
    };
    game.read=function*() {
        return yield function(callback){
            callback(null, "ass");
        }
    };
    yield*game.run();
    process.exit(0);
})());