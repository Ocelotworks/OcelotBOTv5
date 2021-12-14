

const Image = require("../util/Image");
// The layout of the board
// T = Triple Word
// W = Double Word
// D = Double Letter
// L = Triple Letter
// S = Start
// - = Regular
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
// Number of columns
const cols = 15;
// Pixel size of each square
const size = 64;
// Tile types to board images
const tileTypeMap = {
    "-": "empty_alt",
    "T": "tw",
    "D": "dl",
    "W": "dw",
    "L": "tl",
    "S": "start",
}

// Used for columns on the board
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const points = {
    " ": 0,
    E: 1, A: 1, I: 1, O: 1, N: 1, R: 1, T: 1, L: 1, S: 1, U: 1,
    D: 2, G: 2,
    B: 3, C: 3, M: 3, P: 3,
    K: 5,
    J: 8, X: 8,
    Q: 10, Z: 10,
}

const bagDistribution = {
    " ": 2,
    E: 12, A: 9, I: 9, O: 8, N: 6, R: 6, T: 6, L: 4, S: 4, U: 4,
    D: 4, G: 3,
    B: 2, C: 2, M: 2, P: 2,
    F: 2, H: 2, V: 2, W: 2, Y: 2,
    K: 1,
    J: 1,
    X: 1,
    Q: 1, Z: 1
}


module.exports = {
    name: "Word Game",
    usage: "word :input?+",
    detailedHelp: "Enjoy a nice game of scra- uh I mean _Word Game_",
    usageExample: "word start",
    categories: ["games"],
    rateLimit: 2,
    nestedDir: "word",
    commands: ["word", "wordgame", "words"],
    async  run(context, bot) {
        if(context.options.input === "renderboard"){
            return module.exports.renderBoard(bot, context);
        }
    },
    makeBag(){
        return Object.keys(bagDistribution).map((letter)=>bagDistribution[letter])
    },
    startGame(context, type){
        let game = {bag: []}
    },
    renderBoard(bot, context){
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