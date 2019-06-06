/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (ocelotbotv5) weed
 */

let plants = {};
let loadedPlantCount = 0;
let status = [["Just a seed", "Breaking soil", "A green shoot", "A tall plant", "A budding plant", "Ready to harvest"], ["Getting thirsty...", "Wilting...", "Leaves dropping...", "Buds shrinking...", "Buds shrinking..."]];
let ageInterval = [0.5, 2, 10, 20, 32];

function plantify(value) {
    let plant = new Plant(value.id);
    plant.fromStorable(value);
    return plant;
}

function sortLoadedWeeds(weedPlants, bot) {
    weedPlants.forEach(function (value) {
        if (!plants[value.ownerID]) {
            plants[value.ownerID] = [];
        }
        plants[value.ownerID].push(plantify(value));
        loadedPlantCount++;
    });
    bot.logger.log("Loaded " + loadedPlantCount + " weed plants from DB");
}

async function addBux(bot, message, value) {
    await bot.database.setUserSetting(message.author.id, "weed.bux", message.getSetting("weed.bux") + value);
    await bot.client.shard.send({type: "reloadUserConfig"});
}

async function removeBux(bot, message, value) {
    await bot.database.setUserSetting(message.author.id, "weed.bux", message.getSetting("weed.bux") - value);
    await bot.client.shard.send({type: "reloadUserConfig"});
}

async function setBux(bot, id, value) {
    await bot.database.setUserSetting(id, "weed.bux", value);
    bot.client.shard.send({type: "reloadUserConfig"});
}

function hoursToMs(hours) {
    return hours * 3.6e+6;
}

function epoch(){
    return (new Date).getTime();
}

function getPlants() {
    return plants;
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
    },
    run: async function run(message, args, bot) {


        function waterPlants() {
            console.log("Watering");
            plants[message.author.id].forEach(function (value) {
                value.waterTime = epoch() + hoursToMs(12);
            })
        }

        async function trimPlants() {
            let i = 0;
            plants[message.author.id].forEach(async function (value) {
                if (value.age === 5) {
                    i = i + 1000;
                    value.age = 4;
                    value.growTime = epoch() + hoursToMs(ageInterval[3]);
                    await addBux(bot, message, 1000);
                }
            });
            let weedbuxString = await bot.lang.getTranslation(message.author.id, "WEED_WEEDBUX", {"weedbux": i}, message.author.id);
            message.channel.send("You just got " + weedbuxString);
        }

        if (!message.getSetting("weed.bux")) {
            await setBux(bot, message, 1000);
        }

        bot.util.standardNestedCommand(message, args, bot, "weed", {
            Plant,
            getPlants,
            status,
            ageInterval,
            waterPlants,
            trimPlants,
            removeBux,
            epoch
        });
    }
};

function Plant(id) {
    return {
        owner: id,  //Owner ID
        id: 0,      //Plant ID
        age: 0,     //Plant age in stages
        waterTime: epoch() + hoursToMs(12), //Time to require water
        growTime: epoch() + hoursToMs(ageInterval[0]),  //Time to age up
        health: 100,   //Health in percent
        statusIndex: 0, //Index of outer status array to load - decides between needing water, or just showing age text
        dead: false,
        doPlant: function () {   //Do all the plant-y stuff

            let difference = this.waterTime - epoch();

            if (difference <= 0) {
                this.health = this.health - 5;
            }

            if (difference <= hoursToMs(1)) {
                this.statusIndex = 1;
            } else {
                this.statusIndex = 0;
            }

            if (epoch() > this.growTime && this.age < 5) {
                this.age++;
                this.growTime = epoch() + hoursToMs(ageInterval[this.age]);
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