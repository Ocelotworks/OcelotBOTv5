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
module.exports = class RabbitMQ {
    name = "RabbitMQ"
    bot;

    connection;
    channel;
    rpcChannel;
    eventsChannel;

    pubsub = {};

    replyCount = 0;
    waitingCallbacks = {};
    callbackTimers = {};

    identifier;
    eventsQueue;
    eventsExchange;
    replyQueue;

    fetchId = 0;
    waitingFetches = {};

    constructor(bot){
        this.bot = bot;
        this.emit = this.emit.bind(this);
        this.createPubsub = this.createPubsub.bind(this);
    }

    init(bot){
        bot.drain = false;
        bot.rabbit = this;
        this.initRabbit().then(()=>{
            this.initClientEvents();
            this.initBusEvents();
        });
    }

    async initRabbit(){
        this.connection = await this.getRabbitConnection();
        this.channel = await this.connection.createChannel();
        this.rpcChannel = await this.connection.createChannel();
        this.eventsChannel = await this.connection.createChannel();

        this.identifier = `${process.env.BOT_ID}-${this.bot.util.shard}-${os.hostname()}`;
        this.eventsQueue = `events-${this.identifier}`;
        this.replyQueue = `reply-${this.identifier}`;
        this.eventsExchange = `events-${process.env.BOT_ID}`;

        this.eventsChannel.assertQueue(this.eventsQueue, {exclusive: true, durable: false});
        this.eventsChannel.assertExchange(this.eventsExchange, 'fanout', {durable: false});
        this.eventsChannel.bindQueue(this.eventsQueue, this.eventsExchange, '');
        this.eventsChannel.consume(this.eventsQueue, this.#handleEvent.bind(this));
    }

    initClientEvents(){
        this.bot.client.on("ready", this.onDiscordReady.bind(this));
        this.bot.client.on("guildCreate", this.onGuildCreate.bind(this));
        this.bot.client.on("guildDelete", this.onGuildDelete.bind(this));
        this.bot.client.on("guildUnavailable", this.onGuildUnavailable.bind(this));
    }

    initBusEvents(){
        this.bot.bus.on("spawned", this.onShardSpawned.bind(this));
        this.bot.bus.on("fetchClientValues", this.onBusFetchClientValues.bind(this));
        this.bot.bus.on("broadcastEval", this.onBusBroadcastEval.bind(this));
        this.bot.bus.on("clientValueCallback", this.onBusClientValueCallback.bind(this));
        this.bot.bus.on("commandPerformed", this.onBusCommandPerformed.bind(this));
        this.bot.bus.on("commandRatelimited", this.onBusCommandRatelimited.bind(this));
    }

    async getRabbitConnection () {
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

    queue(name, payload, properties){
        this.channel.assertQueue(name);
        this.channel.sendToQueue(name, Buffer.from(JSON.stringify(payload)), properties);
    }

    #handleEvent(msg){
        let data = JSON.parse(msg.content);
        data.meta = msg.properties;
        this.eventsChannel.ack(msg);
        this.bot.bus.emit(data.type, data);
    }

    onDiscordReady(){
        this.rpcChannel.assertQueue(this.replyQueue, {exclusive: true, durable: false});
        this.rpcChannel.consume(this.replyQueue, (msg)=>{
            this.bot.logger.log("Received reply ", msg.properties.correlationId);
            if (this.waitingCallbacks[msg.properties.correlationId]) {
                this.waitingCallbacks[msg.properties.correlationId](JSON.parse(msg.content.toString()));
                clearTimeout(this.callbackTimers[msg.properties.correlationId]);
            } else {
                this.bot.logger.warn(`Unknown correlation ID ${msg.properties.correlationId}`);
            }
            this.rpcChannel.ack(msg);
        });
        if (!this.bot.drain) {
            this.bot.logger.log("Emitting spawned event");
            this.event({type: "spawned", id: this.bot.util.shard, version: process.env.VERSION})
        } else {
            this.bot.logger.log("Not emitting spawned event, already draining");
        }
    }

    onGuildCreate(guild){
        this.emit("guildCreate", {
            id: guild.id,
            name: guild.name,
        });
    }

    onGuildDelete(guild){
        this.emit("guildDelete", {
            id: guild.id,
            name: guild.name,
            available: guild.available
        });
    }

    onGuildUnavailable(guild){
        this.emit("guildUnavailable", {
            id: guild.id,
            name: guild.name,
        });
    }

    onShardSpawned(message){
        if (message.meta.appId !== this.identifier && message.id === this.bot.util.shard) {
            this.bot.logger.warn(`A new shard (Version ${message.version} Identifier ${message.meta.appId}) has started with the same ID as me (${message.id}). This shard is version ${this.bot.version} Identifier ${this.identifier}. Draining.`);
            this.bot.drain = true;
            setTimeout(() => {
                console.error("Drain has been set for over 10 minutes and I'm still alive, suicide time");
                process.exit(0);
            }, 600000)
        }
    }

    rpc(name, payload, timeout = 300000, config){
        return new Promise((fulfill)=>{
            this.rpcChannel.assertQueue(name, config);
            const correlationId = `${this.bot.util.shard}-${this.replyCount++}`;
            this.rpcChannel.sendToQueue(name, Buffer.from(JSON.stringify(payload)), {
                correlationId,
                replyTo: this.replyQueue
            });
            this.waitingCallbacks[correlationId] = fulfill;
            this.callbackTimers[correlationId] = setTimeout(()=>fulfill({err: "timeout"}), timeout);
        });
    }

    shardRpc(message){
        return new Promise((fulfill) => {
            const id = `${this.bot.util.shard}-${this.fetchId++}`;
            message.id = id;
            this.event(message);

            const timeout = setTimeout(() => {
                this.bot.logger.warn(`Waited for ${process.env.SHARD_COUNT} responses but only got ${this.waitingFetches[id].buffer.length}.`);
                fulfill(this.waitingFetches[id].buffer);
                this.waitingFetches[id] = null;
            }, 1000);

            this.waitingFetches[id] = {
                fulfill: (value) => {
                    this.waitingFetches[id].buffer.push(value);
                    if (this.waitingFetches[id].buffer.length >= process.env.SHARD_COUNT) {
                        fulfill(this.waitingFetches[id].buffer)
                        clearTimeout(this.waitingFetches[id].timeout)
                        this.waitingFetches[id] = null;
                    }
                }, buffer: [], timeout
            };
        })
    }

    fetchClientValues(prop){
        return this.shardRpc({type: "fetchClientValues", prop});
    }

    onBusFetchClientValues(msg){
        this.event({type: "clientValueCallback", id: msg.id, value: this.#getValue(this.bot.client, msg.prop)})
    }

    async emit(type, payload){
        let buf = Buffer.from(JSON.stringify(payload));
        if (!this.pubsub[type]) {
            if (this.pubsub[type] === false) return;
            this.pubsub[type] = false;
            this.pubsub[type] = await this.createPubsub(type);
        }
        this.pubsub[type].publish(type, '', buf, {appId: this.identifier});
    }

    event(data){
        return this.eventsChannel.publish(this.eventsExchange, '', Buffer.from(JSON.stringify(data)), {appId: this.identifier});
    }

    broadcastEval(script){
        return this.shardRpc({type: "broadcastEval", script});
    }

    onBusBroadcastEval(msg){
        this.event({
            type: "clientValueCallback", id: msg.id, value: (function () {
                try {
                    return eval(msg.script)
                }catch(e){
                    return e;
                }
            }).call(this.bot.client)
        })
    }

    onBusClientValueCallback(msg){
        if (this.waitingFetches[msg.id])
            this.waitingFetches[msg.id].fulfill(msg.value)
    }

    async createPubsub(name){
        this.bot.logger.log("Creating queue");
        const channel = await this.connection.createChannel();
        channel.assertExchange(name, 'fanout', {'durable': false});
        return channel;
    }


    // TODO: Use SerialiseMessage for this
    #getSafeMessage(message) {
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

    onBusCommandPerformed(context){
        if(!context.message)return;
        this.emit("commandPerformed", {
            command: context.command,
            message: context.message && this.#getSafeMessage(context.message),
            interaction: context.interaction && this.bot.util.serialiseInteraction(context.interaction)
        });
    }

    onBusCommandRatelimited(command, message){
        this.emit("commandRatelimited", {
            command,
            message: this.#getSafeMessage(message),
        });
    }

    #getValue(object, value){
        let ind = value.indexOf(".");
        if (ind > -1) {
            return this.#getValue(object[value.substring(0, ind)], value.substring(ind + 1))
        }
        return object[value];
    }

}
