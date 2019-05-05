let JSZM = require('../jszm.js');
let fs = require("fs");
let gameInProgress = false;
let game;
let gameIterator;


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
            let didPrintHeader = false;
            game.print = function* (text){
                if(text.length === 1 && text === ">") {
                    let channelMessage = "";
                    // split by \n\n to pull out game header, only first time
                    if(!didPrintHeader) {
                        let headerLines = buffer.split("\n\n");
                        channelMessage += "```css\n" + headerLines[0] + "\n```";
                        buffer = headerLines.slice(1).join("\n\n");
                        didPrintHeader = true;
                    }

                    // split location and description, then colorize
                    let lines = buffer.split("\n");
                    let location = lines[0];
                    let description = lines.slice(1).join("\n");
                    channelMessage += "```fix\n" + location + "\n```";
                    channelMessage += "```yaml\n" + description + "\n```";
                    message.channel.send(channelMessage);
                    buffer = "";
                } else {
                    buffer += text;
                }
            };

            game.read = function*() {
                return yield "";
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

        gameIterator.next(args.slice(1).join(" "));
    }
};
