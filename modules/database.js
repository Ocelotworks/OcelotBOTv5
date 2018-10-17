/**
 * Created by Peter on 07/06/2017.
 */
const config = require('config');
const pasync = require('promise-async');
var knex = require('knex')(config.get("Database"));
module.exports = {
        name: "Database Module",
        enabled: true,
        init: function init(bot) {

        const SERVERS_TABLE = "ocelotbot_servers";
        const PETERMON_TABLE = "pm_status";
        const MEMES_TABLE = "ocelotbot_memes";
        const REMINDERS_TABLE = "ocelotbot_reminders";
        const TRIVIA_TABLE = "trivia";
        const COMMANDLOG_TABLE = "commandlog";
        const BANS_TABLE = "bans";
        const LEFTSERVERS_TABLE = "ocelotbot_leftservers";


        bot.database = {
            addServer: function addNewServer(serverID, addedBy, name, timestamp) {
                return knex.insert({
                    server: serverID,
                    owner: addedBy,
                    name: name,
                    prefix: "!",
                    timestamp: knex.raw(`FROM_UNIXTIME(${(timestamp ? new Date(timestamp).getTime() : new Date().getTime()) / 1000})`)
                }).into(SERVERS_TABLE);
            },
            deleteServer: function deleteServer(serverID) {
                return knex.delete()
                    .from(SERVERS_TABLE)
                    .where({
                        server: serverID
                    });
            },
            leaveServer: function leaveServer(serverID) {
                return knex.insert({
                    server: serverID
                })
                    .into(LEFTSERVERS_TABLE);
            },
            getServer: function getServer(serverID) {
                return knex.select().from(SERVERS_TABLE).where({server: serverID}).limit(1);
            },
            setServerSetting: function setServerSetting(server, setting, value) {
                return knex(SERVERS_TABLE).update(setting, value).where({server: server}).limit(1);
            },
            getServerLanguage: function getServerCurrency(server) {
                return knex.select("language").from(SERVERS_TABLE).where({server: server}).limit(1);
            },
            getLanguages: function getLanguages() {
                return knex.select("server", "language").from(SERVERS_TABLE);
            },
            getServers: function getServers() {
                return knex.select().from(SERVERS_TABLE);
            },

            getServersWithSetting: function getServersWithSetting(setting) {
                return knex.select().from(SERVERS_TABLE).whereNotNull(setting).andWhereNot(setting, 0);
            },
            getPrefixes: function getPrefixes() {
                return knex.select("server", "prefix").from(SERVERS_TABLE);
            },
            getLastPetermonData: function getLastPetermonData() {
                return knex.select().from(PETERMON_TABLE).orderBy("timestamp", "DESC").limit(1);
            },
            getPetermonLastOutside: function getPetermonLastOutside() {
                return knex.select("timestamp")
                    .from(PETERMON_TABLE)
                    .where({state: 'Outside'})
                    .orWhere({state: 'Abbeys'})
                    .orderBy("timestamp", "DESC")
                    .limit(1);
            },
            getMemes: function getMemes(server) {
                return knex.select("name", "server").from(MEMES_TABLE).where({server: server}).orWhere({server: "global"});
            },
            getAllMemes: function getAllMemes() {
                return knex.select("name").from(MEMES_TABLE);
            },
            removeMeme: function removeMeme(meme, server, user) {
                return knex.raw(knex.delete().from(MEMES_TABLE).where({
                    name: meme,
                    addedby: user
                }).whereIn("server", [server, "global"]).toString() + " LIMIT 1");
            },
            addMeme: function addMeme(user, server, name, content) {
                return knex.insert({
                    name: name,
                    addedby: user,
                    server: server,
                    meme: content
                }).into(MEMES_TABLE);
            },
            getMeme: function getMeme(meme, server) {
                return knex.select("meme").from(MEMES_TABLE).where({name: meme}).whereIn("server", [server, "global"]).orderBy("server");
            },
            forceGetMeme: function forceGetMeme(meme) {
                return knex.select("meme", "server").from(MEMES_TABLE).where({name: meme});
            },
            addReminder: function addReminder(receiver, user, server, channel, at, message) {
                return knex.insert({
                    receiver: receiver,
                    user: user,
                    server: server,
                    channel: channel,
                    at: knex.raw(`FROM_UNIXTIME(${at / 1000})`),
                    message: message
                }).into(REMINDERS_TABLE);
            },
            getReminders: function getReminders() {
                return knex.select().from(REMINDERS_TABLE);
            },
            removeReminder: function removeReminder(id) {
                return knex.delete().from(REMINDERS_TABLE).where({id: id});
            },
            getTriviaLeaderboard: function getTriviaLeaderboard() {
                return knex.select("user", knex.raw("SUM(difficulty) as 'Score'"), knex.raw("COUNT(*) as 'correct'"))
                    .from(TRIVIA_TABLE)
                    .where("correct", 1)
                    .orderBy("Score", "DESC")
                    .groupBy("user");
            },
            getMonthlyTriviaLeaderboard: function getMonthlyTriviaLeaderboard() {
                return knex.select("user", knex.raw("SUM(difficulty) as 'Score'"), knex.raw("COUNT(*) as 'correct'"))
                    .from(TRIVIA_TABLE)
                    .where("correct", 1)
                    .andWhereRaw("MONTH(timestamp) = MONTH(CURRENT_TIMESTAMP)")
                    .orderBy("Score", "DESC")
                    .groupBy("user");
            },
            logTrivia: function logTrivia(user, correct, difficulty, server) {
                return knex.insert({
                    user: user,
                    correct: correct,
                    difficulty: difficulty,
                    server: server
                }).into(TRIVIA_TABLE);
            },
            logCommand: function logCommand(user, channel, command) {
                return knex.insert({
                    userID: user,
                    channelID: channel,
                    command: command,
                    server: "ocelotbot-" + bot.client.shard ? bot.client.shard.id : "0"
                }).into(COMMANDLOG_TABLE);
            },
            ban: function ban(id, type, reason) {
                return knex.insert({
                    id: id,
                    type: type,
                    reason: reason
                }).into(BANS_TABLE);
            },
            getBans: function () {
                return knex.select().from(BANS_TABLE);
            },
            getCommandStats: function () {
                return knex.select(knex.raw("SUBSTRING_INDEX(SUBSTRING_INDEX(command, ' ',  1), ' ', -1) as commandName"), knex.raw("COUNT(*) as count"))
                    .from(COMMANDLOG_TABLE)
                    .whereRaw("command LIKE '!%'")
                    .andWhereRaw("server NOT LIKE 'ethanbot-%'")
                    .orderBy("count", "DESC")
                    .groupBy("commandName")
                    .limit(5);
            },
            getUserStats: function (user) {
                return knex.select(knex.raw("COUNT(*) AS commandCount")).from(COMMANDLOG_TABLE).where({userID: user})
            },
            getRandomTopic: function(){
                return knex.select().from("Topics").where({naughty: 0}).orderBy(knex.raw("RAND()")).limit(1);
            },
            addTopic: function(user, message){
                return knex.insert({
                    username: user,
                    topic: message,
                    naughty: 0
                }).into("Topics");
            },
            removeTopic: function(id){
                return knex.delete().from("Topics").where({id: id}).limit(1);
            },
            getTopicID: function(user, message){
                return knex.select(id).from("Topics").where({username: user, topic: message})
            },
            getTopicStats: function(){
                return knex.select(knex.raw("username, COUNT(*)")).from("Topics").orderByRaw("COUNT(*) DESC").groupBy("username");
            },
            logMessage: function(user, message, channel){
                return knex.insert({
                    user: user,
                    message: message,
                    channel: channel,
                    time: new Date().getTime()
                }).into("Messages");
            },
            getRandomRosesPoem: function(){
                return knex.select("message","user","time")
                    .from("Messages")
                    .whereRaw('message REGEXP ".*([to]o|u|[uei]w|2)$" AND (LENGTH(message) - LENGTH(REPLACE(message, " ", ""))) > 5')
                    .orderByRaw("RAND()")
                    .limit(1);
            },
            getMessages: function(target){
                let query = knex.select().from("Messages");
                if(target)query = query.where({user: target});
                return query;
            },
            getMessageID: function(user, message){
                return knex.select("id").from("Messages").where({message: message, user: user});
            },
            getMessageContext: function(id) {
                return knex.select().from("Messages").whereBetween("id", [id - 5, id + 5]);
            },
            getOnThisDayMessages: function(day,month){
                return knex.select().from("Messages").whereRaw("DAY(FROM_UNIXTIME(time/1000)) = "+day).andWhereRaw("MONTH(FROM_UNIXTIME(time/1000)) = "+month).orderBy("time", "ASC");
            },
            getMessageContaining: function(phrase){
                return knex.select().from("Messages").where("message", "like", `%${phrase}%`).limit(1).orderbyRaw("RAND()");
            },
            getMessageFrom: function(user, phrase){
                var query = knex.select().from("Messages").limit(1).orderByRaw("RAND()");
                if(user)
                    query = query.andWhere("user", user);
                if(phrase)
                    query = query.andWhere("message", "like", `%${phrase}%`);
                return query;
            },
            getDatabaseStats: async function(){
                const serverCount = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_servers");
                const leftServerCount = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_leftservers");
                const memeCount = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_memes");
                const reminderCount = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_reminders");
                const commandCount = await knex.select(knex.raw("COUNT(*)")).from("commandlog");
                return {
                    servers: serverCount[0]['COUNT(*)'],
                    leftServers: leftServerCount[0]['COUNT(*)'],
                    memes: memeCount[0]['COUNT(*)'],
                    reminders: reminderCount[0]['COUNT(*)'],
                    commands: commandCount[0]['COUNT(*)']
                }
            },
            canSpook: async function canSpook(user, server){
                const result = await bot.database.getSpooked(server);
                if(!result[0])
                     bot.logger.log(`${user} can spook because there have been no spooks.`);
                else if(result[0].spooked !== user)
                    bot.logger.log(`${user} can't spook ${result[0].spooked} is spooked not ${user}`);

                return !result[0] || result[0].spooked === user;
            },
            spook: function(user, spooker, server, spookerUsername, spookedUsername){
                return knex.insert({
                    spooker: spooker,
                    spooked: user,
                    server: server,
                    spookerUsername: spookerUsername,
                    spookedUsername: spookedUsername
                }).into("ocelotbot_spooks");
            },
            getSpooked: function(server){
                if(!server) {
                    return knex.select().from("ocelotbot_spooks").orderBy("timestamp", "desc");
                }
                return knex.select().from("ocelotbot_spooks").where({server: server}).orderBy("timestamp", "desc").limit(1);
            },
            getSpookedServers: async function(){
                return{
                    servers: await knex.select("server", knex.raw("COUNT(*)")).from("ocelotbot_spooks").groupBy("server"),
                    total: await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_spooks")
                }
            },
            getParticipatingServers: function(){
                return knex.select().distinct("server").from("ocelotbot_spooks");
            },
            getDirtySpooks: function(){
                return knex.select().from("ocelotbot_spooks").whereNull("spookerUsername").orWhereNull("spookedUsername");
            },
            updateSpook: function(id, spook){
                return knex("ocelotbot_spooks").update(spook).where({id: id}).limit(1);
            },
            getSpookCount: function(user, server) {
                return knex.select(knex.raw("COUNT(*)")).from("ocelotbot_spooks").where({server: server, spooked: user});
            },
            getSpookStats: async function(server){
                return {
                    mostSpooked: (await knex.select("spooked", knex.raw("COUNT(*)")).from("ocelotbot_spooks").where({server: server}).groupBy("spooked").orderByRaw("COUNT(*) DESC").limit(1))[0],
                    totalSpooks: (await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_spooks").where({server: server}))[0]['COUNT(*)'],
                    //I'm sorry papa
                    longestSpook: (await knex.select("spooked", knex.raw("TIMESTAMPDIFF(SECOND, timestamp, (SELECT timestamp FROM ocelotbot_spooks AS spooks3 WHERE id = (SELECT min(id) FROM ocelotbot_spooks AS spooks2 WHERE spooks2.id > ocelotbot_spooks.id AND spooks2.server = ocelotbot_spooks.server))) as diff")).from("ocelotbot_spooks").where({server: server}).orderBy("diff", "DESC").limit(1))[0]
                }
            }

        };
    }
};