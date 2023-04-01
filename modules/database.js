/**
 * Created by Peter on 07/06/2017.
 */

/**
 * A Discord Snowflake
 * @typedef {String|Object} Snowflake
 */

/**
 * A Discord User
 * @typedef {Snowflake} UserID
 */

/**
 * A Discord Guild
 * @typedef {Snowflake} ServerID
 */

/**
 * A Discord Channel
 * @typedef {Snowflake} ChannelID
 */

const config = require('config');
const {v4: uuid} = require('uuid');
const os = require('os');
const Util = require("../util/Util");
let knex = require('knex')(config.get("Database"));
let cockroachConfig = {
    ...JSON.parse(JSON.stringify(config.get("Cockroach"))), //hatred
};
if(process.env.DOCKER_HOST && cockroachConfig.hosts[process.env.DOCKER_HOST])
    cockroachConfig.connection.host = cockroachConfig.hosts[process.env.DOCKER_HOST];
else
    cockroachConfig.connection.host = cockroachConfig.hosts[Util.ArrayRand(Object.keys(cockroachConfig.hosts))];
let knockroach = require('knex')(cockroachConfig);
knockroach.context.client.checkVersion = async () => 100;
// Map of
let unavailableHosts = {};

function isHostAvailable(host){
    const now = new Date();
    // Host was set unavailable
    return !unavailableHosts[host] || unavailableHosts[host] < now;
}

