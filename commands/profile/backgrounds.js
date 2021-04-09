/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 21/03/2019
 * ╚════ ║   (ocelotbotv5) backgrounds
 *  ════╝
 */
module.exports = {
    name: "View Backgrounds",
    usage: "backgrounds",
    commands: ["backgrounds", "background"],
    run: async function (message, args, bot) {
        const result = await bot.database.getProfileOptions("background");
        const cols = 4;
        const width = 1024;
        const height = 700;
        const columnWidth = width/cols;
        const rowHeight = (columnWidth/width)*height;
        const components = [];
        for (let i = 0; i < result.length; i++) {
            const background = result[i];
            components.push({
                url: `profile/new/backgrounds/${background.path}`,
                local: true,
                pos: {
                    x: (i % cols) * columnWidth,
                    y: Math.floor((i / cols)) * rowHeight,
                    w: columnWidth,
                    h: rowHeight,
                },
                filter: [{
                    name: "text",
                    args: {
                        font: "arial.ttf",
                        fontSize: 100,
                        colour: "#000000",
                        content: background.key,
                        x: -2, y: -2,
                        ax: 0, ay: 0,
                        w: columnWidth,
                        spacing: 1.1,
                        align: 0,
                    }
                },{
                    name: "text",
                    args: {
                        font: "arial.ttf",
                        fontSize: 100,
                        colour: "#ffffff",
                        content: background.key,
                        x: 0, y: 0,
                        ax: 0, ay: 0,
                        w: columnWidth,
                        spacing: 1.1,
                        align: 0,
                    }
                }]
            })
        }
        return bot.util.imageProcessor(message, {
            components,
            width: cols*columnWidth,
            height: (result.length/4)*rowHeight
        }, "shop")
    }
};