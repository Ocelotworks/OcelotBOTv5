


const clientEventMapping = {
    messageCreate: {
        stat: "messagesTotal",
        rate: "messagesPerMinute"
    },
    rateLimit: {
        stat: "botRateLimits"
    },
    error: {
        stat: "errors"
    },
    shardError: {
        stat: "errors"
    },
    warn: {
        stat: "warnings"
    },
    shardReconnecting: {
        stat: "reconnects"
    },
    apiRequest: {
        stat: "apiRequestsTotal",
        rate: "apiRequestsPerMinute"
    }
}

const busEventMapping = {
    commandPerformed: {
        stat: "commandsTotal",
        rate: "commandsPerMinute"
    },
    commandFailed: {
        stat: "commandsFailed"
    },
    messageSent: {
        stat: "messagesSentTotal",
        rate: "messagesSentPerMinute"
    }
}

module.exports = class Statistics {
    bot;
    name = "Statistics Aggregator";


    performanceStats = {
        messagesPerMinute: 0,
        messagesTotal: 0,
        messagesSentPerMinute: 0,
        messagesSentTotal: 0,
        commandsPerMinute: 0,
        commandsTotal: 0,
        warnings: 0,
        errors: 0,
        botRateLimits: 0,
        userRateLimits: 0,
        reconnects: 0,
        lastUpdate: 0,
        commandsFailed: 0,
        cacheHits: 0,
        cacheMisses: 0,
        apiRequestsTotal: 0,
        apiResponsesTotal: 0,
        cockroachPoolRequests: 0,
        cockroachPoolFailures: 0,
        cockroachPoolSuccesses: 0,
    };
    performanceRateStats = {
        messagesPerMinute: 0,
        messagesSentPerMinute: 0,
        commandsPerMinute: 0,
        apiRequestsPerMinute: 0,
        apiResponsesPerMinute: 0,
    }

    userStats = {};

    constructor(bot){
        this.bot = bot;
    }

    init(){
        this.bot.stats = this.performanceStats;
        this.bot.api.get('/stats', this.getStats.bind(this));
        this.initEvents();
        this.initUserStats();
    }

    getStats(req, res){
        res.json(this.performanceStats);
    }

    initEvents(){
        // Discord.js Client Events
        const clientEvents = Object.keys(clientEventMapping);
        clientEvents.forEach((event)=>{
            let eventData = clientEventMapping[event];
            this.bot.client.on(event, ()=>{
                if(eventData.stat)
                    this.performanceStats[eventData.stat]++;
                if(eventData.rate)
                    this.performanceRateStats[eventData.rate]++;
            });
        });

        // OcelotBOT Events
        const busEvents = Object.keys(busEventMapping);
        busEvents.forEach((event)=>{
            let eventData = busEventMapping[event];
            this.bot.bus.on(event, ()=>{
                if(eventData.stat)
                    this.performanceStats[eventData.stat]++;
                if(eventData.rate)
                    this.performanceRateStats[eventData.rate]++;
            })
        })
        setInterval(this.updateRates.bind(this), 60000);
    }

    updateRates(){
        let rates = Object.keys(this.performanceRateStats);
        rates.forEach((rate)=>{
            this.performanceStats[rate] = this.performanceRateStats[rate];
            this.performanceRateStats[rate] = 0;
            this.performanceStats.lastUpdate = new Date().getTime();
        })
    }

    initUserStats(){
        this.bot.bus.on("commandPerformed", this.onCommandPerformed.bind(this));
        setInterval(this.pushUserStats.bind(this), 60000);
    }

    onCommandPerformed(context){
        this.incrementStat(context.guild?.id, context.user?.id, "commands_total");
    }

    incrementStat(guildid, userid, stat){
        if(guildid && userid)
            this.#createAndIncrement(guildid, userid, stat);
        if(guildid)
            this.#createAndIncrement(guildid, "all", stat);
        if(userid)
            this.#createAndIncrement("all", userid, stat);
        this.#createAndIncrement("all", "all", stat);
    }

    #createAndIncrement(guildid, userid, stat){
        if(!this.userStats[guildid])
            this.userStats[guildid] = {};
        if(!this.userStats[guildid][userid])
            this.userStats[guildid][userid] = {};
        if(!this.userStats[guildid][userid][stat])
            this.userStats[guildid][userid][stat] = 0;
        this.userStats[guildid][userid][stat]++;
    }

    // Don't like this
    pushUserStats(){
        let guilds = Object.keys(this.userStats);
        guilds.forEach((guild)=>{
            let users = Object.keys(this.userStats[guild]);
            users.forEach((user)=>{
                let stats = Object.keys(this.userStats[guild][user])
                stats.forEach(async (stat)=>{
                    let value = this.userStats[guild][user][stat];
                    if(value === 0)return;
                    this.bot.logger.log(`Incrementing Stat ${guild}/${user}/${stat} by ${value}`);
                    await this.bot.database.incrementStat(guild, user, stat, value);
                    this.userStats[guild][user][stat] = 0;
                })
            })
        })
    }
};