const series = new Date().getFullYear(); //Spook series
module.exports = {
    name: "Database Module",
    enabled: true,
    init: function init(bot) {
        this.initMonitoring(bot);
        const SERVERS_TABLE = "ocelotbot_servers";
        const MEMES_TABLE = "ocelotbot_memes";
        const REMINDERS_TABLE = "ocelotbot_reminders";
        const TRIVIA_TABLE = "trivia";
        const BANS_TABLE = "bans";
        const LEFTSERVERS_TABLE = "ocelotbot_leftservers";
        const LANG_TABLE = "ocelotbot_languages";
        const LANG_KEYS_TABLE = "ocelotbot_language_keys";
        const SPOOK_TABLE = "spooks";
        const SERVER_SETTINGS_TABLE = "ocelotbot_server_settings";
        const BADGES_TABLE = "badges";

        bot.database = {
            knex,
            knockroach,
            cockroachUnavailable: false,
            mysqlUnavailable: false,
            /**
             * Add a server to the database
             * @param {ServerID} server The server's Snowflake ID
             * @param {UserID} addedBy The server owner's Snowflake ID
             * @param {String} name The name of the server
             * @param {Number} [timestamp] The Unix Timestamp in milliseconds
             * @param {String} language Language
             * @param webhookID
             * @param webhookToken
             * @returns {Promise<Array>}
             */
            addServer: function addNewServer(server, addedBy, name, timestamp, language = "en-gb", webhookID, webhookToken) {
                return knex.insert({
                    server,
                    owner: addedBy,
                    name,
                    prefix: "!",
                    timestamp: knex.raw(`FROM_UNIXTIME(${(timestamp ? new Date(timestamp).getTime() : new Date().getTime()) / 1000})`),
                    language,
                    webhookID,
                    webhookToken
                }).into(SERVERS_TABLE);
            },
            /**
             * Remove a server from the database
             * This generally shouldn't be used in favour of `bot.database.leaveServer`
             * @param {ServerID} serverID The server's Snowflake ID
             * @returns {Promise<Array>}
             */
            deleteServer: function deleteServer(serverID) {
                return knex.delete()
                    .from(SERVERS_TABLE)
                    .where({
                        server: serverID
                    });
            },
            /**
             * Mark a server as left
             * @param {ServerID} server The server's Snowflake ID
             * @returns {Promise<Array>}
             */
            leaveServer: function leaveServer(server, timestamp = new Date()) {
                return knex.insert({server, timestamp}).into(LEFTSERVERS_TABLE);
            },
            unleaveServer: function unleaveServer(server) {
                return knex.delete().from(LEFTSERVERS_TABLE).where({server}).limit(1);
            },
            addServerWebhook: function addServerWebhook(server, webhookID, webhookToken) {
                return knex(SERVERS_TABLE).update({webhookID, webhookToken}).where({server}).limit(1);
            },
            getServerWebhook: function getServerWebhook(server) {
                return knex.select("webhookID", "webhookToken").from(SERVERS_TABLE).where({server}).limit(1);
            },
            updateServer: function (server, update) {
                return knex(SERVERS_TABLE).update(update).where({server}).limit(1);
            },
            /**
             * Get a server's data from it's ID
             * @param {ServerID} serverID The server's Snowflake ID
             * * @returns {Promise<Array>}
             */
            getServer: function getServer(serverID) {
                return knex.select().from(SERVERS_TABLE).where({server: serverID}).limit(1);
            },
            searchServer: function searchServer(serverName){
                return knex.select().from(SERVERS_TABLE).where("name", "LIKE", serverName);
            },
            getLeftServer: function getLeftServer(serverID){
                return knex.select().from(LEFTSERVERS_TABLE).where({server: serverID});
            },
            /**
             * Set a server's bot settings
             * @param {ServerID} server The server's Snowflake ID
             * @param {String} setting The setting key
             * @param {String|Number} value
             * * @returns {Promise<Array>}
             */
            setServerSetting: function setServerSetting(server, setting, value) {
                return knex(SERVERS_TABLE).update(setting, value).where({server: server}).limit(1);
            },
            /**
             * Get the language key for the server specified
             * @param {ServerID} server The server's Snowflake ID
             * @returns {Promise<Array>}
             */
            getServerLanguage: function getServerCurrency(server) {
                return knex.select("language").from(SERVERS_TABLE).where({server: server}).limit(1);
            },
            /**
             * Get all servers and their set languages
             * @returns {Promise<Array>}
             */
            getLanguages: function getLanguages() {
                return knex.select("server", "language").from(SERVERS_TABLE);
            },
            /**
             * Get all past and present servers
             * @returns {Promise<Array>}
             */
            getServers: function getServers() {
                return knex.select().from(SERVERS_TABLE);
            },
            getActiveServers: function getActiveServers() {
                return knex.select().from(SERVERS_TABLE).whereNotIn("server", knex.select("server").from(LEFTSERVERS_TABLE));
            },
            /**
             * Gets all servers with a particular setting enabled
             * @param {String} setting The setting key
             * @returns {Promise<Array>}
             */
            getServersWithSetting: function getServersWithSetting(setting) {
                return knex.select().from(SERVERS_TABLE).whereNotNull(setting).andWhereNot(setting, 0);
            },
            /**
             * Gets an array of servers and their set prefix
             * @returns {Promise<Array>}
             */
            getPrefixes: function getPrefixes() {
                return knex.select("server", "prefix").from(SERVERS_TABLE);
            },
            /**
             * Gets a list of all memes available to a particular server
             * @param {ServerID} server The server's Snowflake ID
             * @returns {Promise<Array>}
             */
            getMemes: function getMemes(server) {
                return knex.select("name", "server").from(MEMES_TABLE).where({server: server}).orWhere({server: "global"});
            },
            /**
             * Remove a meme from the database
             * @param {String} meme The meme's name
             * @param {ServerID} server The server ID
             * @returns {string}
             */
            removeMeme: function removeMeme(meme, server) {
                return knex.raw(knex.delete().from(MEMES_TABLE).where({
                    name: meme,
                }).whereIn("server", [server, "global"]).toString() + " LIMIT 1");
            },
            /**
             * Add a meme to the database
             * @param {UserID} user
             * @param {ServerID} server
             * @param {String} name The meme name
             * @param {String} content The meme content
             * @returns {*}
             */
            addMeme: function addMeme(user, server, name, content) {
                return knex.insert({
                    name: name,
                    addedby: user,
                    server: server,
                    meme: content
                }).into(MEMES_TABLE);
            },
            /**
             * Get a meme by name and server
             * @param {String} name The meme name
             * @param {ServerID} server The server ID
             * @returns {*}
             */
            getMeme: function getMeme(name, server) {
                return knex.select("meme").from(MEMES_TABLE).where({name}).whereIn("server", [server, "global"]).orderBy("server").limit(1);
            },
            getMemeInfo: function getMemeInfo(name, server) {
                return knex.select().from(MEMES_TABLE).where({name}).whereIn("server", [server, "global"]).orderBy("server").limit(1);
            },
            getRandomMeme: function getRandomMeme(server) {
                return knex.select().from(MEMES_TABLE).whereIn("server", [server, "global"]).orderByRaw("RAND()").limit(1);
            },
            searchMeme: function searchMeme(query, server) {
                return knex.select("name", "server").from(MEMES_TABLE).whereIn("server", [server, "global"]).andWhere("name", "LIKE", `%${query}%`).orderBy("server");
            },
            /**
             * Add a reminder
             * @param {String} receiver "discord", deprecated field from cross platform support
             * @param {UserID} user The User ID
             * @param {ServerID} server The server ID
             * @param {ChannelID} channel The channel ID
             * @param {Number} at The unix timestamp in milliseconds to trigger the reminder
             * @param {String} message The reminder message
             * @param messageID
             * @returns {*}
             */
            addReminder: function addReminder(receiver, user, server, channel, at, message, messageID) {
                return knex.insert({
                    receiver,
                    user,
                    server,
                    channel,
                    at: knex.raw(`FROM_UNIXTIME(${at / 1000})`),
                    message,
                    messageID,
                }).into(REMINDERS_TABLE);
            },
            /**
             * Gets all reminders
             * @returns {Promise<Array>}
             */
            getReminders: function getReminders(receiver) {
                return knex.select().from(REMINDERS_TABLE).whereNull("recurrence").andWhere({receiver});
            },
            getRemindersForUser: function (receiver, user, server) {
                return knex.select().from(REMINDERS_TABLE).where({receiver, user, server}).orderBy("at", "asc");
            },
            searchRemindersForUser: function(receiver, user, server, search){
                return knex.select().from(REMINDERS_TABLE).where({receiver, user, server}).andWhere((b)=>b.where("id", "like", `%${search}%`).orWhere("message", "like", `%${search}%`)).orderBy("at", "asc").limit(25);
            },
            getOrphanedReminders: function getOrphanedReminders(claimedReminders, receiver) {
                return knex.select().from(REMINDERS_TABLE).whereNotIn("id", claimedReminders).whereNull("recurrence").andWhere({receiver});
            },
            /**
             * Remove a reminder
             * @param {String} id
             * @returns {*}
             */
            removeReminder: function removeReminder(id) {
                return knex.delete().from(REMINDERS_TABLE).where({id: id});
            },
            removeReminderByUser: function removeReminderByUser(id, user) {
                return knex.delete().from(REMINDERS_TABLE).where({id, user}).limit(1);
            },
            getReminderById: function getReminderById(id) {
                return knex.select().from(REMINDERS_TABLE).where({id});
            },
            /**
             * Gets the all time trivia leaderboard
             * @returns {*}
             */
            getTriviaLeaderboard: function getTriviaLeaderboard() {
                return knex.select("user", knex.raw("SUM(difficulty) as 'Score'"), knex.raw("COUNT(*) as 'correct'"))
                    .from(TRIVIA_TABLE)
                    .where("correct", 1)
                    .orderBy("Score", "DESC")
                    .groupBy("user");
            },
            /**
             * Gets the monthly trivia leaderboard
             * @returns {*}
             */
            getMonthlyTriviaLeaderboard: function getMonthlyTriviaLeaderboard() {
                return knex.select("user", knex.raw("SUM(difficulty) as 'Score'"), knex.raw("COUNT(*) as 'correct'"))
                    .from(TRIVIA_TABLE)
                    .where("correct", 1)
                    .andWhereRaw("MONTH(timestamp) = MONTH(CURRENT_TIMESTAMP)")
                    .andWhereRaw("YEAR(timestamp) = YEAR(CURRENT_TIMESTAMP)")
                    .orderBy("Score", "DESC")
                    .groupBy("user");
            },
            getServerTriviaLeaderboard: function getServerTriviaLeaderboard(users) {
                return knex.select("user", knex.raw("SUM(difficulty) as 'Score'"), knex.raw("COUNT(*) as 'correct'"))
                    .from(TRIVIA_TABLE)
                    .whereIn("user", users)
                    .andWhere("correct", 1)
                    .orderBy("Score", "DESC")
                    .groupBy("user");
            },
            /**
             * Logs a trivia event
             * @param {UserID} user The user ID
             * @param {Boolean} correct If the user got the answer correct
             * @param {Number} difficulty The trivia service supplied difficulty
             * @param {ServerID} server The server ID
             * @returns {*}
             */
            logTrivia: function logTrivia(user, correct, difficulty, server) {
                return knex.insert({
                    user: user,
                    correct: correct,
                    difficulty: difficulty,
                    server: server
                }).into(TRIVIA_TABLE);
            },
            getTriviaCorrectCount: function (user) {
                return knex.select(knex.raw("count(*)")).from(TRIVIA_TABLE).where({user}).limit(1);
            },

            logCommand: function logCommand(userid, channelid, serverid, messageid, commandid, command, productid, type = "message") {
                return knockroach.insert({
                    userid,
                    channelid,
                    serverid,
                    messageid,
                    commandid,
                    command,
                    handler: os.hostname()+"/"+bot.util.shard,
                    productid,
                    type
                }).into("commands");
            },
            /**
             * Ban a user
             * @param {Snowflake} id The banned user/server/channel ID
             * @param {String} type "server"/"user"/"channel"
             * @param {String} reason The reason
             * @returns {*}
             */
            ban: function ban(id, type, reason) {
                return knex.insert({
                    id: id,
                    type: type,
                    reason: reason
                }).into(BANS_TABLE);
            },
            /**
             * Get all banned users
             * @returns {Array|*}
             */
            getBans: function () {
                return knex.select().from(BANS_TABLE);
            },
            getBan: function(id){
                return knex.select().from(BANS_TABLE).where({id}).limit(1);
            },
            getUserCommands: function(userid, productid){
                let query = knockroach.select('id', 'command').from("commands").where({userid}).orderBy("timestamp", "desc").limit(5);
                if(productid){
                    query = query.andWhere({productid});
                }
                return query;
            },
            getServerCommands: function(serverid, productid){
                let query = knockroach.select('id', 'command').from("commands").where({serverid}).orderBy("timestamp", "desc").limit(5);;
                if(productid){
                    query = query.andWhere({productid});
                }
                return query;
            },
            getCommandById: function(id, productid){
                let query = knockroach.select().from("commands").where({id}).limit(1);
                if(productid){
                    query = query.andWhere({productid});
                }
                return query;
            },
            /**
             * Get the count of commands by a particular user
             * @param {Snowflake} user
             * @returns {*}
             */
            getUserStats: function (userid) {
                return knockroach.select(knockroach.raw("COUNT(*)")).from("commands").where({userid})
            },
            /**
             * Get a random topic for Ocelotworks
             */
            getRandomTopic: function () {
                return knex.select().from("Topics").where({naughty: 0}).orderBy(knex.raw("RAND()")).limit(1);
            },
            /**
             * Add a topic
             * @param {String} user The user name NOT ID
             * @param {String} message The message
             * @returns {*}
             */
            addTopic: function (user, message) {
                return knex.insert({
                    username: user,
                    topic: message,
                    naughty: 0
                }).into("Topics");
            },
            /**
             * Remove a topic
             * @param {Number} id The topic ID
             */
            removeTopic: function (id) {
                return knex.delete().from("Topics").where({id: id}).limit(1);
            },
            /**
             * Get a topic ID from it's contnet
             * @param {String} user The user's name
             * @param {String} message The message
             * @returns {*}
             */
            getTopicID: function (user, message) {
                return knex.select(id).from("Topics").where({username: user, topic: message})
            },
            /**
             * Get stats of topic per user
             * @returns {*}
             */
            getTopicStats: function () {
                return knex.select(knex.raw("username, COUNT(*)")).from("Topics").orderByRaw("COUNT(*) DESC").groupBy("username");
            },
            /**
             * Log an Ocleotworks message
             * @param {String} user
             * @param {String} message
             * @param {ChannelID} channel
             * @returns {*}
             */
            logMessage: function (user, message, channel) {
                return knex.insert({
                    user: user,
                    message: message,
                    channel: channel,
                    time: new Date().getTime()
                }).into("Messages");
            },
            /**
             * Generates a "roses are red" poem
             */
            getRandomRosesPoem: function () {
                return knex.select("message", "user", "time")
                    .from("Messages")
                    .whereRaw('message REGEXP ".*([to]o|u|[uei]w|2)$" AND (LENGTH(message) - LENGTH(REPLACE(message, " ", ""))) > 5')
                    .orderByRaw("RAND()")
                    .limit(1);
            },
            /**
             * Get all messages by a particular user
             * @param {String} target The users name
             * @returns {Array|*}
             */
            getMessages: function (target) {
                let query = knex.select().from("Messages");
                if (target) query = query.where({user: target});
                return query;
            },
            /**
             * Get a message ID from the content
             * @param {String} user
             * @param {String} message
             * @returns {*}
             */
            getMessageID: function (user, message) {
                // don't really understand what this does
                // message = message.replace(/<@!?\d+>/g, '<@!?[0-9]+>')
                return knex.select("id").from("Messages").where({message: message, user: user});
            },
            /**
             * Get the messages surrounding a particular message ID
             * @param {Number} id
             * @returns {*}
             */
            getMessageContext: function (id, leftOffset = 5, rightOffset = 5) {
                return knex.select().from("Messages").whereBetween("id", [id - leftOffset, id + rightOffset]);
            },
            /**
             * Get all messages with a particular date
             * @param {Number} day
             * @param {Number} month
             * @returns {*}
             */
            getOnThisDayMessages: function (day, month) {
                return knex.select().from("Messages").whereRaw("DAY(FROM_UNIXTIME(time/1000)) = " + day).andWhereRaw("MONTH(FROM_UNIXTIME(time/1000)) = " + month).orderBy("time", "ASC");
            },
            /**
             * Gets a random message containing a particular phrase
             * @param {String} phrase
             * @returns {*}
             */
            getMessageContaining: function (phrase) {
                return knex.select().from("Messages").where("message", "like", `%${phrase}%`).limit(1).orderbyRaw("RAND()");
            },
            /**
             * Gets a random message from a user containing a phrase
             * @param {String} [user]
             * @param {String} [phrase]
             * @returns {*}
             */
            getMessageFrom: function (user, phrase) {
                var query = knex.select().from("Messages").limit(1).orderByRaw("RAND()");
                if (user)
                    query = query.andWhere("user", user);
                if (phrase)
                    query = query.andWhere("message", "like", `%${phrase}%`);
                return query;
            },
            getPhraseCount: function (phrase) {
                return knex.select(knex.raw("COUNT(*)")).from("Messages").where("message", "like", `%${phrase}%`);
            },
            /**
             * Spook someone
             * @param spooked
             * @param {UserID} spooker The user who did the spooking
             * @param {ServerID} server The server where the spook happened
             * @param channel
             * @param {String} spookerUsername The spooker's username
             * @param {String} spookedUsername
             * @param {String} spookerColour
             * @param {String} spookedColour
             * @param {String} spookerAvatar
             * @param {String} spookedAvatar
             * @param {String} type
             * @returns {*}
             */
            spook: function spook(spooked, spooker, server, channel, spookerUsername, spookedUsername, spookerColour, spookedColour, spookerAvatar, spookedAvatar, type) {
                return knockroach.insert({
                    spooked,
                    spooker,
                    server,
                    channel,
                    spookerUsername,
                    spookedUsername,
                    spookerColour,
                    spookedColour,
                    spookerAvatar,
                    spookedAvatar,
                    series,
                    type
                }).into(SPOOK_TABLE);
            },
            /**
             * Get the person who is currently spooked
             * @param {ServerID} [server]
             * @returns {*}
             */
            getSpooked: async function (server) {
                if (!server) {
                    return knockroach.select().from(SPOOK_TABLE).orderBy("timestamp", "desc").where({series});
                }
                return (await knockroach.select().from(SPOOK_TABLE).where({server, series}).orderBy("timestamp", "desc").limit(1))[0];
            },
            getPreviousSpook: async function (server) {
                return (await knockroach.select().from(SPOOK_TABLE).where({server, series}).andWhereNot({type: "ROLLBACK"}).orderBy("timestamp", "desc").limit(1).offset(1))[0];
            },
            /**
             * Get the total times a user has been spooked in a particular server
             * @param {UserID} spooked
             * @param {ServerID} server
             * @returns {*}
             */
            getSpookCount: async function (spooked, server) {
                return (await knockroach.select(knex.raw("COUNT(*)")).from(SPOOK_TABLE).where({server, spooked, series}))[0].count;
            },
            getCurrentlySpookedForShard: function (servers) {
                return knockroach.select("server", "spooked", "spooker", "timestamp").from(knex.raw(SPOOK_TABLE+" as a")).whereIn("server", servers).andWhere("timestamp", knex.select(knex.raw("MAX(timestamp)")).from(knex.raw(SPOOK_TABLE+" as b")).whereRaw("a.server = b.server")).andWhere("series", series);
            },
            getTotalSpooks: async function(){
                return (await knockroach.select(knex.raw("COUNT(*)")).from(SPOOK_TABLE).where({series}))[0].count;
            },
            getAvailableSpookRoles: function(){
                return knockroach.select().from("spook_roles");
            },
            getAssignedRolesForServer: function(serverID){
                return knockroach.select().from("spook_role_assignments").where({serverID});
            },
            getRoleForUser: async function(userID, serverID){
                return (await knockroach.select().from("spook_role_assignments").where({userID, serverID}).limit(1))[0];
            },
            getRoleCountsForServer: function(serverID){
                return knockroach.select("id", "rate", knex.raw(`(select count(*) from spook_role_assignments where role = id and spook_role_assignments."serverID" = ?)`, serverID)).from("spook_roles").orderByRaw("RANDOM()")
            },
            getRoleInfo: async function(id){
                return (await knockroach.select().from("spook_roles").where({id}).limit(1))[0]
            },
            addSpookRole: function(userID, serverID, role, data){
                return knockroach.insert({userID, serverID, role, data}).into("spook_role_assignments");
            },
            getSpookLeaderboard: function(){
                return knockroach.select("server", knex.raw("COUNT(*)")).from(SPOOK_TABLE).where({series}).groupBy("server").orderByRaw("COUNT(*) DESC");
            },
            /**
             * Get the end spook stats
             * @param {ServerID} server
             * @returns {Promise.<{mostSpooked: Object<{spooked: UserID, COUNT(*): Number}>, totalSpooks: Number, longestSpook: Object<{spooked: {UserID}, diff: Number}>}>}
             */
            getSpookStats: async function (server) {
                return {
                    mostSpooked: (await knockroach.select("spooked", knex.raw("COUNT(*)")).from(SPOOK_TABLE).where({
                        server,
                        series
                    }).andWhereNot({"spooker": bot.client.user.id}).groupBy("spooked").orderByRaw("COUNT(*) DESC").limit(1))[0],
                    totalSpooks: (await knockroach.select(knex.raw("COUNT(*)")).from(SPOOK_TABLE).where({
                        server,
                        series
                    }))[0].count,
                    allSpooks: (await knockroach.select(knex.raw("COUNT(*)")).from(SPOOK_TABLE).where({series}))[0].count,
                    //I'm sorry papa
                    // longestSpook: (await knockroach.select("spooked", knex.raw("timestamp - (SELECT timestamp FROM spooks AS spooks3 WHERE id = (SELECT min(id) FROM spooks AS spooks2 WHERE spooks2.id > spooks.id AND spooks2.server = spooks.server)) as diff")).from("spooks").where({
                    //     server,
                    //     series
                    // }).orderBy("diff", "DESC").limit(1))[0]
                }
            },
            getSpookedCountBySpooked: async function(server, spooked){
                return (await knockroach.select(knockroach.raw("count(*)")).from(SPOOK_TABLE).where({series, server, spooked}))[0].count;
            },
            getSpookedCountBySpookerAndSpooked: async function(server, spooker, spooked){
               return (await knockroach.select(knockroach.raw("count(*)")).from(SPOOK_TABLE).where({series, server, spooked, spooker}))[0].count;
            },
            getProfile: function (user) {
                return knex.select().from("ocelotbot_profile").where({id: user}).limit(1);
            },
            getProfileOption: function (id) {
                return knex.select().from("ocelotbot_profile_options").where({id}).limit(1);
            },
            getProfileOptions: function (type) {
                return knex.select().from("ocelotbot_profile_options").where({type, hidden: 0});
            },
            getProfileOptionByKey: function (key, type) {
                return knex.select().from("ocelotbot_profile_options").where({key, type}).limit(1);
            },
            setProfileOption: function (id, option, value) {
                return knex("ocelotbot_profile").update({[option]: value}).where({id}).limit(1);
            },
            createProfile: async function (user) {
                return knex.insert({
                    id: user,
                    firstSeen: (await bot.database.getFirstSeen(user))[0]['MIN(timestamp)']
                }).into("ocelotbot_profile");
            },
            getProfileBadges: function (user) {
                return knockroach.select().from("badge_assignments").where({user}).innerJoin(BADGES_TABLE, "badges.id", "badge_assignments.badge").orderBy("badge_assignments.order", "ASC");
            },
            getBadgeTypes: function () {
                return knockroach.select().from(BADGES_TABLE).orderBy("order");
            },
            getBadgesInSeries: function (series) {
                return knockroach.select().from(BADGES_TABLE).orderBy("order").where({series});
            },
            setProfileTagline: function (user, tagline) {
                return knex("ocelotbot_profile").update({caption: tagline}).where({id: user}).limit(1);
            },
            giveBadge: function (user, badge) {
                return knockroach.insert({user, badge}).into("badge_assignments");
            },
            getBadge: function (id) {
                return knockroach.select().from("badges").where({id}).limit(1);
            },
            hasBadge: async function (user, badge) {
                return (await knockroach.select().from("badge_assignments").where({
                    user,
                    badge
                }).limit(1)).length > 0
            },
            haveBadge: async function (users, badge) {
                return knockroach.select("user").where({badge}).whereIn("user", users).from("badge_assignments");
            },
            removeBadge: function (user, badge) {
                return knockroach.delete().from("badge_assignments").where({user, badge});
            },
            getFirstSeen: function (userid) {
                return knockroach.select(knockroach.raw("MIN(timestamp)")).from("commands").where({userid: userid})
            },
            addSubscription: function (server, channel, user, type, data, productID) {
                return knex.insert({server, channel, user, type, data, productID}).into("ocelotbot_subscriptions");
            },
            getSubscriptionsForChannel: function (channel, productID) {
                return knex.select().from("ocelotbot_subscriptions").where({
                    channel, productID
                });
            },
            getAllSubscriptions: function (productID) {
                return knex.select().from("ocelotbot_subscriptions").where({productID});
            },
            getSubscriptionsForShard: function (servers, productID) {
                return knex.select().from("ocelotbot_subscriptions").whereIn("server", servers).andWhere({productID});
            },
            updateLastCheck: function (id) {
                return knex("ocelotbot_subscriptions").update({lastcheck: new Date()}).where({id}).limit(1);
            },
            removeSubscription: function (server, channel, id) {
                return knex("ocelotbot_subscriptions").delete().where({
                    server: server,
                    channel: channel,
                    id: id
                }).limit(1);
            },
            removeSubscriptionsForChannel: function (server, channel, productID) {
                return knex("ocelotbot_subscriptions").delete().where({server, channel, productID});
            },
            addLangKey: function (lang, key, message) {
                return knex.insert({
                    lang: lang,
                    key: key,
                    message: message
                }).into(LANG_KEYS_TABLE);
            },
            getLanguageList: function () {
                return knex.select().from(LANG_TABLE);
            },
            getAllLanguageKeys: function () {
                return knex.select().from(LANG_KEYS_TABLE);
            },
            getLanguageKeys: function (lang) {
                return knex.select().from(LANG_KEYS_TABLE).where({lang: lang});
            },
            getLanguagesForShard: function (guilds) {
                return knex.select("server", "language").from(SERVERS_TABLE).whereIn("server", guilds);
            },
            getServerSetting: function (server, property) {
                return knex.select().from(SERVER_SETTINGS_TABLE).where({
                    server,
                    setting: property,
                    bot
                }).orWhere({server: "global", setting: property, bot}).orderBy("server").limit(1);
            },
            getServerSettings: function (server, bot) {
                return knex.select().from(SERVER_SETTINGS_TABLE).where({server, bot});
            },
            getUserSettingsForShard: function (users) {
                return knex.select().from("ocelotbot_user_settings");
            },
            getSettingsForShard: function (guilds, bot) {
                return knex.select().from(SERVER_SETTINGS_TABLE).whereIn("server", guilds).andWhere({bot});
            },
            getGlobalSettings: function (bot) {
                return knex.select().from(SERVER_SETTINGS_TABLE).where({server: "global", bot});
            },
            setSetting: async function (server, setting, value, bot) {
                let currentKey = await knex.select().from(SERVER_SETTINGS_TABLE).where({server, setting, bot}).limit(1);
                if (currentKey.length > 0)
                    return knex(SERVER_SETTINGS_TABLE).update({setting, value}).where({server, setting, bot}).limit(1);
                return knex.insert({server, setting, value, bot}).into(SERVER_SETTINGS_TABLE);
            },
            setUserSetting: async function (user, setting, value) {
                let currentKey = await knex.select().from("ocelotbot_user_settings").where({user, setting}).limit(1);
                if (currentKey.length > 0)
                    return knex("ocelotbot_user_settings").update({setting, value}).where({user, setting}).limit(1);
                return knex.insert({user, setting, value}).into("ocelotbot_user_settings");
            },
            deleteSetting: async function (server, setting, bot) {
                await knex.delete().from(SERVER_SETTINGS_TABLE).where({server, setting, bot}).limit(1);
            },
            getSettingsAssoc: function(){
                return knex.select().from("ocelotbot_server_settings_assoc").where({settable:1, chat_settable: 1}).orderBy("order");
            },
            getSettingsAssocForCommand: function(command){
                return knex.select().from("ocelotbot_server_settings_assoc").where({settable:1, chat_settable: 1, command}).orderBy("order");
            },
            getSettingsAssocCommands: function(){
                return knex.select("command", knex.raw("COUNT(*)")).from("ocelotbot_server_settings_assoc").where({settable: 1, chat_settable: 1}).groupBy("command").orderByRaw("COUNT(*) DESC");
            },
            getSettingAssoc: async function(setting){
                let value = await knex.select().from("ocelotbot_server_settings_assoc").where({settable:1, setting}).limit(1);
                return value[0];
            },
            searchSettingAssoc: function(search){
                search = `%${search}%`;
                return knex.select().from("ocelotbot_server_settings_assoc").whereRaw("(`setting` LIKE ? OR `name` LIKE ? OR `desc` LIKE ?)", [search, search, search]).andWhere({settable:1}).limit(1);
            },
            addSongGuess: async function (user, channel, server, guess, song, correct, elapsed, custom = false) {
                await knex.insert({user, channel, server, guess, song, correct, elapsed, custom}).into("ocelotbot_song_guess");
            },
            addVote: async function (user, referralServer, source, multiplier) {
                await knex.insert({user, referralServer, source, multiplier}).into("ocelotbot_votes");
            },
            getVoteCount: function (user) {
                return knex.select(knex.raw("COUNT(*)")).from("ocelotbot_votes").where({user});
            },
            getLastVote: function (user) {
                return knex.select(knex.raw("MAX(timestamp)")).from("ocelotbot_votes").where({user}).limit(1);
            },
            getLastVoteBySource: async function (user, source) {
                let result = await knex.select(knex.raw("MAX(timestamp)")).from("ocelotbot_votes").where({user, source}).limit(1);
                if(result[0])return result[0]['MAX(timestamp)'];
                return null;
            },
            getEligibleBadge: function (user, series, count) {
                return knockroach.select()
                    .from("badges")
                    .whereNotIn('id', knockroach.select('badge').from("badge_assignments").where({user}))
                    .andWhere({series})
                    .andWhere('min', '<=', count)
                    .andWhere('max', '>', count)
                    .limit(1);
            },
            deleteBadgeFromSeries: async function (user, series) {
                await knockroach.raw(`DELETE FROM badge_assignments WHERE "user" = ? AND badge IN (SELECT id FROM badges WHERE series = ?)`, [user, series]);
            },
            updateSongRecord: async function (song, user, time) {
                let currentRecord = (await knex.select("time").from("ocelotbot_song_guess_records").where({song}).limit(1))[0];
                if (!currentRecord)
                    return knex.insert({song, user, time}).into("ocelotbot_song_guess_records");
                if (currentRecord.time > time)
                    return knex("ocelotbot_song_guess_records").update({
                        user,
                        time,
                        timestamp: new Date()
                    }).where({song}).limit(1);
            },
            getFastestSongGuess: function (song) {
                return knex.select().from("ocelotbot_song_guess_records").where({song});
            },
            getTotalCorrectGuesses: function (user) {
                return knex.select(knex.raw("COUNT(*)")).from("ocelotbot_song_guess").groupBy("user").where({
                    user,
                    correct: 1
                });
            },
            getCommandCountByCommand: async function (userid) {
                let result = await knockroach.select(knockroach.raw("COUNT(*)"), "commandid").from("commands").groupBy("commandid").where({userid});
                let output = {};
                for (let i = 0; i < result.length; i++) {
                    let row = result[i];
                    output[row.commandid] = parseInt(row.count) || 0;
                }
                return output;
            },
            getGuessStats: async function () {
                return {
                    totalGuesses: (await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_song_guess"))[0].count,
                    totalCorrect: (await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_song_guess").where({correct: 1}))[0]['COUNT(*)'],
                    averageTime: (await knex.select(knex.raw("AVG(elapsed)")).from("ocelotbot_song_guess").where({correct: 1}))[0]['AVG(elapsed)'],
                    totalUsers: (await knex.select(knex.raw("COUNT(DISTINCT user)")).from("ocelotbot_song_guess"))[0]['COUNT(DISTINCT user)'],
                    totalTime: (await knex.select(knex.raw("SUM(elapsed)")).from("ocelotbot_song_guess").where({correct: 1}))[0]['SUM(elapsed)']
                }
            },
            getGuessLeaderboard: function () {
                return knex.select(knex.raw("user, COUNT(*) AS total, SUM(correct) AS points")).from("ocelotbot_song_guess").groupBy("user").orderByRaw("SUM(correct) DESC");
            },
            getGuessMonthlyLeaderboard: function () {
                return knex.select(knex.raw("user, COUNT(*) AS total, SUM(correct) AS points")).from("ocelotbot_song_guess").groupBy("user").orderByRaw("SUM(correct) DESC").whereRaw("MONTH(timestamp) = MONTH(CURRENT_TIMESTAMP)")
            },
            getGuessServerLeaderboard: function (users) {
                return knex.select(knex.raw("user, COUNT(*) AS total, SUM(correct) AS points")).from("ocelotbot_song_guess").groupBy("user").orderByRaw("SUM(correct) DESC").whereIn("user", users);
            },
            getGuessPlaylists: function(server){
                return knex.select("id").from("ocelotbot_song_guess_playlists").whereIn("server", [server, "global"]);
            },
            getGuessPlaylist: async function(server, id){
                  let result = await knex.select("spotify_id").from("ocelotbot_song_guess_playlists").whereIn("server", [server, "global"]).andWhere({id}).orderBy("server").limit(1);
                  if(result[0])return result[0]['spotify_id'];
                  return null;
            },
            getGuessPlaylistName: async function(server, id){
                let result = await knex.select("name").from("ocelotbot_song_guess_playlists").whereIn("server", [server, "global"]).andWhere({id}).orderBy("server").limit(1);
                if(result[0])return result[0]['name'];
                return null;
            },
            getCommandCount: function () {
                return knockroach.select(knex.raw("COUNT(*)")).from("commands");
            },
            createPremiumKey: async function (owner) {
                let id = uuid();
                await knex.insert({id, owner}).into("ocelotbot_premium_keys");
                return id;
            },
            getPremiumKey: function (id) {
                return knex.select().from("ocelotbot_premium_keys").where({id});
            },
            redeemPremiumKey: function (id, server) {
                return knex("ocelotbot_premium_keys").update({server, redeemed: new Date()}).where({id}).limit(1);
            },

            getStreak: async function (user, type) {
                let output = (await knex.select("streak", "started").from("ocelotbot_streaks").where({
                    user,
                    type
                }).limit(1))[0];
                if (output)
                    return output.streak;
                return null;
            },
            setStreak: function (user, type, streak) {
                return knex("ocelotbot_streaks").update({streak}).where({user, type}).limit(1)
            },
            incrementStreak: async function (user, type) {
                let streak = await bot.database.getStreak(user, type);
                if (streak === null)
                    await knex.insert({user, type}).into("ocelotbot_streaks");
                else
                    await bot.database.setStreak(user, type, streak + 1);
                return streak + 1;
            },
            resetStreak: async function (user, type) {
                let streak = await bot.database.getStreak(user, type);
                if (!streak) return 0;
                await knex("ocelotbot_streaks").update({highest: streak, achieved: new Date()}).where({
                    user,
                    type
                }).andWhere("highest", "<", streak).limit(1);
                await bot.database.setStreak(user, type, 0);
                return streak;
            },
            getHighestStreak: async function (user, type) {
                return (await knex.select("highest", "achieved").from("ocelotbot_streaks").where({
                    user,
                    type
                }).limit(1))[0];
            },
            getBirthdays: function (server) {
                return knex.select().from("ocelotbot_birthdays").where({server}).orderByRaw("DATE(birthday), MONTH(birthday)");
            },
            addBirthday: function (user, server, birthday) {
                return knex.insert({user, server, birthday}).into("ocelotbot_birthdays");
            },
            removeBirthday: async function (user, server) {
                return knex.delete().from("ocelotbot_birthdays").where({user, server}).limit(1);
            },
            getBirthday: async function (user, server) {
                let result = await knex.select().from("ocelotbot_birthdays").where({user, server}).limit(1);
                if (result.length === 0)
                    return null;
                return result[0];
            },
            createMusicSession: async function (server, voiceChannel, textChannel) {
                let result = await knex.insert({server, voiceChannel, textChannel}).into("ocelotbot_music_sessions");
                return result[0];
            },
            endMusicSession: function (id) {
                return knex("ocelotbot_music_sessions").update({ended: new Date()}).where({id}).limit(1);
            },
            queueSong: async function (session, uri, requester, next = false) {
                let order = (await knex.select(knex.raw(`${next ? "MIN(\`order\`)-1" : "MAX(\`order\`)+1"} AS 'val'`)).from("ocelotbot_music_queue").where({session}))[0].val || 10;
                console.log("Order", order);
                let result = await knex.insert({session, order, uri, requester}).into("ocelotbot_music_queue");
                return result[0];
            },
            removeSong: async function (id) {
                await knex.delete().from("ocelotbot_music_queue").where({id}).limit(1);
            },
            getActiveSessions: function () {
                return knex.select().from("ocelotbot_music_sessions").whereNull("ended")
            },
            hasActiveSession: async function (server) {
                let result = await knex.select().from("ocelotbot_music_sessions").where({server}).whereNull("ended").limit(1);
                return result.length > 0;
            },
            getQueueForSession: async function (session) {
                return knex.select().from("ocelotbot_music_queue").where({session}).orderByRaw("`order` asc, id asc");
            },
            updateNowPlaying: async function (id, uri) {
                return knex("ocelotbot_music_sessions").update({playing: uri}).where({id}).limit(1);
            },
            updateLastMessage: async function (id, lastMessage) {
                return knex("ocelotbot_music_sessions").update({lastMessage}).where({id}).limit(1);
            },
            clearQueue: function (session) {
                return knex.delete().from("ocelotbot_music_queue").where({session});
            },
            getPreviousQueue: async function (server, currentSession) {
                let q = knex.select("ocelotbot_music_queue.session", "ocelotbot_music_sessions.started", "ocelotbot_music_sessions.ended", knex.raw("COUNT(*) as length")).from("ocelotbot_music_queue")
                    .innerJoin("ocelotbot_music_sessions", "ocelotbot_music_queue.session", "ocelotbot_music_sessions.id")
                    .where({server: server.id})
                    .groupBy("session")
                    .orderBy("started", "desc");

                if (currentSession)
                    q = q.andWhereNot({session: currentSession});

                return q;
            },
            addRoleMessage: async function (channel, message) {
                let existingRole = await knex.select("id").from("ocelotbot_role_messages").where({
                    channel,
                    message
                }).limit(1);
                if (existingRole[0])
                    return [existingRole[0].id];
                return knex.insert({channel, message}).into("ocelotbot_role_messages");
            },
            addRoleButton: function (message, emoji, role) {
                console.log("We got: ", message, emoji, role);
                return knex.insert({message, role, emoji}).into("ocelotbot_role_buttons");
            },
            loadRoleMessagesForShard: function (channels) {
                return knex.select().from("ocelotbot_role_messages").whereIn("channel", channels);
            },
            getButtonsForRoleMessage: function (message) {
                return knex.select().from("ocelotbot_role_buttons").where({message});
            },
            getBirthdaysTodayForShard: function (servers) {
                return knex.select().from("ocelotbot_birthdays").whereIn("server", servers).andWhereRaw("DAY(birthday) = DAY(CURRENT_TIMESTAMP) AND MONTH(birthday) = MONTH(current_timestamp)");
            },
            generateReferralCode: async function (messageID, server, user) {
                let charCodes = [];
                for (let i = 0; i < messageID.length; i += 3) {
                    charCodes.push(messageID[i] + messageID[i + 1] + messageID[i + 3]);
                }
                let id = Buffer.from(charCodes).toString("base64");
                await knex.insert({id, server, user}).into("ocelotbot_referral_codes");
                return id;
            },
            getReferralCount: async function (id) {
                let result = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_referrals").where({id});
                return result[0]['COUNT(*)'];
            },
            getBotlist: async function (id, productID) {
                return (await knex.select().from("ocelotbot_botlists").where({id, productID}).limit(1))[0];
            },
            getBotlistsWithStats: function (productID) {
                return knex.select().from("ocelotbot_botlists").whereNotNull("statsUrl").andWhere({enabled: 1, productID});
            },
            getSingleBotlist: async function(index, productID){
                return (await knex.select().from("ocelotbot_botlists").whereNotNull("statsUrl").andWhere({enabled: 1, productID}).limit(1).offset(index))[0];
            },
            getBotlistsWithVoteRewards: function(productID){
                return knex.select().from("ocelotbot_botlists").whereNotNull("pointsReward").andWhere({enabled: 1, productID}).orderBy("pointsReward", "DESC");
            },
            getBotlistUrl: async function (id, productID) {
                let url = await knex.select("botUrl").from("ocelotbot_botlists").where({id, productID}).orWhere({id: 'topgg'}).limit(1);
                return url[0].botUrl;
            },
            botlistSuccess: function(id, productID){
              return knex("ocelotbot_botlists").update({lastSuccessfulPost: new Date()}).where({id, productID});
            },
            logAiConversation: function (userID, serverID, lastMessageID, message, response) {
                return knex.insert({
                    userID,
                    serverID,
                    lastMessageID,
                    message,
                    response
                }).into("ocelotbot_ai_conversations");
            },
            getAiResponse: async function(message) {
                // Lord Forgive Me
                let result = await knex.raw(`SELECT response, ABS(LENGTH(message)-LENGTH(?)) as 'distance', MATCH(message) AGAINST (? IN NATURAL LANGUAGE MODE) as 'score' FROM ocelotbot_ai_conversations WHERE MATCH(message) AGAINST (? IN NATURAL LANGUAGE MODE) ORDER BY distance, score DESC LIMIT 10`, [message, message, message]);
                if(!result[0] || result[0].length === 0)return null;
                return bot.util.arrayRand(result[0]).response;
            },
            addRecurringReminder: function (receiver, user, server, channel, message, recurrence) {
                return knex(REMINDERS_TABLE).insert({
                    receiver,
                    user,
                    server,
                    channel,
                    message,
                    recurrence: JSON.stringify(recurrence),
                    at: new Date()
                })
            },
            getRecurringRemindersForShard(receiver, servers) {
                return knex.select().from(REMINDERS_TABLE).whereNotNull("recurrence").andWhere({receiver}).whereIn("server", servers);
            },
            getRecurringRemindersForDMs(receiver) {
                return knex.select().from(REMINDERS_TABLE).whereNotNull("recurrence").andWhere({receiver}).whereNull("server");
            },
            async getRecurringReminderCountForChannel(receiver, channel){
                return (await knex.select(knex.raw("COUNT(*) AS count")).from(REMINDERS_TABLE).whereNotNull("recurrence").andWhere({channel}))[0].count;
            },
            async getPoints(user) {
                let result = await knex.select().from("ocelotbot_points").where({user}).limit(1);
                if (result[0])
                    return result[0].points;
                await knex.insert({user, points: 100}).into("ocelotbot_points");
                return 100;
            },
            async addPoints(user, amount, origin) {
                let currentPoints = await bot.database.getPoints(user);
                let newPoints = currentPoints + amount;
                await knex("ocelotbot_points").update({points: newPoints}).where({user}).limit(1);
                await knex.insert({
                    user,
                    amount,
                    origin,
                    balance_before: currentPoints,
                    balance_after: newPoints
                }).into("ocelotbot_points_transactions");
                return newPoints;
            },
            async takePoints(user, amount, origin){
                let currentPoints = await bot.database.getPoints(user);
                let newPoints = currentPoints - amount;
                if(newPoints < 0)return false;
                await knex("ocelotbot_points").update({points: newPoints}).where({user}).limit(1);
                await knex.insert({
                    user,
                    amount:-amount,
                    origin,
                    balance_before: currentPoints,
                    balance_after: newPoints
                }).into("ocelotbot_points_transactions");
                return true;
            },
            getLastPointsTransactions(user){
                return knex.select().from("ocelotbot_points_transactions").where({user}).orderBy("timestamp", "desc").limit(10)
            },
            getPointsChallengeTypes(){
                return knex.select().from("ocelotbot_points_challenge_types");
            },
            getPointsChallengesByType(type){
                const now = new Date();
                return knex.select()
                    .from("ocelotbot_points_challenges")
                    .where("begin", "<=", now)
                    .andWhere("end", ">", now)
                    .andWhere({challenge_type: type});
            },
            getPointsChallenges(){
                const now = new Date();
                return knex.select("begin", "end", "ocelotbot_points_challenges.id", "reward_value", "challenge_value", "desc")
                    .from("ocelotbot_points_challenges")
                    .where("begin", "<=", now)
                    .andWhere("end", ">", now)
                    .innerJoin("ocelotbot_points_challenge_types", "ocelotbot_points_challenges.challenge_type", "ocelotbot_points_challenge_types.id")
            },
            getInProgressChallenges(user, challenges){
                return knex.select().from("ocelotbot_points_challenge_log").whereIn("challenge", challenges).andWhere({user});
            },
            async getChallengeLog(user, challenge){
                return (await knex.select().from("ocelotbot_points_challenge_log").where({user, challenge}).limit(1))[0];
            },
            async addChallengeLog(log){
                return knex.insert(log).into("ocelotbot_points_challenge_log");
            },
            async updateChallengeLog(user, challenge, progress, complete){
                return knex("ocelotbot_points_challenge_log").update({progress, complete}).where({user, challenge})
            },
            async getCustomCommand(server, trigger){
                let result = await knex.select("function").from("ocelotbot_custom_functions").where({server, trigger, type: "COMMAND"}).limit(1);
                return result[0] ? result[0].function : null;
            },
            addCustomFunction(server, name, trigger, type, func, user){
                return knex.insert({server, name, trigger, type, "function": func, user}).into("ocelotbot_custom_functions")
            },
            updateCustomFunction(server, id, code){
                return knex("ocelotbot_custom_functions").update({"function": code}).where({id, server}).limit(1);
            },
            getCustomFunctions(server){
                return knex.select("id", "trigger", "type").from("ocelotbot_custom_functions").where({server}).orderBy("id", "asc");
            },
            getCustomFunction(server, id){
                return knex.select().from("ocelotbot_custom_functions").where({server, id}).limit(1);
            },
            getCustomFunctionByTrigger(server, trigger){
                return knex.select().from("ocelotbot_custom_functions").where({server, trigger});
            },
            deleteCustomFunction(server, id){
                return knex.delete().from("ocelotbot_custom_functions").where({server, id}).limit(1);
            },
            getCustomFunctionsForShard(type, servers) {
                return knex.select().from("ocelotbot_custom_functions").where({type}).whereIn("server", servers)
            },
            async getPublishedFunctionFromOrigin(origin){
                return (await knex.select().from("ocelotbot_published_custom_functions").where({origin}).limit(1))[0];
            },
            async getPublishedFunction(id){
                return (await knex.select().from("ocelotbot_published_custom_functions").where({id}).limit(1))[0]
            },
            createPublishedFunction(id, name, type, code, user, origin){
                return knex.insert({id, name, type, code, user, origin}).into("ocelotbot_published_custom_functions");
            },
            updatePublishedFunction(id, code){
                return knex("ocelotbot_published_custom_functions").update({code}).where({id}).limit(1);
            },
            incrementPublishedFunctionImports(id){
                return knex("ocelotbot_published_custom_functions").increment("imports").where({id}).limit(1);
            },
            createPoll(expires, serverID, channelID, creatorID){
                return knex.insert({expires, serverID, channelID, creatorID}).into("ocelotbot_polls");
            },
            async getPoll(id){
                return (await knex.select().where({id}).from("ocelotbot_polls").limit(1))[0];
            },
            async getPollAnswer(poll, userID, choice){
                if(choice !== undefined)
                    return (await knex.select().where({poll, userID, choice}).from("ocelotbot_poll_answers").limit(1))[0];
                return (await knex.select().where({poll, userID}).from("ocelotbot_poll_answers").limit(1))[0];
            },
            async getUniquePollRespondents(poll){
                return (await knex.select(knex.raw("COUNT(DISTINCT userID) as count")).from("ocelotbot_poll_answers").where({poll}))[0].count;
            },
            async getPollAnswers(poll){
                return (await knex.select("choice", knex.raw("COUNT(*) as count")).from("ocelotbot_poll_answers").where({poll}).groupBy("choice"))
                    .reduce((o,a)=>{o[a.choice]=a.count;return o;},{});
            },
            async getAllPollAnswers(poll){
                return knex.select().from("ocelotbot_poll_answers").where({poll}).orderBy("choice");
            },
            async setPollAnswer(poll, userID, choice){
                let currentAnswer = await bot.database.getPollAnswer(poll, userID);
                if(!currentAnswer)
                    return knex.insert({poll, userID, choice}).into("ocelotbot_poll_answers");
                return knex("ocelotbot_poll_answers").update({choice}).where({poll, userID});
            },
            async deletePollAnswers(poll){
                return knex("ocelotbot_poll_answers").delete().where({poll});
            },
            async togglePollAnswer(poll, userID, choice){
                let currentAnswer = await bot.database.getPollAnswer(poll, userID, choice);
                if(!currentAnswer){
                    await knex.insert({poll, userID, choice}).into("ocelotbot_poll_answers");
                    return true;
                }
                await knex.delete().from("ocelotbot_poll_answers").where({poll, userID, choice}).limit(1);
                return false;
            },
            getExpiredPolls(servers){
                return knex.select().from("ocelotbot_polls").whereIn("serverID", servers).whereNotNull("expires").andWhere("expires", "<", new Date());
            },
            deleteExpiredPolls(servers){
                return knex.delete().from("ocelotbot_polls").whereIn("serverID", servers).whereNotNull("expires").andWhere("expires", "<", new Date());
            },
            deletePoll(serverID, id){
                return knex.delete().from("ocelotbot_polls").where({serverID, id}).limit(1);
            },
            updatePoll(serverID, id, update){
                return knex("ocelotbot_polls").update(update).where({serverID, id}).limit(1);
            },
            addCountdown(id, serverID, userID, target, message){
                return knex.insert({id, serverID, userID, target, message}).into("ocelotbot_countdowns");
            },
            deleteCountdown(id, serverID, userID){
                return knex.delete().from("ocelotbot_countdowns").where({id, serverID, userID}).limit(1);
            },
            async getCountdown(id, serverID){
                return (await knex.select().from("ocelotbot_countdowns").where({id, serverID}).limit(1))[0];
            },
            getCountdownsForServer(serverID){
                return knex.select().from("ocelotbot_countdowns").where({serverID});
            },
            createEvent(serverID, channelID, ownerID, name, starts){
                return knex.insert({serverID, channelID, ownerID, name, starts}).into("ocelotbot_events");
            },
            getEventsForServer(serverID){
                return knex.select().from("ocelotbot_events").where("starts", ">", new Date()).andWhere({serverID}).orderBy("starts", "ASC");
            },
            getEventsForUser(serverID, userID){
                return knex.select().from("ocelotbot_events_users").where({userID, serverID}).innerJoin("ocelotbot_events", "eventID", "id");
            },
            async getUserResponse(userID, eventID){
                return (await knex.select().from("ocelotbot_events_users").where({eventID, userID}).limit(1))[0];
            },
            addUserResponse(userID, eventID, status){
                return knex.insert({userID, eventID, status}).into("ocelotbot_events_users");
            },
            updateUserResponse(userID, eventID, status){
                return knex("ocelotbot_events_users").update({status}).where({userID, eventID}).limit(1);
            },
            getResponseCounts(eventID){
                return knex.select("status", knex.raw("count(*) as count")).from("ocelotbot_events_users").where({eventID}).groupBy("status")
            },
            incrementStat(serverid, userid, statistic, value = 1){
                return knockroach.insert({serverid, userid, statistic, value})
                    .into("statistics")
                    .onConflict(["serverid", "userid", "statistic"])
                    .merge({value: knex.raw("statistics.value + excluded.value")});
            },
            async logFailure(type, item, reason, serverid, userid, channelid){
                await knockroach.insert({type, item, reason, serverid, userid, channelid}).into("failures");
                return bot.database.getFailureCount(type, item);

            },
            async getFailureCount(type, item){
                  let result = await knockroach.select(knex.raw("COUNT(*) as count")).from("failures").where({type, item});
                  return result[0]?.count || 0;
            },
            async getDailyPoll(rowid){
                let query = knockroach.select("daily_poll_options.rowid","*").from("daily_polls")
                    .innerJoin("daily_poll_options", "daily_polls.rowid", "daily_poll_options.poll");
                if(rowid)
                    query = query.where("daily_polls.rowid", "=", rowid);
                else
                    query = query.whereRaw("date = CURRENT_DATE")
                const result = await query;

                if(!result || result.length === 0)return null;
                return {
                    id: result[0].poll,
                    title: result[0].title,
                    multiple: result[0].multiple,
                    options: result.map((d)=>({name: d.name, id: d.rowid}))
                };
            },
            async getDailyPollAnswers(poll){
                let result = await knockroach("daily_poll_answers").select(knex.raw("COUNT(*)"), "option").where({poll}).groupBy("option")
                return result.reduce((acc, r)=>{acc[r.option] = parseInt(r.count);return acc;}, {})
            },
            async logDailyPollAnswer(user, poll, option){
                await knockroach("daily_poll_answers").delete().where({user, poll}).limit(1);
                return knockroach.insert({user, poll, option}).into("daily_poll_answers");
            },
            async getNextEmptyPollDate(){
                let result = await knockroach.select(knex.raw("MAX(date)")).from("daily_polls");
                if(!result[0]?.max)return new Date();
                result[0].max.setDate(result[0].max.getDate()+1);
                return result[0].max;
            },
            async createDailyPoll(date, title, options){
              const [{rowid}] = await knockroach.insert({date, title}).into("daily_polls").returning("rowid");
              return knockroach.insert(options.map((o)=>({poll: rowid, name: o}))).into("daily_poll_options")
            },
            /**
             *
             * @returns {Promise<{rowid: string, claimable_after: Date, claimed_userid: string | undefined, claimed_at: Date | undefined, messageid: string | undefined, guildid: string | undefined}>}
             */
            async getNextEasterEgg(){
                const [egg] = await knockroach.select("rowid", "*").from("easter_eggs").whereNull("messageid").orderBy("claimable_after", "ASC").limit(1);
                return egg;
            },
            /**
             *
             * @returns {Promise<{rowid: string, claimable_after: Date, claimed_userid: string | undefined, claimed_at: Date | undefined, messageid: string | undefined, guildid: string | undefined}>}
             */
            async getEgg(rowid){
                const [egg] = await knockroach.select("rowid", "*").from("easter_eggs").where({rowid}).limit(1);
                return egg;
            },
            async setEggMessageId(rowid, messageid, guildid) {
                return knockroach("easter_eggs").update({messageid, guildid, released_at: new Date()}).andWhere({rowid}).whereNull("messageid").limit(1);
            },
            async setEggClaimed(rowid, guildid, claimed_userid){
                return knockroach("easter_eggs").update({claimed_userid, claimed_at: new Date()}).where({rowid, guildid}).limit(1);
            },
            async getEggStats(serverid = "all"){
                let leaderboard = await knockroach.select("userid", "value").from("statistics").where({statistic: "eggs_claimed", serverid}).andWhereNot({userid: "all"}).orderBy("value", "DESC");
                let statsRows = await knockroach.select("userid", "serverid", "value").from("statistics").whereIn("serverid", ["all", serverid]).andWhere({statistic: "eggs_claimed", userid: "all"});
                let totalStats = statsRows.reduce((o, r)=>{o[r.serverid] = r.value; return o;}, {});
                return {leaderboard, totalStats}
            },
            /**
             *
             * @param userid {string}
             * @returns {Promise<number>}
             */
            async getEggCount(userid) {
                  let rows = await knockroach.select("value").from("statistics").where({statistic: "eggs_claimed", userid}).limit(1);
                  return parseInt(rows[0]?.value) || 0;
            },
            // This should probably be a worker
            async dataExport(userID){
                bot.logger.log("Starting data export...");
                bot.logger.log("Exporting Commands...");
                let commands = await knockroach.select().from("commands").where({userid: userID});
                bot.logger.log("Exporting AI Conversations...");
                let aiConversations = await knex.select().from("ocelotbot_ai_conversations").where({userID});
                bot.logger.log("Exporting Audit Logs...");
                let audit = await knex.select().from("ocelotbot_audit_log").where({user: userID});
                bot.logger.log("Exporting Badge Assignments...");
                let badgeAssignments = await knockroach.select().from("badge_assignments").where({user: userID});
                bot.logger.log("Exporting Birthdays...");
                let birthdays = await knex.select().from("ocelotbot_birthdays").where({user: userID});
                bot.logger.log("Exporting Functions...");
                let functions = await knex.select().from("ocelotbot_custom_functions").where({user: userID});
                bot.logger.log("Exporting Published Functions...");
                let publishedFunctions = await knex.select().from("ocelotbot_published_custom_functions").where({user: userID});
                bot.logger.log("Exporting Points...");
                let points = await knex.select().from("ocelotbot_points").where({user: userID});
                bot.logger.log("Exporting Points Transactions...");
                let pointsTransactions = await knex.select().from("ocelotbot_points_transactions").where({user: userID});
                bot.logger.log("Exporting Poll Answers...");
                let pollAnswers = await knex.select().from("ocelotbot_poll_answers").where({userID});
                bot.logger.log("Exporting Polls...");
                let polls = await knex.select().from("ocelotbot_polls").where({creatorID: userID});
                bot.logger.log("Exporting Premium Keys...");
                let premiumKeys = await knex.select().from("ocelotbot_premium_keys").where({owner: userID});
                bot.logger.log("Exporting Profile...");
                let profile = await knex.select().from("ocelotbot_profile").where({id: userID});
                bot.logger.log("Exporting Referral Codes...");
                let referralCodes = await knex.select().from("ocelotbot_referral_codes").where({user: userID});
                bot.logger.log("Exporting Reminders...");
                let reminders = await knex.select().from("ocelotbot_reminders").where({user: userID});
                bot.logger.log("Exporting Servers...");
                let servers = await knex.select().from("ocelotbot_servers").where({owner: userID});
                bot.logger.log("Exporting Guesses...");
                let guesses = await knex.select().from("ocelotbot_song_guess").where({user: userID});
                bot.logger.log("Exporting Guess Records...");
                let guessRecords = await knex.select().from("ocelotbot_song_guess_records").where({user: userID});
                //bot.logger.log("Exporting Spook Roles...");
                //let spookRoles = await knex.select().from("ocelotbot_spook_role_assignments").where({user: userID});
                //bot.logger.log("Exporting Spooks...")
                //let spooks = await knockroach.select().from("ocelotbot_spooks").where({spooker: userID}).orWhere({spooked: userID});
                bot.logger.log("Exporting Streaks...");
                let streaks = await knex.select().from("ocelotbot_streaks").where({user: userID});
                bot.logger.log("Exporting Subscriptions...");
                let subscriptions = await knex.select().from("ocelotbot_subscriptions").where({user: userID});
                bot.logger.log("Exporting Settings...");
                let settings = await knex.select().from("ocelotbot_user_settings").where({user: userID});
                bot.logger.log("Exporting Votes...");
                let votes = await knex.select().from("ocelotbot_votes").where({user: userID});
                bot.logger.log("Exporting Trivia...");
                let trivia = await knex.select().from("trivia").where({user: userID});
                return {
                    commands,
                    aiConversations,
                    audit,
                    badgeAssignments,
                    birthdays,
                    functions,
                    publishedFunctions,
                    points,
                    pointsTransactions,
                    pollAnswers,
                    polls,
                    premiumKeys,
                    profile,
                    referralCodes,
                    reminders,
                    servers,
                    guesses,
                    guessRecords,
                    //spookRoles,
                    //spooks,
                    streaks,
                    subscriptions,
                    settings,
                    votes,
                    trivia,
                }
            }

        };
    },
    getBestHost: function getBestHost(){
        // If the preferred host is available, use that
        if(process.env.DOCKER_HOST && cockroachConfig.hosts[process.env.DOCKER_HOST] && isHostAvailable(cockroachConfig.hosts[process.env.DOCKER_HOST])){
            return cockroachConfig.hosts[process.env.DOCKER_HOST]
        }
        // Return the first available host
        return Object.values(cockroachConfig.hosts).find(isHostAvailable);
    },
    initMonitoring: function initMonitoring(bot){
        const pool = knockroach.context.client.pool;
        pool.on("acquireRequest", (ev)=>{
            bot.stats.cockroachPoolRequests++;
        });

        pool.on("acquireSuccess", (ev)=>{
            bot.stats.cockroachPoolSuccesses++;
            const currentHost = knockroach.context.client.connectionSettings.host;
            bot.database.cockroachUnavailable = false;
            delete unavailableHosts[currentHost];
        });

        pool.on("acquireFail", (ev, err)=>{
            bot.stats.cockroachPoolFailures++;
            const currentHost = knockroach.context.client.connectionSettings.host;
            bot.logger.warn(`Marking ${currentHost} as unavailable for 5 minutes`);
            unavailableHosts[currentHost] = new Date()+300000;
            const newHost = this.getBestHost();
            if(!newHost) {
                bot.logger.error(`No hosts were available! Bad!!`);
                // bot.database.cockroachUnavailable = true;
                unavailableHosts = [];
                return;
            }
            bot.logger.warn(`Switching to ${newHost}...`);
            knockroach.context.client.connectionSettings.host = newHost;
        });
    }
};