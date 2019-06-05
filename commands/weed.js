/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (ocelotbotv5) weed
 */

let plants = {};
let loadedPlantCount = 0;
let status = [["Just a seed", "Breaking soil", "A green shoot", "A tall plant", "A budding plant", "Ready to harvest"], ["Getting thirsty...", "Wilting...", "Leaves dropping...", "Buds shrinking...", "Buds shrinking..."]];
let ageInterval = [1500, 3000, 15000, 75000, 118200];
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

async function addBux(bot, message, value) {
    await bot.database.setUserSetting(message.author.id, "weed.bux", message.getSetting("weed.bux") + value);
    bot.client.shard.send({type: "reloadUserConfig"});
}

async function removeBux(bot, message, value) {
    await bot.database.setUserSetting(message.author.id, "weed.bux", message.getSetting("weed.bux") - value);
    bot.client.shard.send({type: "reloadUserConfig"});
}

async function setBux(bot, id, value) {
    await bot.database.setUserSetting(id, "weed.bux", value);
    bot.client.shard.send({type: "reloadUserConfig"});
}

module.exports = {
    name: "Weedsim",
    usage: "weed <command>",
    categories: ["games"],
    commands: ["weed", "weedsim"],
    init: async function init(bot) {
        return;
        bot.logger.log("Loading weedsim commands...");
        bot.util.standardNestedCommandInit("weed");
        sortLoadedWeeds(await bot.database.getWeedPlants(), bot);


        setInterval(function () {
            bot.logger.log("Doing Weed");
            Object.keys(plants).forEach(async function (key) {
                plants[key].forEach(function (value) {
                    value.doPlant();
                    if (value.health <= 0) {
                        bot.logger.log("Deleting Plant");
                        value.dead = true;
                        bot.database.deletePlant(value);
                    }
                });
            });
            bot.database.saveAllPlants(plants);
        }, timeoutInterval * 60000) //15 minutes
    },
    run: async function run(message, args, bot) {

        function waterPlants() {
            console.log("Watering");
            plants[message.author.id].forEach(function (value) {
                value.waterTime = 43200;
            })
        }

        async function trimPlants() {
            let i = 0;
            plants[message.author.id].forEach(function (value) {
                if (value.age === 5) {
                    i = i + 1000;
                    value.age = 4;
                    value.growTime = ageInterval[3];
                    addBux(bot, message, 1000);
                }
            });
            let weedbuxString = await bot.lang.getTranslation(message.author.id, "WEED_WEEDBUX", {"weedbux" : i}, message.author.id);
            message.channel.send("You just got " + weedbuxString);
        }

        function getPlants() {
            return plants;
        }

        if (!message.getSetting("weed.bux")) {
            setBux(bot, message, 1000);
        }

        bot.util.standardNestedCommand(message, args, bot, "weed", {
            Plant,
            getPlants,
            status,
            ageInterval,
            waterPlants,
            trimPlants,
            setBux,
            addBux,
            removeBux
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