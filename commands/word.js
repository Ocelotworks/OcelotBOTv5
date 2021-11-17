// T = Triple Word
// W = Double Word
// D = Double Letter
// L = Triple Letter
// S = Start
// - = Regular

const Image = require("../util/Image");
const board =
    "T--D---T---D--T" +
    "-W---L---L---W-" +
    "--W---D-D---W--" +
    "D--W---D---W--D" +
    "----W-----W----" +
    "-L---L---L---L-" +
    "--D---D-D---D--" +
    "T--D---S---D--T" +
    "--D---D-D---D--" +
    "-L---L---L---L-" +
    "----W-----W----" +
    "D--W---D---W--D" +
    "--W---D-D---W--" +
    "-W---L---L---W-" +
    "T--W---T---W--T"

const cols = 15;
const size = 64;
const tileTypeMap = {
    "-": "empty_alt",
    "T": "tw",
    "D": "dl",
    "W": "dw",
    "L": "tl",
    "S": "start",
}
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
module.exports = {
    name: "Word Game",
    usage: "word :input?+",
    detailedHelp: "Enjoy a nice game of scra- uh I mean _Word Game_",
    usageExample: "word start",
    categories: ["games"],
    rateLimit: 2,
    commands: ["word", "wordgame", "words"],
    run: async function run(context, bot) {
        if(context.options.input === "renderboard"){
            return module.exports.renderBoard(bot, context);
        }
    },
    renderBoard: function(bot, context){
        let components = [{
            pos: {w: size*(cols+1), h: size*(cols+1)},
            background: "#C8C0AB",
        }];
        for(let i = 0; i < board.length; i++){
            const tile = board[i];
            const x = (i % cols) * size;
            const y = (Math.floor(i / cols)) * size
            if(tile !== "-") {
                components.push({
                    url: `word/tiles_${tileTypeMap[tile]}.png`,
                    local: true,
                    pos: {
                        x: size+x,
                        y: size+y,
                    }
                })
            }
            components.push({
                url: `word/tiles_empty_alt.png`,
                local: true,
                pos: {
                    x: size+x,
                    y: size+y,
                }
            })
            if(x == 0){
                components.push({
                    pos: {x, y: y+size, w: size, h: size},
                    filter: [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 32,
                            colour: "#000000",
                            content: letters[Math.floor(i/cols)],
                            x: size/2,
                            y: size/2,
                            ax: 0.5,
                            ay: 0.5,
                            w: size,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                })
            }
            if(y == 0){
                components.push({
                    pos: {x: x+size, y, w: size, h: size},
                    filter: [{
                        name: "text",
                        args: {
                            font: "arial.ttf",
                            fontSize: 32,
                            colour: "#000000",
                            content: `${i+1}`,
                            x: size/2,
                            y: size/2,
                            ax: 0.5,
                            ay: 0.5,
                            w: size,
                            spacing: 1.1,
                            align: 1,
                        }
                    }]
                })
            }
        }

        return Image.ImageProcessor(bot, context, {
            components,
            width: size*(cols+1),
            height: size*(cols+1)
        }, "board");
    }
};