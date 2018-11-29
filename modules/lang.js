const fs = require('fs');
const config = require('config');
const request = require('request');
module.exports = {
    name: "Internationalisation",
    init: async function(bot){
        bot.lang = {};


        bot.lang.loadLanguages = async function loadLanguages(){
            const languages = await bot.database.getLanguageList();
            const langKeys = await bot.database.getAllLanguageKeys();
            bot.logger.log(`Loaded ${languages.length} languages and ${langKeys.length} keys`);
            let newStrings = {};
            for(let i = 0; i < languages.length; i++){
                const lang = languages[i];
                newStrings[lang.code] = {
                    "LANGUAGE_NAME": lang.name,
                    "LANGUAGE_FLAG": lang.flag
                };
            }
            for(let j = 0; j < langKeys.length; j++){
                const row = langKeys[j];
                if(newStrings[row.lang]){
                    newStrings[row.lang][row.key] = row.message;
                }else {
                    bot.logger.warn(`${row.key} assigned to missing language ${row.lang}`);
                }
            }
            newStrings.default = newStrings['en-gb'];
            bot.lang.strings = newStrings;

        };

        bot.lang.getTranslation = function getTranslation(server, key, format = {}){
            return new Promise(async function(fulfill){
                format.prefix = "\\"+(this.guild && bot.prefixCache[this.guild.id] || config.get("General.DefaultPrefix"));
                let output = bot.lang.getTranslationFor(await bot.lang.getLocale(server), key);
                fulfill(format ? output.formatUnicorn(format) : output)
            });
        };

        bot.lang.getLocalNumber = function getLocalNumber(server, number){
            return new Promise(async function(fulfill){
                fulfill(number.toLocaleString(await bot.lang.getLocale(server)))
            });
        };

        bot.lang.getLocalDate = function getLocalDate(server, date){
            return new Promise(async function(fulfill){
                fulfill(date.toLocaleString(await bot.lang.getLocale(server)))
            });
        };

        bot.lang.getLocale = function getLocale(server){
            return new Promise(async function(fulfill){
                if(!bot.lang.languageCache[server]){
                    bot.logger.warn("Had to populate languageCache for "+server);
                    const thisServer = await bot.database.getServerLanguage(server)[0];
                    bot.lang.languageCache[server] = thisServer && thisServer.language ? thisServer.language : "default";
                }
                fulfill(bot.lang.languageCache[server]);
            });
        };

        bot.lang.getTranslationFor = function getTranslationFor(lang, key){
            if(bot.lang.strings[lang] && bot.lang.strings[lang][key]){
                return bot.lang.strings[lang][key];
            }else if(bot.lang.strings.default[key]){
                return bot.lang.strings.default[key];
            }else{
                bot.logger.warn("Tried to translate unknown key: "+key);
                return key;
            }
        };
        //bot.lang.downloadLanguages();

        bot.lang.languageCache = {};

        bot.lang.loadLanguages();

        bot.client.on("ready", async function discordReady(){
            bot.logger.log("Populating language cache...");
            const languageMap = await bot.database.getLanguagesForShard(bot.client.guilds.keyArray());
            bot.logger.log(`Caching ${languageMap.length} servers`);
            for(let i = 0; i < languageMap.length; i++){
                const server = languageMap[i];
                bot.lang.languageCache[server.server] = server.language;
            }
        });
    }
};