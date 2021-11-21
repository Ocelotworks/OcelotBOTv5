const twemoji = require('twemoji-parser');
const Icons = require('./Icon')
module.exports = class Strings {
    static Vowels = ["a", "e", "i", "o", "u",
        "ａ", "ｅ", "ｉ", "ｏ", "ｕ",
        "Ａ", "Ｅ", "Ｉ", "Ｏ", "Ｕ",
        "𝕒", "𝕖", "𝕚", "𝕠", "𝕦",
        "ⓐ", "ⓔ", "ⓘ", "ⓞ", "ⓤ",
        "🅐", "🅔", "🅘", "🅞", "🅤",
        "𝐚", "𝐞", "𝐢", "𝐨", "𝐮",
        "𝖆", "𝖊", "𝖎", "𝖔", "𝖚",
        "𝒂", "𝒆", "𝒊", "𝒐", "𝒖",
        "𝓪", "𝓮", "𝓲", "𝓸", "𝓾",
        "𝖺", "𝖾", "𝗂", "𝗈", "𝗎",
        "𝗮", "𝗲", "𝗶", "𝗼", "𝘂",
        "𝙖", "𝙚", "𝙞", "𝙤", "𝙪",
        "𝘢", "𝘦", "𝘪", "𝘰", "𝘶",
        "⒜", "⒠", "⒤", "⒪", "⒰",
        "🇦", "🇪", "🇮", "🇴", "🇺",
        "🄰", "🄴", "🄸", "🄾", "🅄",
        "🅰", "🅴", "🅸", "🅾", "🆄",
        "A", "ɘ", "i", "o", "U",
        "о"
    ]
    static Months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
    static Bools = {
        "true": true,
        "false": false,
        "1": true,
        "0": false,
        "on": true,
        "off": false,
        "yes": true,
        "no": false,
        "allowed": true,
        "disallowed": false
    }
    static Permissions = {
        ADMINISTRATOR: "Administrator",
        CREATE_INSTANT_INVITE: "Create Instant Invite",
        KICK_MEMBERS: "Kick Members",
        BAN_MEMBERS: "Ban Members",
        MANAGE_CHANNELS: "Manage Channels",
        MANAGE_GUILD: "Manage Server",
        ADD_REACTIONS: "Add Reactions",
        VIEW_AUDIT_LOG: "View Audit Log",
        PRIORITY_SPEAKER: "Priority Speaker",
        VIEW_CHANNEL: "Read Messages",
        READ_MESSAGES: "Read Messages",
        SEND_MESSAGES: "Send Messages",
        SEND_TTS_MESSAGES: "Send TTS",
        MANAGE_MESSAGES: "Manage Messages",
        EMBED_LINKS: "Embed Links",
        ATTACH_FILES: "Attach Files",
        READ_MESSAGE_HISTORY: "Read Message History",
        MENTION_EVERYONE: "Mention Everyone",
        USE_EXTERNAL_EMOJIS: "Use External Emojis",
        CONNECT: "Connect to Voice Channel",
        SPEAK: "Speak in Voice Channels",
        MUTE_MEMBERS: "Mute Members in Voice Channels",
        DEAFEN_MEMBERS: "Deafen Members in Voice Channels",
        MOVE_MEMBERS: "Move Members in Voice Channels",
        USE_VAD: "Use Voice Activity",
        CHANGE_NICKNAME: "Change Nickname",
        MANAGE_NICKNAMES: "Manage Nicknames",
        MANAGE_ROLES_OR_PERMISSIONS: "Manage Roles",
        MANAGE_WEBHOOKS: "Manage Webhooks",
        MANAGE_EMOJIS: "Manage Emojis And Stickers",
        MANAGE_EMOJIS_AND_STICKERS: "Manage Emojis And Stickers",
        USE_APPLICATION_COMMANDS: "Use Slash Commands",
        REQUEST_TO_SPEAK: "Request to Speak",
        MANAGE_THREADS: "Manage Threads",
        USE_PUBLIC_THREADS: "Use Public Threads",
        USE_PRIVATE_THREADS: "Use Private Threads",
        USE_EXTERNAL_STICKERS: "Use External Stickers",
    }
    static Timezones = {
        ACDT: "10.5",
        ACST: "09.5",
        ACT: "-05",
        ACWST: "08.75",
        ADT: "-03",
        AEDT: "11",
        AEST: "10",
        AFT: "04.5",
        AKDT: "-08",
        AKST: "-09",
        AMST: "-03",
        AMT: "-04",
        ART: "-03",
        AST: "03",
        AWST: "08",
        AZOST: "0",
        AZOT: "-01",
        AZT: "04",
        BDT: "08",
        BIOT: "06",
        BIT: "-12",
        BOT: "-04",
        BRST: "-02",
        BRT: "-03",
        BST: "06",
        BTT: "06",
        CAT: "02",
        CCT: "06.5",
        CDT: "-05",
        CEST: "02",
        CET: "01",
        CHADT: "13.75",
        CHAST: "12.75",
        CHOT: "08",
        CHOST: "09",
        CHST: "10",
        CHUT: "10",
        CIST: "-08",
        CIT: "08",
        CKT: "-10",
        CLST: "-03",
        CLT: "-04",
        COST: "-04",
        COT: "-05",
        CST: "-06",
        CT: "08",
        CVT: "-01",
        CWST: "08.75",
        CXT: "07",
        DAVT: "07",
        DDUT: "10",
        DFT: "01",
        EASST: "-05",
        EAST: "-06",
        EAT: "03",
        ECT: "-04",
        EDT: "-04",
        EEST: "03",
        EET: "02",
        EGST: "0",
        EGT: "-01",
        EIT: "09",
        EST: "-05",
        FET: "03",
        FJT: "12",
        FKST: "-03",
        FKT: "-04",
        FNT: "-02",
        GALT: "-06",
        GAMT: "-09",
        GET: "04",
        GFT: "-03",
        GILT: "12",
        GIT: "-09",
        GMT: "00",
        GST: "-02",
        GYT: "-04",
        HDT: "-09",
        HAEC: "02",
        HST: "-10",
        HKT: "08",
        HMT: "05",
        HOVST: "08",
        HOVT: "07",
        ICT: "07",
        IDLW: "-12",
        IDT: "03",
        IOT: "03",
        IRDT: "04.5",
        IRKT: "08",
        IRST: "03.5",
        IST: "05.5",
        JST: "09",
        KGT: "06",
        KOST: "11",
        KRAT: "07",
        KST: "09",
        LHST: "10.5",
        LINT: "14",
        MAGT: "12",
        MART: "-09.5",
        MAWT: "05",
        MDT: "-06",
        MET: "01",
        MEST: "02",
        MHT: "12",
        MIST: "11",
        MIT: "-09.5",
        MMT: "06.5",
        MSK: "03",
        MST: "08",
        MUT: "04",
        MVT: "05",
        MYT: "08",
        NCT: "11",
        NDT: "-02.5",
        NFT: "11",
        NPT: "05.75",
        NST: "-03.5",
        NT: "-03.5",
        NUT: "-11",
        NZDT: "13",
        NZST: "12",
        OMST: "06",
        ORAT: "05",
        PDT: "-07",
        PET: "-05",
        PETT: "12",
        PGT: "10",
        PHOT: "13",
        PHT: "08",
        PKT: "05",
        PMDT: "-02",
        PMST: "-03",
        PONT: "11",
        PST: "-08",
        PYST: "-03",
        PYT: "-04",
        RET: "04",
        ROTT: "-03",
        SAKT: "11",
        SAMT: "04",
        SAST: "02",
        SBT: "11",
        SCT: "04",
        SDT: "-10",
        SGT: "08",
        SLST: "05.5",
        SRET: "11",
        SRT: "-03",
        SST: "-11",
        SYOT: "03",
        TAHT: "-10",
        THA: "07",
        TFT: "05",
        TJT: "05",
        TKT: "13",
        TLT: "09",
        TMT: "05",
        TRT: "03",
        TOT: "13",
        TVT: "12",
        ULAST: "09",
        ULAT: "08",
        USZ1: "02",
        UYST: "-02",
        UYT: "-03",
        UZT: "05",
        VET: "-04",
        VLAT: "10",
        VOLT: "04",
        VOST: "06",
        VUT: "11",
        WAKT: "12",
        WAST: "02",
        WAT: "01",
        WEST: "01",
        WIT: "07",
        WST: "08",
        YAKT: "09",
        YEKT: "05"
    };
    static TimezoneRegex = /(UTC|GMT)([+\-][0-9]+)/i;

    /**
     * Parse a timezone until a GMT offset
     * @param {number} tz Timezone
     * @returns {number} GMT Offset
     * @constructor
     */
    static ParseTimeZone(tz){
        if (String.Timezones[tz])
            return parseInt(String.Timezones[tz]);
        const regexMatch = String.TimezoneRegex.exec(tz);
        if (regexMatch)
            return parseInt(regexMatch[2]);
        return 0;
    }

    /**
     * Gets a unique ID from a snowflake
     * @param {string} id The message ID
     * @returns {string}
     * @constructor
     */
    static GetUniqueId(id){
        let charCodes = [];
        for (let i = 0; i < id.length; i += 3) {
            charCodes.push(id[i] + id[i + 1] + id[i + 3]);
        }
        return Buffer.from(charCodes).toString("base64");
    }

    /**
     * Get a user object from
     * @param {object} bot OcelotBOT Instance
     * @param {string} mention The mention
     * @returns {null|Discord.User}
     * @constructor
     */
    static GetUserFromMention(bot, mention) {
        if (!mention) return null;
        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);
            if (mention.startsWith('&'))
                return null;
            if (mention.startsWith('!'))
                mention = mention.slice(1);
            return bot.client.users.cache.get(mention);
        }
        return null;
    }

    /**
     * Get an emoji URL from a mention
     * @param {string} mention
     * @returns {string|null} A URL to the emoji
     * @constructor
     */
    static GetEmojiURLFromMention(mention) {
        if (!mention) return null;
        if (mention.startsWith("<:") && mention.endsWith(">")) {
            let id = mention.substring(2).split(":")[1];
            if (!id) return null;
            id = id.substring(0, id.length - 1);
            return `https://cdn.discordapp.com/emojis/${id}.png?v=1`;
        }

        if (mention.startsWith("<a:") && mention.endsWith(">")) {
            let id = mention.substring(3).split(":")[1];
            if (!id) return null;
            id = id.substring(0, id.length - 1);
            return `https://cdn.discordapp.com/emojis/${id}.gif?v=1`;
        }

        let parse = twemoji.parse(mention, {assetType: 'png'});
        if (parse[0]) return parse[0].url;

        return null;
    }

    static #quantify(data, unit, value, server, user, bot) {
        if (value && value >= 1) {
            if (value > 1 || value < -1)
                unit += 'S';

            data.push(bot.lang.getTranslation(server, unit, {0:value}, user))
        }

        return data;
    };

    static ShortSeconds(totalSeconds){
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.round(totalSeconds % 60);

        if (minutes < 10)
            minutes = "0" + minutes;
        if (seconds < 10)
            seconds = "0" + seconds;

        if (hours >= 1) {
            if (hours < 10)
                hours = "0" + hours;
            return `${hours}:${minutes}:${seconds}`
        }
        return `${minutes}:${seconds}`;
    }

    static PrettySeconds(bot, seconds, server = "global", user) {
        if (seconds < 1) return bot.lang.getTranslation(server, "TIME_SECONDS", {0:seconds.toFixed(2)}, user);
        seconds = Math.round(seconds);

        let prettyString = '', data = [];

        if (typeof seconds === 'number') {
            data = Strings.#quantify(data, 'TIME_DAY', Math.floor((seconds) / 86400), server, user, bot);
            data = Strings.#quantify(data, 'TIME_HOUR', Math.floor((seconds % 86400) / 3600), server, user, bot);
            data = Strings.#quantify(data, 'TIME_MINUTE', Math.floor((seconds % 3600) / 60), server, user, bot);
            data = Strings.#quantify(data, 'TIME_SECOND', Math.floor(seconds % 60), server, user, bot);

            let length = data.length, i;

            for (i = 0; i < length; i++) {

                if (prettyString.length > 0)
                    if (i === length - 1)
                        prettyString += ` ${bot.lang.getTranslation(server, "TIME_AND", {}, user)} `;
                    else
                        prettyString += ', ';

                prettyString += data[i];
            }
        }

        return prettyString;
    };

    static PrettyMemory(bytes) {
        if (bytes < 1000) return bytes + " bytes"; //< 1kb
        if (bytes < 1000000) return Math.floor(bytes / 1000) + "KB"; //<1mb
        if (bytes < 1e+9) return Math.floor(bytes / 1000000) + "MB"; //<1gb
        if (bytes < 1e+12) return Math.floor(bytes / 1e+9) + "GB"; //<1tb
        if (bytes < 1e+15) return Math.floor(bytes / 1e+12) + "TB"; //<1pb
        return Math.floor(bytes / 1e+15) + "PB";
    }

    static ProgressBar(current, total, width = 50) {
        let progress = width * (current / total);
        let output = "[";
        for (let i = 0; i < width; i++)
            output += i < progress ? "█" : "░";
        output += "]";
        return output;
    }

    static GetNumberPrefix(i) {
        let j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) {
            return i + "st";
        }
        if (j === 2 && k !== 12) {
            return i + "nd";
        }
        if (j === 3 && k !== 13) {
            return i + "rd";
        }
        return i + "th";
    }

    /**
     * Adds ellipses to the end of a string if it's too long
     * @param {string} string
     * @param {number} maxWidth
     * @returns {string|null}
     * @constructor
     */
    static Truncate(string, maxWidth){
        if(!string)return null;
        if(string.length > maxWidth)
            return string.substring(0, maxWidth-3)+"...";
        return string;
    }


    static Format(string, values = {}){
        return string.toString().replace(/{{(.*?)}}/g, (match, reference)=>{
            const split = reference.split(":");
            if(split.length === 1) {
                return Strings.GetReference(values, reference)?.toString();
            }
            const output = Strings.GetReference(values, split[1]);
            switch(split[0]){
                case "format":
                    return Strings.Format(output, values);
                case "shortSeconds":
                    return Strings.ShortSeconds(output);
                case "memory":
                    return Strings.PrettyMemory(output);
                case "icon":
                    return Icons[output];
                case "timestamp":
                    if(!output.getTime)return `{Value ${split[1]} must be a Date, got ${typeof split[1]}}`
                    return `<t:${Math.floor(output.getTime()/1000)}:${split[2] || "f"}>`;
                case "number":
                    return parseInt(output).toLocaleString(values.locale)
                case "date":
                    if(!output.toLocaleDateString)return `{Value of ${split[1]} (${output}) must be a Date, got ${typeof output}}`
                    return output.toLocaleDateString(values.locale, {timeZone: values.timezone});
                case "time":
                    if(!output.toLocaleTimeString)return `{Value of ${split[1]} (${output}) must be a Date, got ${typeof output}}`
                    return output.toLocaleTimeString(values.locale, {timeZone: values.timezone});
                case "datetime":
                    if(!output.toLocaleDateString)return `{Value of ${split[1]} (${output}) must be a Date, got ${typeof output}}`
                    return output.toLocaleString(values.locale, {timeZone: values.timezone});
                default:
                    return output;
            }
        });
    }

    /**
     *
     * @param {Object} obj The object to retrieve from
     * @param {string} reference The reference
     * @constructor
     */
    static GetReference(obj, reference){
        let result =  reference.split('.').reduce((o,i)=>o[i], obj);
        if(result === undefined || result === null)return reference;
        return result;
    }

    static PrintCommandUsage(usageData){
        return usageData.map((section)=>{
            let output = section.type;
            switch(section.type){
                case "number":
                case "single":
                   output = section.name;
                   break;
                case "user":
                    output = "@"+section.name;
                    break;
                case "channel":
                    output = "#"+section.name;
                    break;
                case "role":
                    output = "@"+section.name;
                    break;
                case "boolean":
                    output = `"on"/"off"`;
                    break;
                case "options":
                    output = `"${section.options.join("\"/\"")}"`;
                    break;
            }
            if(section.optional)
                return `[${output}]`;
            return `<${output}>`;
        }).join(" ");
    }


    static NCharacters(n, character){
        return Array.from({length: n}, ()=>character).join("")
    }

    /**
     *
     * @param {BigInt} number
     * @constructor
     * @returns {string}
     */
    static NumberToCommandId(number){
        let hexString = number.toString(16);
        if(hexString % 2 !== 0)hexString = "0"+hexString; // Node truncates the last character of odd hex values in buffers because fuck you
        return Buffer.from(hexString, 'hex').toString("base64").replace(/=/g, "")
    }

    /**
     *
     * @param {string} commandId
     * @constructor
     * returns {string}
     */
    static CommandIdToNumber(commandId){
        return BigInt("0x"+Buffer.from(commandId, "base64").toString("hex")).toString();
    }

}