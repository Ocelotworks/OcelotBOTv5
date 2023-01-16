const config = require('config');
const dns = require('dns');
const {Manager} = require('@lavacord/discord.js');

module.exports = class Lavalink {
    name = "Lavalink";

    bot;
    resumeKey;
    clients = [];
    manager;
    lastSync = 0;
    state = {
        players: {"vcid": {}}
    }

    constructor(bot){
        this.bot = bot;
        bot.lavalink = this;
    }

    init() {
        this.bot.client.once("ready", ()=>{
            this.manager = new Manager(this.bot.client, this.clients, {
                user: this.bot.client.user.id,
                shards: process.env.SHARD_COUNT,
            });

            this.resumeKey = `${this.bot.client.user.id}-${this.bot.util.shard}`;
            // this.clients.push({
            //     id: "lava.link",
            //     host: "lava.link",
            //     port: 80,
            //     password: "ocelotbot.xyz",
            //     reconnectInterval: 1000,
            //     resumeKey: this.resumeKey,
            // })

            this.manager.connect();
            this.updateDockerContainers();
           // this.syncState();
            setInterval(this.reconnectNodes.bind(this), 60000);
            setInterval(this.updateDockerContainers.bind(this), 10000);
            //setInterval(this.syncState.bind(this), 1000);
        });
    }
    reconnectNodes(){
        this.manager.nodes.forEach(async(node)=>{
            if (!node.connected && !node.retries || node.retries < 10) {
                this.bot.logger.log(`Attempting to connect node ${node.id} (Retry ${node.retries})`);
                try {
                    await node.connect();
                } catch (e) {
                    node.retries = node.retries ? node.retries+1 : 1;
                    this.bot.logger.error(`Error connecting to node ${node.id}: ${e} (Retry ${node.retries})`);
                }
                node.retries = 0;
            }
        })
    }
    async updateDockerContainers(){
        try {
            let dockerHosts = await dns.promises.resolve("tasks.lavalink_lavalink", "A")

            this.manager.nodes.forEach((connectedNode) => {
                if (connectedNode.id.startsWith("docker-") && !dockerHosts.includes(connectedNode.id.split("-")[1])) {
                    this.bot.logger.log(`Node ${connectedNode.id} doesn't exist anymore.`);
                    const removed = this.manager.nodes.delete(connectedNode.id);
                    if(!removed)
                        this.bot.logger.log(`Node was not removed! ${connectedNode.id}, ${dockerHosts}`);
                }
            })

            dockerHosts.forEach((host) => {
                if (!this.manager.nodes.has(`docker-${host}`)) {
                    this.bot.logger.log(`Discovered new node docker-${host}`);
                    this.manager.createNode({
                        id: `docker-${host}`,
                        host,
                        port: 2333,
                        password: config.get("Lavalink.password"),
                        reconnectInterval: 1000,
                    })
                }
            });
        } catch (e) {
            if (e.code !== "ENOTFOUND")
                console.error(e);
        }
    }
    async syncState(){
        const key = `lavalink/${this.bot.client.user.id}/${this.bot.util.shard}`;

        try{
            let redisState = await this.bot.redis.getJson(key);
            if(redisState?.lastSync && redisState.lastSync > this.state.lastSync) {
                this.bot.logger.warn("Redis state is newer than current state");
                this.state = redisState;
                // TODO: Re-sync events
                return;
            }
        }catch(e){
            console.error(e);
        }

        // Sync was successful, bot still has the latest copy
        this.state.lastSync = new Date().getTime();
        try{
            this.bot.redis.client.set(key, JSON.stringify(this.state), "EX", 6000);
        }catch(e){
            console.error(e);
        }
    }

    createPlayer(audioContext){
        if(this.state.players[audioContext.voiceChannel.id])
            return this.state.players[audioContext.voiceChannel.id];
        return this.state.players[audioContext.voiceChannel.id] = this.manager.join({
            node: this.getNode().id,
            channel: audioContext.voiceChannel.id,
            guild: audioContext.voiceChannel.guild.id,
        }, {selfdeaf: true});
    }

    getNode() {
        return this.bot.util.arrayRand(this.manager.idealNodes);
    }

}