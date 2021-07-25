/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 18/01/2019
 * ╚════ ║   (ocelotbotv5) botlists
 *  ════╝
 */
const {axios} = require('../util/Http');
const Util = require("../util/Util");

function setDeep(obj, path, value, setRecursively = false) {
    return path.reduce((a, b, level) => {
        if (setRecursively && typeof a[b] === "undefined" && level !== path.length - 1) {
            a[b] = {};
            return a[b];
        }

        if (level === path.length - 1) {
            a[b] = value;
            return value;
        }
        return a[b];
    }, obj);
}

function conditionallyAssign(body, botList, fieldName, value) {
    if (botList[fieldName])
        body = setDeep(body, botList[fieldName].split("."), value, true);
    return body;
}

let counter = 0;

module.exports = class Botlists {
    bot;
    name = "Bot List Management";
    constructor(bot){
        this.bot = bot;
        bot.lists = this;
    }
    init(){
        this.bot.client.on("ready", ()=>{
            if (this.bot.client.user.id !== "146293573422284800" || this.bot.util.shard > 0) return;
            this.bot.logger.log("Doing botlist updates");
            setInterval(async ()=>{
                let botList = await this.bot.database.getSingleBotlist(counter++);
                if(!botList)return counter = 0;
                await this.updateList(botList);
            }, 60000)
        })

        this.bot.bus.on("commandLoadFinished", async ()=>{
            return axios.post("https://api.discordservices.net/bot/146293573422284800/commands", Object.keys(this.bot.commandObjects).map((key) => {
                const cmd = this.bot.commandObjects[key]
                return {
                    command: "!" + cmd.commands[0],
                    desc: cmd.name,
                    category: cmd.categories[0],
                }
            }), {headers: {authorization: (await this.bot.database.getBotlist("services"))[0].statsKey}})
        })
    }
    async updateList(botList){
        // TODO
        const voiceConnections = 0;//bot.lavaqueue && bot.lavaqueue.manager && bot.lavaqueue.manager.nodes.reduce((acc, n)=>acc+n.stats.players, 0);
        let body = {};
        conditionallyAssign(body, botList, "shardCountField", parseInt(process.env.SHARD_COUNT));
        conditionallyAssign(body, botList, "serverCountField", await Util.GetServerCount(this.bot));
        conditionallyAssign(body, botList, "shardIdField", this.bot.util.shard);
        conditionallyAssign(body, botList, "totalServerCountField", await Util.GetServerCount(this.bot));
        conditionallyAssign(body, botList, "usersCountField", this.bot.client.users.cache.size);
        conditionallyAssign(body, botList, "voiceConnectionsCountField", voiceConnections);
        conditionallyAssign(body, botList, "tokenField", botList.statsKey);
        let method = botList.statsMethod;
        let headers = {};
        if(botList.authHeader){
            headers[botList.authHeader] = botList.statsKey;
        }
        if(botList.statsMethod === "postHeader"){ // Another shitty workaround for a bunch of clone botlists that use headers for some ungodly reason
            method = "post"
            headers = {...headers, ...body};
            body = null;
        }
        axios[method](botList.statsUrl, body, {headers}).then(() => {
            this.bot.logger.log(`Posted stats to ${botList.id}`)
            return this.bot.database.botlistSuccess(botList.id);
        }).catch((e) => {
            this.bot.logger.warn(`Failed to post stats to ${botList.id}: ${e.message}`);
            if (e.response && e.response.data)
                console.log(JSON.stringify(e.response.data).substring(0, 500));
        })
    }
    async updateBotLists() {
        let botLists = await this.bot.database.getBotlistsWithStats();
        for (let i = 0; i < botLists.length; i++) {
            await this.updateList(botLists[i]);
        }
    }
}
