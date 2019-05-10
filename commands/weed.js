let plants = {};
let loadedPlantCount = 0;
let status = [["Just a seed", "Breaking soil", "A green shoot", "A tall plant", "A budding plant", "Ready to harvest"], ["Getting thirsty...", "Wilting...", "Leaves dropping...", "Buds shrinking...", "Buds shrinking..."]];
let ageInterval = [1500, 3000, 15000, 75000, 118200];
let weedbux = {};
let timeoutInterval = 15; //minutes

function plantify(value) {
    let plant = new Plant(value.id);
    plant.fromStorable(value);
    return plant;
}

function sortLoadedWeeds(weedPlants, bot) {
    let lastId = 0;
    weedPlants.forEach(function (value) {
        if (!(value.ownerID === lastId)) {
            plants[value.ownerID] = [];
        }
        plants[value.ownerID].push(plantify(value));
        loadedPlantCount++;
        lastId = value.ownerID;
    });
    bot.logger.log("Loaded " + loadedPlantCount + " weed plants from DB");
}

module.exports = {
    name: "Weedsim",
    usage: "weed <command>",
    categories: ["games"],
    commands: ["weed", "weedsim"],
    init: async function init(bot) {
        bot.logger.log("Loading weedsim commands...");
        bot.util.standardNestedCommandInit("weed");
        sortLoadedWeeds(await bot.database.getWeedPlants(), bot);


        setInterval(function () {
            bot.logger.log("Doing Weed");
            Object.keys(plants).forEach(async function (key) {
                plants[key].forEach(function (value) {
                    value.doPlant();
                    if (value.dead) {
                        bot.database.deletePlant(value);
                        value = null;
                    }
                });
            });
            bot.database.saveAllPlants(plants);
        }, timeoutInterval * 60000) //15 minutes
    },
    run: function run(message, args, bot) {

        function waterPlants() {
            console.log("Watering");
            plants[message.author.id].forEach(function (value) {
                value.waterTime = 43200;
            })
        }

        async function trimPlants() {
            plants[message.author.id].forEach(function (value) {
                if (value.age === 5) {
                    value.age = 4;
                    value.growTime = ageInterval[3];
                    weedbux[message.author.id] += 1000;
                }
            })
            await bot.database.setUserSetting(message.author.id, "weed.bux", weedbux[message.author.id]);
            bot.client.shard.send({type: "reloadUserConfig"});
        }

        function getPlants() {
            return plants;
        }

        if (weedbux[message.author.id] === undefined) {
            if(!message.getSetting("weed.bux")) {
                weedbux[message.author.id] = 1000;
            } else {
                weedbux[message.author.id] = message.getSetting("weed.bux");
            }
        }

        if (args[1] === "forceTick") {
            Object.keys(plants).forEach(function (key) {
                plants[key].forEach(function (value) {
                    value.doPlant();
                })
            });
            bot.database.saveAllPlants(plants);
            return;
        }

        bot.util.standardNestedCommand(message, args, bot, "weed", {
            Plant,
            getPlants,
            status,
            weedbux,
            ageInterval,
            waterPlants,
            trimPlants
        });
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

            if (this.growTime > ageInterval[this.age] && this.age < 5) {
                this.age++;
            }
        },
        toStorable: function () {
            return {
                ownerID: this.owner,
                age: this.age,
                waterTime: this.waterTime,
                growTime: this.growTime,
                health: this.health
            };
        },
        fromStorable: function (storable) {
            try {
                this.owner = storable.ownerID;
                this.age = storable.age;
                this.waterTime = storable.waterTime;
                this.growTime = storable.growTime;
                this.health = storable.health;
                this.id = storable.id;
                return true;
            } catch {
                return false;
            }
        }
    };
}