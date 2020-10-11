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
                        "LANGUAGE_FLAG": lang.flag,
                        "LANGUAGE_HIDDEN": lang.hidden,
                        "LANGUAGE_GENERATED": lang.generate
                    };
            }
            for(let j = 0; j < langKeys.length; j++){
                const row = langKeys[j];
                if(newStrings[row.lang]['LANGUAGE_GENERATED'])continue;
                if(newStrings[row.lang]){
                    newStrings[row.lang][row.key] = row.message;
                }else {
                    bot.logger.warn(`${row.key} assigned to missing language ${row.lang}`);
                }
            }
            newStrings.default = newStrings['en-gb'];
            bot.lang.strings = newStrings;

        };


        bot.lang.getForMessage = async function (message, key, format = {}){
            return bot.lang.getTranslation(message.guild ? message.guild.id : "global", key, format, message.author ? message.author.id : null);
        }

        bot.lang.getTranslation = function getTranslation(server, key, format = {}, author){
            return new Promise(async function(fulfill){
                let span = bot.util.startSpan("Get Translation "+key);
                format.prefix = bot.config.get(server, "prefix", author);
                format.botName = bot.client.user.username;
                const langOverride = bot.config.get(server, "lang."+key, author);

                if(bot.config.getBool(server, "lang.debug", author)) {
                    span.end();
                    return fulfill(`${key}: \`${JSON.stringify(format)}\` ${langOverride ? "OVERRIDDEN '" + langOverride + "'" : ""}`);
                }

                if(langOverride){
                    span.end();
                    fulfill(langOverride.formatUnicorn(format));
                }else{
                    const lang = bot.lang.getLocale(server, author);
                    let output = bot.lang.getTranslationFor(lang, key);
                    let formattedString = output.formatUnicorn(format);
                    if(bot.lang.strings[lang] && bot.lang.strings[lang]["LANGUAGE_GENERATED"]) {
                        span.end();
                        return fulfill(bot.lang.langGenerators[lang](formattedString));
                    }
                    span.end();
                    fulfill(formattedString);
                }
            });
        };

        bot.lang.getLocalNumber = function getLocalNumber(server, number){
            return new Promise(async function(fulfill){
                fulfill(number.toLocaleString(bot.lang.getLocale(server)))
            });
        };

        bot.lang.getLocalDate = function getLocalDate(server, date){
            return new Promise(async function(fulfill){
                fulfill(date.toLocaleString(bot.lang.getLocale(server)))
            });
        };

        bot.lang.getLocale = function getLocale(server, user){
            return bot.config.get(server, "lang", user);
        };

        bot.lang.getTranslationFor = function getTranslationFor(lang, key){
            if(bot.lang.strings[lang] && bot.lang.strings[lang][key]){
                return bot.lang.strings[lang][key];
            }else if(bot.lang.strings.default[key]){
                return bot.lang.strings.default[key];
            }else{
                bot.logger.warn("Tried to translate unknown key: "+key);
                bot.client.shard.send({type: "warning", payload: {
                        id: "langKey-"+key,
                        message: `Tried to translate unknown lang key ${key}`
                }});
                return key;
            }
        };
        //bot.lang.downloadLanguages();

        bot.lang.languageCache = {};

        bot.lang.loadLanguages();

        bot.lang.langGenerators = {
          "en-owo": function(input){
              if(input.indexOf("http") > -1 || input.indexOf("```") > -1)return input; //Can't be fucked dealing with trying to fix this
              input = input.replace(/[rl]/g, "w");
              input = input.replace(/[RL]/g, "W");
              input = input.replace(/n([aeiou])/g, 'ny$1');
              input = input.replace(/N([aeiou])/g, 'Ny$1');
              input = input.replace(/N([AEIOU])/g, 'Ny$1');
              input = input.replace(/([cv])([aeiou])/g, '$1w$2');
              input = input.replace(/ove/g, "uv");
              input = input.replace(/:(.*?):/g, "<:cuteanimegrill:452909779480870922>"); //Sometimes the best solutions are the easiest ones.
              return input;
          }
        };




        // bot.client.on("ready", async function discordReady(){
        //     bot.logger.log("Populating language cache...");
        //     const languageMap = await bot.database.getLanguagesForShard(bot.client.guilds.cache.keyArray());
        //     bot.logger.log(`Caching ${languageMap.length} servers`);
        //     for(let i = 0; i < languageMap.length; i++){
        //         const server = languageMap[i];
        //         bot.lang.languageCache[server.server] = server.language;
        //     }
        // });
    }
};