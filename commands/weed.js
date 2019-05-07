let plants = {};
let status = [["Just a seed", "Breaking soil", "A green shoot", "A tall plant", "A budding plant", "Ready to harvest"], ["Getting thirsty...", "Wilting...", "Leaves dropping...", "Buds shrinking...", "Buds shrinking..."]];
let ageInterval = [1500, 3000, 15000, 75000, 78000];
let weedbux = {};
let timeoutInterval = 15; //minutes

module.exports = {
    name: "Weedsim",
    usage: "weed <command>",
    categories: ["games"],
    commands: ["weed", "weedsim"],
    hidden: true,
    init: function init(bot) {
        bot.logger.log("Loading weedsim commands...");
        bot.util.standardNestedCommandInit("weed");

        setInterval(function () {
            bot.logger.log("Doing Weed");
            Object.keys(plants).forEach(function (key) {
                plants[key].forEach(function (value) {
                    value.doPlant();
                    if (value.dead) {
                        value = null;
                    }
                })
            });
        }, timeoutInterval * 60000) //15 minutes
    },
    run: function run(message, args, bot) {
        if (weedbux[message.author.id] === undefined) {
            weedbux[message.author.id] = 1000;
        }

        if (args[1] === "forceTick") {
            Object.keys(plants).forEach(function (key) {
                plants[key].forEach(function (value) {
                    value.doPlant();
                })
            });
            return;
        }

        bot.util.standardNestedCommand(message, args, bot, "weed", {Plant, plants, status, weedbux, ageInterval});
    }
};

function Plant(id) {
    return {
        owner: id,  //Owner ID
        id: 0,
        age: 0,     //Plant age in stages
        waterTime: 43200, //Time to require water
        growTime: 0,  //Time to age up
        health: 100,   //Health in percent
        statusIndex: 0, //Index of outer status array to load - decides between needing water, or just showing age text
        dead: false,
        doPlant: function () {   //Do all the plant-y stuff
            this.waterTime = this.waterTime - (timeoutInterval * 60);
            this.growTime = this.growTime + (timeoutInterval * 60);

            if (this.waterTime <= 0) {
                this.health = this.health - 5;
            }

            if (this.waterTime <= 4320) {
                this.statusIndex = 1;
            } else {
                this.statusIndex = 0;
            }

            if (this.health <= 0) {
                this.dead = true;
            }

            if (this.growTime > ageInterval[this.age] && this.age < 4) {
                this.age++;
            }
        }
    };
}