const fs = require('fs');
const config = require('config');
const request = require('request');


module.exports = {
    name: "Internationalisation",
    init: async function init(bot){
        bot.lang = {};


        bot.lang.downloadLanguages = function(){
            const languageKey = config.get("Lang.key");
            request.post({
                url: "https://api.poeditor.com/v2/languages/list",
                form: {
                    api_token: languageKey,
                    id: 124405
                },
                json: true
            }, function (err, resp, body) {
                const langs = body.result.languages;
                for(let i = 0; i < langs.length; i++){
                    bot.lang._downloadLanguage(langs[i].code, langs[i].name, languageKey);
                }
            });
        };

        bot.lang._downloadLanguage = function downloadLanguage(code, name, languageKey){
            bot.logger.log("Downloading "+code);
            request.post({
                url: "https://api.poeditor.com/v2/terms/list",
                form: {
                    api_token: languageKey,
                    id: 124405,
                    language: code
                },
                json: true
            }, function (err, resp, body) {
                let output = {};
                if(body.result) {
                    const terms = body.result.terms;
                    output["LANGUAGE_NAME"] = name;
                    output["LANGUAGE_FLAG"] = `:flag_${code}:`;
                    for (let i = 0; i < terms.length; i++) {
                        const term = terms[i];
                        if (term.translation.content && term.translation.content.length > 0)
                            output[term.term] = term.translation.content;
                    }
                    fs.writeFile(`lang/${code}.json`, JSON.stringify(output), function writeLanguage(err) {
                        if (err) {
                            bot.logger.error("Error downloading " + code);
                            console.log(err);
                        } else
                            bot.logger.log("Downloaded " + code);
                    })
                }else{
                    console.log(body);
                }
            });
        };

        bot.lang.loadLanguages = function loadLanguages(){
            bot.logger.log("Loading language packs...");
            const languages = config.get("Lang.Languages");
            bot.lang.strings = {};
            for(let i in languages){
                if(languages.hasOwnProperty(i)){
                    fs.readFile(__dirname+"/../lang/"+languages[i], function (err, data){
                        bot.raven.context(function readLang(){
                            if(err){
                                bot.raven.captureException(err);
                                bot.logger.error(`Error loading language ${languages[i]}: ${err}`);
                            }else{
                                try{
                                    bot.lang.strings[i] = JSON.parse(data);
                                    bot.logger.log(`Loaded language ${bot.lang.strings[i].LANGUAGE_NAME} as ${i}`);
                                }catch(e){
                                    bot.raven.captureException(e);
                                    bot.logger.error(`Language ${languages[i]} is malformed: ${e}`);
                                }
                            }
                        });
                    });
                }
            }
        };

        bot.lang.getTranslation = function getTranslation(server, key, format){
            return new Promise(async function(fulfill){
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

        bot.logger.log("Populating Language Cache...");

        try{
            const serverLanguages = await bot.database.getLanguages();
            for(let j = 0; j < serverLanguages.length; j++){
                bot.lang.languageCache[serverLanguages[j].server] = serverLanguages[j].language;
            }
            bot.logger.log(`Populated language cache with ${Object.keys(bot.lang.languageCache).length} servers.`);
        }catch(e){
            bot.logger.error("Error populating language cache:");
            bot.logger.error(""+e.stack);
        }

    }
};