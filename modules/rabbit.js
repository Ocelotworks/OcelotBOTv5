/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/09/2019
 * ╚════ ║   (ocelotbotv5) rabbit
 *  ════╝
 */
const amqplib = require('amqplib');
const config = require('config');
module.exports = {
    name: "RabbitMQ",
    init: async function(bot){
        bot.rabbit = {};
        bot.rabbit.connection = await amqplib.connect(config.get("RabbitMQ.host"));
        bot.rabbit.channel = await bot.rabbit.connection.createChannel();
        bot.rabbit.rpcChannel = await bot.rabbit.connection.createChannel();
        bot.rabbit.eventsChannel = await bot.rabbit.connection.createChannel();
        bot.rabbit.pubsub = {};
        bot.rabbit.queue = function(name, payload, properties){
            bot.rabbit.channel.assertQueue(name);
            bot.rabbit.channel.sendToQueue(name, Buffer.from(JSON.stringify(payload)), properties);
        };
        let replyCount = 0;
        let waitingCallbacks = {};
        let callbackTimers = {};


        function handleEvent(msg){
            let data = JSON.parse(msg.content);
            data.meta = msg.properties;
            bot.rabbit.eventsChannel.ack(msg);
            console.log("emitting ", data.type)
            bot.bus.emit(data.type, data);
        }

        const eventsQueue = `events-${process.env.BOT_ID}-${bot.util.shard}`;
        const eventsExchange = `events-${process.env.BOT_ID}`;
        bot.rabbit.eventsChannel.assertQueue(eventsQueue, {exclusive: true, durable: false});
        bot.rabbit.eventsChannel.assertExchange(eventsExchange, 'fanout', {durable: false});
        bot.rabbit.eventsChannel.bindQueue(eventsQueue, eventsExchange, '');
        bot.rabbit.eventsChannel.consume(eventsQueue, handleEvent);


        bot.client.on("ready", function(){
            bot.rabbit.rpcChannel.assertQueue(`reply-${bot.client.user.id}-${bot.util.shard}`, {exclusive: true});
            bot.rabbit.rpcChannel.consume(`reply-${bot.client.user.id}-${bot.util.shard}`, function (msg) {
                bot.logger.log("Received reply ", msg.properties.correlationId);
                if (waitingCallbacks[msg.properties.correlationId]) {
                    bot.tasks.endTask("ipc", msg.properties.correlationId);
                    waitingCallbacks[msg.properties.correlationId](JSON.parse(msg.content.toString()));
                    clearTimeout(callbackTimers[msg.properties.correlationId]);
                }else{
                    bot.logger.warn("Unknown correlation ID ", msg.properties.correlationId);
                }
                bot.rabbit.rpcChannel.ack(msg);
            });
        });

        bot.rabbit.rpc = async function(name, payload, timeout = 300000, config){
            return new Promise(function(fulfill){
                bot.rabbit.rpcChannel.assertQueue(name, config);
                const correlationId = bot.util.shard+"-"+(replyCount++);
                bot.tasks.startTask("ipc", correlationId);
                bot.rabbit.rpcChannel.sendToQueue(name, Buffer.from(JSON.stringify(payload)), {correlationId, replyTo: `reply-${bot.client.user.id}-${bot.util.shard}`});
                waitingCallbacks[correlationId] = fulfill;
                callbackTimers[correlationId] = setTimeout(function rpcTimeout(){
                    bot.tasks.endTask("ipc", correlationId);
                    bot.logger.warn("RPC "+name+" timed out");
                    fulfill({err: "timeout"});
                }, timeout);
            });
        };

        bot.rabbit.emit = async function emit(type, payload){
            console.log("Emitting type "+type);
            let buf = Buffer.from(JSON.stringify(payload));
            if(!bot.rabbit.pubsub[type])
                bot.rabbit.pubsub[type] = await bot.rabbit.createPubsub(type);
            bot.rabbit.pubsub[type].publish(type, '', buf, {appId: `${bot.client.user.id}-${bot.util.shard}`});
        };

        bot.rabbit.event = function event(data){
            return bot.rabbit.eventsChannel.publish(`events-${bot.client.user.id}`,'', Buffer.from(JSON.stringify(data)), {appId: `${bot.client.user.id}-${bot.util.shard}`});
        }


        bot.rabbit.fetchId = 0;
        bot.rabbit.waitingFetches = {};

        bot.rabbit.fetchClientValues = async function fetchClientValues(prop){
            return new Promise((fulfill)=>{
                console.log("Fetching", prop);
                const id = `${bot.util.shard}-${bot.rabbit.fetchId++}`;
                bot.rabbit.event({type: "fetchClientValues", id, prop});

                const timeout = setTimeout(()=>{

                }, 5000);
                bot.rabbit.waitingFetches[id] = {fulfill: (value)=>{
                        bot.rabbit.waitingFetches[id].buffer.push(value);
                        if(bot.rabbit.waitingFetches[id].buffer.length >= process.env.SHARD_COUNT) {
                            fulfill(bot.rabbit.waitingFetches[id].buffer)
                            clearTimeout(bot.rabbit.waitingFetches[id].timeout)
                            bot.rabbit.waitingFetches[id] = null;
                        }
                }, buffer: [], timeout};
            })
        }

        bot.bus.on("fetchClientValues", (msg)=>{
            console.log("fetching ", msg.prop);
            let value = getValue(bot.client, msg.prop)
            bot.rabbit.event({type: "clientValueCallback", id: msg.id, value})
        });

        bot.bus.on("clientValueCallback", (msg)=>{
            if(bot.rabbit.waitingFetches[msg.id]){
                bot.rabbit.waitingFetches[msg.id].fulfill(msg.value)
            }
        })

        bot.rabbit.createPubsub = async function createPubsub(name){
            bot.logger.log("Creating queue");
            const channel = await bot.rabbit.connection.createChannel();
            channel.assertExchange(name, 'fanout', {'durable': false});
            return channel;
        };

        function getSafeMessage(message){
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

        bot.bus.on("commandPerformed", function(command, message){
            bot.rabbit.emit("commandPerformed", {
                command,
                message: getSafeMessage(message),
            });
        });

        bot.bus.on("commandRatelimited", function(command, message){
            bot.rabbit.emit("commandRatelimited", {
                command,
                message: getSafeMessage(message),
            });
        });

        bot.client.on("guildCreate", function(guild){
            bot.rabbit.emit("guildCreate", {
                id: guild.id,
                name: guild.name,
            });
        });

        bot.client.on("guildDelete", function(guild){
            bot.rabbit.emit("guildDelete", {
                id: guild.id,
                name: guild.name,
                available: guild.available
            });
        });

        bot.client.on("guildUnavailable", (guild)=>{
            bot.rabbit.emit("guildUnavailable", {
                id: guild.id,
                name: guild.name,
            });
        });
    }
};


function getValue(object, value){
    console.log("GetValue: ", value)
    let ind = value.indexOf(".");
    if(ind > -1){
        return getValue(object[value.substring(0, ind)], value.substring(ind+1))
    }
    return object[value];
}