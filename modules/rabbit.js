/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/09/2019
 * ╚════ ║   (ocelotbotv5) rabbit
 *  ════╝
 */
const amqplib = require('amqplib');
const config = require('config');
const os = require('os');
const Util = require("../util/Util");
module.exports = {
    name: "RabbitMQ",
    init: async function (bot) {
        try {
            bot.drain = false;
            bot.rabbit = {};
            bot.rabbit.connection = await this.getRabbitConnection();

            bot.rabbit.connection.on("close", async function (err) {
                console.log(err);
                bot.logger.warn("RabbitMQ connection closed!");
                process.exit(0);
            })

            bot.rabbit.connection.on("blocked", (reason) => {
                bot.logger.warn("RabbitMQ connection blocked! " + reason);
            })

            bot.rabbit.connection.on("error", (err) => {
                bot.logger.error("RabbitMQ connection error: " + err);
            })

            bot.rabbit.channel = await bot.rabbit.connection.createChannel();
            bot.rabbit.rpcChannel = await bot.rabbit.connection.createChannel();
            bot.rabbit.eventsChannel = await bot.rabbit.connection.createChannel();
            bot.rabbit.pubsub = {};
            bot.rabbit.queue = function (name, payload, properties) {
                bot.rabbit.channel.assertQueue(name);
                bot.rabbit.channel.sendToQueue(name, Buffer.from(JSON.stringify(payload)), properties);
            };
            let replyCount = 0;
            let waitingCallbacks = {};
            let callbackTimers = {};


            function handleEvent(msg) {
                let data = JSON.parse(msg.content);
                data.meta = msg.properties;
                bot.rabbit.eventsChannel.ack(msg);
                bot.bus.emit(data.type, data);
            }

            const identifier = `${process.env.BOT_ID}-${bot.util.shard}-${os.hostname()}`;
            const eventsQueue = `events-${identifier}`;
            const eventsExchange = `events-${process.env.BOT_ID}`;
            bot.rabbit.eventsChannel.assertQueue(eventsQueue, {exclusive: true, durable: false});
            bot.rabbit.eventsChannel.assertExchange(eventsExchange, 'fanout', {durable: false});
            bot.rabbit.eventsChannel.bindQueue(eventsQueue, eventsExchange, '');
            bot.rabbit.eventsChannel.consume(eventsQueue, handleEvent);

            bot.client.on("ready", function () {
                bot.rabbit.rpcChannel.assertQueue(`reply-${identifier}`, {exclusive: true, durable: false});
                bot.rabbit.rpcChannel.consume(`reply-${identifier}`, function (msg) {
                    bot.logger.log("Received reply ", msg.properties.correlationId);
                    if (waitingCallbacks[msg.properties.correlationId]) {
                        bot.tasks.endTask("ipc", msg.properties.correlationId);
                        waitingCallbacks[msg.properties.correlationId](JSON.parse(msg.content.toString()));
                        clearTimeout(callbackTimers[msg.properties.correlationId]);
                    } else {
                        bot.logger.warn("Unknown correlation ID ", msg.properties.correlationId);
                    }
                    bot.rabbit.rpcChannel.ack(msg);
                });
                if (!bot.drain) {
                    bot.logger.log("Emitting spawned event");
                    bot.rabbit.event({type: "spawned", id: bot.util.shard, version: process.env.VERSION})
                } else {
                    bot.logger.log("Not emitting spawned event, already draining");
                }
            });

            bot.client.on("guildCreate", function (guild) {
                bot.rabbit.emit("guildCreate", {
                    id: guild.id,
                    name: guild.name,
                });
            });

            bot.client.on("guildDelete", function (guild) {
                bot.rabbit.emit("guildDelete", {
                    id: guild.id,
                    name: guild.name,
                    available: guild.available
                });
            });

            bot.client.on("guildUnavailable", (guild) => {
                bot.rabbit.emit("guildUnavailable", {
                    id: guild.id,
                    name: guild.name,
                });
            });

            bot.bus.on("spawned", (message) => {
                if (message.meta.appId !== identifier && message.id === bot.util.shard) {
                    bot.logger.warn(`A new shard (Version ${message.version} Identifier ${message.meta.appId}) has started with the same ID as me (${message.id}). This shard is version ${bot.version} Identifier ${identifier}. Draining.`);
                    bot.drain = true;
                    setTimeout(() => {
                        console.error("Drain has been set for over 10 minutes and I'm still alive, suicide time");
                        process.exit(0);
                    }, 600000)
                }
            })

            bot.rabbit.rpc = async function (name, payload, timeout = 300000, config) {
                return new Promise(function (fulfill) {
                    bot.rabbit.rpcChannel.assertQueue(name, config);
                    const correlationId = bot.util.shard + "-" + (replyCount++);
                    bot.tasks.startTask("ipc", correlationId);
                    bot.rabbit.rpcChannel.sendToQueue(name, Buffer.from(JSON.stringify(payload)), {
                        correlationId,
                        replyTo: `reply-${identifier}`
                    });
                    waitingCallbacks[correlationId] = fulfill;
                    callbackTimers[correlationId] = setTimeout(function rpcTimeout() {
                        bot.tasks.endTask("ipc", correlationId);
                        bot.logger.warn("RPC " + name + " timed out");
                        fulfill({err: "timeout"});
                    }, timeout);
                });
            };

            bot.rabbit.emit = async function emit(type, payload) {
                let buf = Buffer.from(JSON.stringify(payload));
                if (!bot.rabbit.pubsub[type]) {
                    if (bot.rabbit.pubsub[type] === false) return;
                    bot.rabbit.pubsub[type] = false;
                    bot.rabbit.pubsub[type] = await bot.rabbit.createPubsub(type);
                }
                bot.rabbit.pubsub[type].publish(type, '', buf, {appId: identifier});
            };

            bot.rabbit.event = function event(data) {
                return bot.rabbit.eventsChannel.publish(`events-${process.env.BOT_ID}`, '', Buffer.from(JSON.stringify(data)), {appId: identifier});
            }


            bot.rabbit.fetchId = 0;
            bot.rabbit.waitingFetches = {};

            bot.rabbit.shardRpc = function (message) {
                return new Promise((fulfill) => {
                    const id = `${bot.util.shard}-${bot.rabbit.fetchId++}`;
                    message.id = id;
                    bot.rabbit.event(message);

                    const timeout = setTimeout(() => {
                        bot.logger.warn(`Waited for ${process.env.SHARD_COUNT} responses but only got ${bot.rabbit.waitingFetches[id].buffer.length}.`);
                        fulfill(bot.rabbit.waitingFetches[id].buffer);
                        bot.rabbit.waitingFetches[id] = null;
                    }, 1000);

                    bot.rabbit.waitingFetches[id] = {
                        fulfill: (value) => {
                            bot.rabbit.waitingFetches[id].buffer.push(value);
                            if (bot.rabbit.waitingFetches[id].buffer.length >= process.env.SHARD_COUNT) {
                                fulfill(bot.rabbit.waitingFetches[id].buffer)
                                clearTimeout(bot.rabbit.waitingFetches[id].timeout)
                                bot.rabbit.waitingFetches[id] = null;
                            }
                        }, buffer: [], timeout
                    };
                })
            }

            bot.rabbit.fetchClientValues = async function fetchClientValues(prop) {
                return bot.rabbit.shardRpc({type: "fetchClientValues", prop});
            }

            bot.bus.on("fetchClientValues", (msg) => {
                let value = getValue(bot.client, msg.prop)
                bot.rabbit.event({type: "clientValueCallback", id: msg.id, value})
            });

            bot.rabbit.broadcastEval = function (script) {
                return bot.rabbit.shardRpc({type: "broadcastEval", script});
            }

            bot.bus.on("broadcastEval", (msg) => {
                bot.rabbit.event({
                    type: "clientValueCallback", id: msg.id, value: (function () {
                        try {
                            return eval(msg.script)
                        }catch(e){
                            return e;
                        }
                    }).call(bot.client)
                })
            })

            bot.bus.on("clientValueCallback", (msg) => {
                if (bot.rabbit.waitingFetches[msg.id]) {
                    bot.rabbit.waitingFetches[msg.id].fulfill(msg.value)
                }
            })

            bot.rabbit.createPubsub = async function createPubsub(name) {
                bot.logger.log("Creating queue");
                const channel = await bot.rabbit.connection.createChannel();
                channel.assertExchange(name, 'fanout', {'durable': false});
                return channel;
            };

            function getSafeMessage(message) {
                return {
                    content: message.content,
                    createdAt: message.createdAt,
                    author: {
                        id: message.author.id,
                        username: message.author.username
                    },
                    guild: {
                        id: message.guild && message.guild.id,
                        name: message.guild && message.guild.name
                    },
                    channel: {
                        id: message.channel.id,
                        name: message.channel.name
                    }
                }
            }

            bot.bus.on("commandPerformed", function (command, message) {
                bot.rabbit.emit("commandPerformed", {
                    command,
                    message: getSafeMessage(message),
                });
            });

            bot.bus.on("commandRatelimited", function (command, message) {
                bot.rabbit.emit("commandRatelimited", {
                    command,
                    message: getSafeMessage(message),
                });
            });
        } catch (e) {
            console.error(e);
            process.exit(63);
        }
    },
    getRabbitConnection: async function () {
        let connection;
        let retries = 0;
        do {
            try {
                retries++;
                connection = await amqplib.connect(config.get("RabbitMQ.host"));
            } catch (e) {
                console.error(e);
            }
            if (retries > 5) {
                console.error(`Failed to connect to rabbit after ${retries} tries`);
                os.exit(80);
            }
            if (!connection) {
                console.log("Waiting for ${retires*1000}ms");
                await Util.Sleep(retries * 1000);
            }
        } while (!connection);
        return connection;
    }
};


function getValue(object, value) {
    let ind = value.indexOf(".");
    if (ind > -1) {
        return getValue(object[value.substring(0, ind)], value.substring(ind + 1))
    }
    return object[value];
}