const fs = require('fs');
import test from 'ava';


let files = fs.readdirSync("commands");
for (let i in files) {
    if(files.hasOwnProperty(i)){
        if(!fs.lstatSync('./commands/'+files[i]).isDirectory()){
            try {
                var newCommand = require('./commands/' + files[i]);
                if (newCommand.test)
                    newCommand.test(test);
                else
                    console.warn("Skipping " + newCommand.name + " as it doesn't have any tests defined.");
            }catch(e){
                console.error("Error loading "+files[i]);
            }
        }
    }
}


const util = require('./modules/util.js');
let bot = {};
util.init(bot);

test('util vowels', function(t){
    t.deepEqual(bot.util.vowels, ["a", "e", "i", "o", "u","ａ","ｅ","ｉ","ｏ","ｕ","Ａ","Ｅ","Ｉ","Ｏ","Ｕ"]);
});

test('util int between', function(t){
    const randInt = bot.util.intBetween(0, 10);
    if(randInt >= 0 && randInt <= 10 && randInt === parseInt(randInt)){
        t.pass();
    }
});

test('util array rand', function(t){
    const array = ["a", "b", "c"];
    const rand = bot.util.arrayRand(["a"]);
    if(array.indexOf(rand) > -1){
        t.pass();
    }
});