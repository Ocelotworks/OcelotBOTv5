const Strings = require("../util/String");
module.exports = class Lang {
    name = "Internationalisation";
    bot;
    strings = {};
    langGenerators = {
        "en-owo": function (input) {
            if (input.indexOf("http") > -1 || input.indexOf("```") > -1) return input; //Can't be fucked dealing with trying to fix this
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
    }

    constructor(bot){
        this.bot = bot;
        bot.lang = this;
    }

    init(){
        this.loadLanguages();
    }

    async loadLanguages() {
        const languages = await this.bot.database.getLanguageList();
        const langKeys = await this.bot.database.getAllLanguageKeys();
        this.bot.logger.log(`Loaded ${languages.length} languages and ${langKeys.length} keys`);
        let newStrings = {};
        for (let i = 0; i < languages.length; i++) {
            const lang = languages[i];
            newStrings[lang.code] = {
                "LANGUAGE_NAME": lang.name,
                "LANGUAGE_FLAG": lang.flag,
                "LANGUAGE_HIDDEN": lang.hidden,
                "LANGUAGE_GENERATED": lang.generate
            };
        }
        for (let j = 0; j < langKeys.length; j++) {
            const row = langKeys[j];
            if (newStrings[row.lang]['LANGUAGE_GENERATED']) continue;
            if (newStrings[row.lang]) {
                newStrings[row.lang][row.key] = row.message;
            } else {
                this.bot.logger.warn(`${row.key} assigned to missing language ${row.lang}`);
            }
        }
        newStrings.default = newStrings['en-gb'];
        this.strings = newStrings;
    }

    getForContext(context, key, format = {}) {
        format.command = context.command;
        format.commandWithPrefix = `${context.getSetting("prefix")}${context.command}`;
        format.fullCommandWithPrefix = format.commandWithPrefix;
        if(context.options.command)
            format.fullCommandWithPrefix += ` ${context.options.command}`
        format.options = context.options;
        format.locale = context.getSetting("lang");
        //format.timezone = context.getSetting("time.zone"); // TODO: Convert timezones
        return this.getTranslation(context.guild?.id || "global", key, format, context.user?.id);
    }

    /**
     * @deprecated Use getForContext
     * @param message
     * @param key
     * @param format
     * @returns {*}
     */
    getForMessage(message, key, format = {}) {
        return this.getForContext(message, key, format);
    }

    getTranslation(server, key, format = {}, author) {
        format.prefix = this.bot.config.get(server, "prefix", author);
        format.botName = this.bot.client.user.username;
        const langOverride = this.bot.config.get(server, "lang." + key, author);

        if (this.bot.config.getBool(server, "lang.debug", author)) {
            return `${key}: \`${JSON.stringify(format)}\` ${langOverride ? "OVERRIDDEN '" + langOverride + "'" : ""}`;
        }

        if (langOverride) {
            return Strings.Format(langOverride, format);
        } else {
            const lang = this.bot.lang.getLocale(server, author);
            let output = this.bot.lang.getTranslationFor(lang, key);
            let formattedString = Strings.Format(output, format);
            if (this.strings[lang] && this.strings[lang]["LANGUAGE_GENERATED"]) {
                return this.langGenerators[lang](formattedString);
            }
            return formattedString;
        }
    }

    getLocale(server, user) {
        return this.bot.config.get(server, "lang", user);
    }

    getLocalNumber(server, number, user) {
        return number.toLocaleString(this.getLocale(server, user));
    }

    getLocalDate(server, date, user) {
        return date.toLocaleString(this.getLocale(server, user))
    }

    getTranslationFor(lang, key) {
        if(!this.strings){
            try {
                this.bot.logger.log("Languages are not loaded for some reason!");
                this.loadLanguages();
            }catch(e){
                this.bot.logger.log(e);
                this.bot.raven.captureException(e);
            }
            return key;
        }
        if (this.strings[lang] && this.strings[lang][key]) {
            return this.strings[lang][key];
        } else if (this.strings.default[key]) {
            return this.strings.default[key];
        } else {
            this.bot.logger.warn("Tried to translate unknown key: " + key);
            this.bot.rabbit.event({
                type: "warning", payload: {
                    id: "langKey-" + key,
                    message: `Tried to translate unknown lang key ${key}`
                }
            });
            return key;
        }
    }
}