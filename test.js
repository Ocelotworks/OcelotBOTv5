const fs = require('fs');
const EventEmitter = require('events');
import test from 'ava';


let files = fs.readdirSync("commands");
for (let i in files) {
    if(files.hasOwnProperty(i)){
        if(!fs.lstatSync('./commands/'+files[i]).isDirectory()){
            try {
                var newCommand = require('./commands/' + files[i]);
                if (newCommand.test)
                    newCommand.test(test);
                //else
                    //console.warn("Skipping " + newCommand.name + " as it doesn't have any tests defined.");
            }catch(e){
                //console.error("Error loading "+files[i]);
                //console.error(e);
            }
        }
    }
}


const util = require('./modules/util.js');
let bot = {};
util.init(bot);

bot.logger = console;
bot.client = new EventEmitter();
bot.database = {};

bot.raven = {
    wrap: function(arg){
        return arg;
    },
    captureBreadcrumb: function(){}
};

bot.bus = new EventEmitter();

bot.isRatelimited = function(){
    return false;
};


bot.database = {
    logCommand: function(){
        return new Promise(function(resolve){
            resolve([0]);
        })
    }
};


test.expectReplyLang = function(t, content, str, obj, run){
    const args = content.split(" ");
    const message = {
        getSetting: function(){
            return null;
        },
        replyLang: function(key, recievedObj){
            t.is(key, str);
            t.deepEqual(recievedObj,obj);
        }
    }
};

test('util int between', function(t){
    const randInt = bot.util.intBetween(0, 10);
    if(randInt >= 0 && randInt <= 10 && randInt === parseInt(randInt)){
        t.pass();
    }
});

test('util int between 1 number', function(t){
    const randInt = bot.util.intBetween(0, 0);
    t.is(randInt, 0);
});

test('util array rand', function(t){
    const array = ["a", "b", "c"];
    const rand = bot.util.arrayRand(array);
    if(array.indexOf(rand) > -1){
        t.pass();
    }
});

test('util array rand blank array', function(t){
    const rand = bot.util.arrayRand([]);
    t.is(rand, undefined);
});

test('pretty seconds 1 day', function(t){
    t.is(bot.util.prettySeconds(86400), "1 day")
});

test('pretty seconds 1 day with string', function(t){
    t.is(bot.util.prettySeconds("86400"), "1 day")
});

test('pretty seconds less than a second', function(t){
    t.is(bot.util.prettySeconds(0.01), "less than a second")
});

test('pretty seconds 1 second', function(t){
    t.is(bot.util.prettySeconds(1), "1 second")
});

test('pretty seconds minute', function(t){
    t.is(bot.util.prettySeconds(60), "1 minute")
});

test('pretty seconds mix 2', function(t){
    t.is(bot.util.prettySeconds(61), "1 minute and 1 second")
});

test('pretty seconds mix 3', function(t){
    t.is(bot.util.prettySeconds(3661), "1 hour, 1 minute and 1 second")
});

test('pretty memory bytes', function(t){
    t.is(bot.util.prettyMemory(5), "5 bytes")
});

test('pretty memory kilobytes', function(t){
    t.is(bot.util.prettyMemory(2000), "2KB")
});

test('pretty memory megabytes', function(t){
    t.is(bot.util.prettyMemory(2000000), "2MB")
});

test('pretty memory gigabytes', function(t){
    t.is(bot.util.prettyMemory(2e+9), "2GB")
});

test('pretty memory terabytes', function(t){
    t.is(bot.util.prettyMemory(2e+12), "2TB")
});

test('pretty memory petabytes', function(t){
    t.is(bot.util.prettyMemory(2e+15), "2PB")
});

test('number prefix st', function(t){
    t.is(bot.util.getNumberPrefix(1), "1st")
});

test('number prefix nd', function(t){
    t.is(bot.util.getNumberPrefix(2), "2nd")
});

test('number prefix rd', function(t){
    t.is(bot.util.getNumberPrefix(3), "3rd")
});

test('number prefix th', function(t){
    t.is(bot.util.getNumberPrefix(4), "4th")
});

test('number prefix big number', function(t){
    t.is(bot.util.getNumberPrefix(122), "122nd")
});

test('number prefix weird th', function(t){
    t.is(bot.util.getNumberPrefix(112), "112th")
});

test('getUserFromMention no input', function(t){
    t.is(bot.util.getUserFromMention(), null)
});



test('getUserFromMention no mention', function(t){
    t.is(bot.util.getUserFromMention("this is not a mention"), null)
});

test('getUserFromMention role', function(t){
    t.is(bot.util.getUserFromMention("<@&432933265209557002>"), null)
});

test('getUserFromMention channel', function(t){
    t.is(bot.util.getUserFromMention("<#318432654880014347>"), null)
});

test('getUserFromMention user', function(t){
    bot.client.users = {
        get: t.pass
    };
    bot.util.getUserFromMention("<@139871249567318017>");
});

test('determineMainChannel defaultChannel text', function(t){
    const guild = {
        defaultChannel: {
            type: "text",
            permissionsFor: ()=> {
                return {has: ()=>true}
            }
        }
    };
    t.is(bot.util.determineMainChannel(guild), guild.defaultChannel);
});

test('determineMainChannel defaultChannel voice', function(t){
    const guild = {
        defaultChannel: {
            type: "voice",
            permissionsFor: ()=> {
                return {has: ()=>true}
            }
        },
        channels: {
            find: ()=>"mainChannel"
        }
    };
    t.is(bot.util.determineMainChannel(guild), "mainChannel");
});

test('determineMainChannel defaultChannel no perms', function(t){
    const guild = {
        defaultChannel: {
            type: "text",
            permissionsFor: ()=> {
                return {has: ()=>false}
            }
        },
        channels: {
            find: ()=>"mainChannel"
        }
    };
    t.is(bot.util.determineMainChannel(guild), "mainChannel");
});

test('determineMainChannel defaultChannel null', function(t){
    const guild = {
        defaultChannel: null,
        channels: {
            find: ()=>"mainChannel"
        }
    };
    t.is(bot.util.determineMainChannel(guild), "mainChannel");
});

test('determineMainChannel mainChannel regex voice', function(t){
    const guild = {
        defaultChannel: null,
        channels: {
            find: function(func){
                t.falsy(func({type: "voice", name: "off-topic", permissionsFor: t.fail}));
            }
        }
    };
    bot.util.determineMainChannel(guild);
});



function testMainChannelRegex(channelName){
    return function(t) {
        const guild = {
            defaultChannel: null,
            channels: {
                find: function (func) {
                    t.truthy.skip(func({
                        type: "text", name: channelName, permissionsFor: () => {
                            return {has: () => true}
                        }
                    }));
                }
            }
        };
        bot.util.determineMainChannel(guild);
    }
}

test('determineMainChannel mainChannel regex main', testMainChannelRegex("main"));
test('determineMainChannel mainChannel regex general', testMainChannelRegex("general"));
test('determineMainChannel mainChannel regex discussion', testMainChannelRegex("discussion"));
test('determineMainChannel mainChannel regex home', testMainChannelRegex("home"));
test('determineMainChannel mainChannel regex lobby', testMainChannelRegex("lobby"));

test('util getEmojiURLFromMention no mention', function(t){
    t.is(bot.util.getEmojiURLFromMention(), null);
});

test('util getEmojiURLFromMention invalid mention', function(t){
    t.is(bot.util.getEmojiURLFromMention("this is not a mention"), null);
});

test('util getEmojiURLFromMention corrupt mention', function(t){
    t.is(bot.util.getEmojiURLFromMention("<:j>"), null);
});

test('util getEmojiURLFromMention corrupt emoji mention', function(t){
    t.is(bot.util.getEmojiURLFromMention("<a:j>"), null);
});

test('util getEmojiURLFromMention valid mention', function(t){
    t.is(bot.util.getEmojiURLFromMention("<:peter:478962397281779713>"), "https://cdn.discordapp.com/emojis/478962397281779713.png?v=1");
});

test('util getEmojiURLFromMention valid animated mention', function(t){
    t.is(bot.util.getEmojiURLFromMention("<a:anibanned:423328266750001162>"), "https://cdn.discordapp.com/emojis/423328266750001162.gif?v=1");
});

test('util getEmojiURLFromMention valid emoji', function(t){
    t.is(bot.util.getEmojiURLFromMention("🤔"), "https://twemoji.maxcdn.com/2/72x72/1f914.png");
});

test('util getEmojiURLFromMention valid flag emoji', function(t){
    t.is(bot.util.getEmojiURLFromMention("🇦🇩"), "https://twemoji.maxcdn.com/2/72x72/1f1e6-1f1e9.png");
});

test('util regex timezoneRegex GMT+1', function(t){
    let result = bot.util.timezoneRegex.exec("GMT+1");
    t.is(result[1], "GMT");
    t.is(result[2], "+1");
});

test('util regex timezoneRegex GMT+100', function(t){
    let result = bot.util.timezoneRegex.exec("GMT+100");
    t.is(result[1], "GMT");
    t.is(result[2], "+100");
});

test('util regex timezoneRegex GMT+0', function(t){
    let result = bot.util.timezoneRegex.exec("GMT+0");
    t.is(result[1], "GMT");
    t.is(result[2], "+0");
});

test('util regex timezoneRegex GMT+01', function(t){
    let result = bot.util.timezoneRegex.exec("GMT+01");
    t.is(result[1], "GMT");
    t.is(result[2], "+01");
});

test('util regex timezoneRegex GMT+123456789', function(t){
    let result = bot.util.timezoneRegex.exec("GMT+123456789");
    t.is(result[1], "GMT");
    t.is(result[2], "+123456789");
});

test('util regex timezoneRegex UTC+1', function(t){
    let result = bot.util.timezoneRegex.exec("UTC+1");
    t.is(result[1], "UTC");
    t.is(result[2], "+1");
});

test('util regex timezoneRegex UTC+100', function(t){
    let result = bot.util.timezoneRegex.exec("UTC+100");
    t.is(result[1], "UTC");
    t.is(result[2], "+100");
});

test('util regex timezoneRegex UTC+0', function(t){
    let result = bot.util.timezoneRegex.exec("UTC+0");
    t.is(result[1], "UTC");
    t.is(result[2], "+0");
});

test('util regex timezoneRegex UTC+01', function(t){
    let result = bot.util.timezoneRegex.exec("UTC+01");
    t.is(result[1], "UTC");
    t.is(result[2], "+01");
});

test('util regex timezoneRegex UTC+123456789', function(t){
    let result = bot.util.timezoneRegex.exec("UTC+123456789");
    t.is(result[1], "UTC");
    t.is(result[2], "+123456789");
});


test('util regex swearRegex fuck you', function(t){
    t.true(bot.util.swearRegex.exec("fuck you"));
});

test('util regex swearRegex shit', function(t){
    t.true(bot.util.swearRegex.exec("shit"));
});

test('util regex swearRegex faggot', function(t){
    t.true(bot.util.swearRegex.exec("faggot"));
});

test('util regex swearRegex fagget', function(t){
    t.true(bot.util.swearRegex.exec("fagget"));
});

test('util regex swearRegex fagot', function(t){
    t.true(bot.util.swearRegex.exec("fagot"));
});

let commands = require('./modules/commands.js');

commands.loadCommands = function(){};
commands.loadPrefixCache = function(){};

commands.init(bot);

test('command processing bot account', function(t){
    const message = {
        author: {
            bot: true
        },
        reply: t.fail,
        channel: {
            send: t.fail
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
    t.pass();
});


test('command processing non-command message', function(t){
    const message = {
        author: {},
        getSetting: function(){
            return "!"
        },
        content: "This is not a command",
        reply: t.fail,
        channel: {
            send: t.fail
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
    t.pass();
});


test('command processing command not found', function(t){

    bot.commands = {};

    const message = {
        author: {},
        getSetting: function(){
            return "!"
        },
        content: "!this is a command but it doesn't exist",
        reply: t.fail,
        channel: {
            send: t.fail
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
    t.pass();
});


test('command processing premium command with no premium', function(t){
    bot.commands = {premium: t.fail};
    bot.commandUsages = {premium: {premium: true}};
    const message = {
        author: {},
        guild: {},
        getSetting: function(){
            return "!"
        },
        getBool: function(){
            return false;
        },
        content: "!premium",
        reply: t.fail,
        channel: {
            send: function(message){
                t.regex(message, /.*OcelotBOT Premium.*/ig)
            }
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});

test('command processing premium command with premium', function(t){
    t.plan(1);
    bot.commands = {premium: t.pass};
    bot.commandUsages = {premium: {premium: true, categories: []}};
    bot.checkBan = function(){
      return false;
    };
    bot.isRateLimited = function(){
        return false;
    };
    const config = {
        premium: true,
        serverPremium: false,
        allowNSFW: true,
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
           return config[key];
        },
        content: "!premium",
        reply: t.fail,
        channel: {
            send: t.fail
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});


test('command processing NSFW command with NSFW disabled', function(t){
    bot.commands = {nsfw: t.fail};
    bot.commandUsages = {nsfw: {categories: ["nsfw"]}};

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: true,
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "!nsfw",
        reply: t.fail,
        channel: {
            send: t.fail
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
    t.pass();
});

test('command processing NSFW command with NSFW enabled but no NSFW channel', function(t){
    t.plan(1);
    bot.commands = {nsfw: t.fail};
    bot.commandUsages = {nsfw: {categories: ["nsfw"]}};
    bot.checkBan = function(){
        return false;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "!nsfw",
        reply: t.fail,
        channel: {
            send: t.pass
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});

test('command processing NSFW command with NSFW enabled with NSFW channel', function(t){
    t.plan(1);
    bot.commands = {nsfw: t.pass};
    bot.commandUsages = {nsfw: {categories: ["nsfw"]}};
    bot.checkBan = function(){
        return false;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "!nsfw",
        reply: t.fail,
        channel: {
            send: t.fail,
            nsfw: true
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});

test('command processing NSFW command with NSFW enabled but no NSFW channel with bypass enabled', function(t){
    t.plan(1);
    bot.commands = {nsfw: t.pass};
    bot.commandUsages = {nsfw: {categories: ["nsfw"]}};
    bot.checkBan = function(){
        return false;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        bypassNSFWCheck: true,
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "!nsfw",
        reply: t.fail,
        channel: {
            send: t.fail
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});

test('command processing command disabled', function(t){
    bot.commands = {test: t.fail};
    bot.commandUsages = {test: {categories: []}};
    bot.checkBan = function(){
        return false;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        "test.disable": true,
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "!test",
        reply: t.fail,
        channel: {
            send: t.fail
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
    t.pass();
});

test('command processing override', function(t){
    bot.commands = {test: t.fail};
    bot.commandUsages = {test: {categories: []}};
    bot.checkBan = function(){
        return false;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        "test.override": "override!",
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "!test",
        reply: t.fail,
        channel: {
            send: function(message){
                t.is(message, "override!");
            }
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});

test('command processing banned', function(t){
    bot.commands = {test: t.fail};
    bot.commandUsages = {test: {categories: []}};
    bot.checkBan = function(){
        return true;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "!test",
        reply: t.fail,
        channel: {
            send: t.fail
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
    t.pass();
});


test('command processing', function(t){
    t.plan(1);
    bot.commands = {command: t.pass};
    bot.commandUsages = {command: {categories: []}};
    bot.checkBan = function(){
        return false;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        prefix: "!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "!command",
        reply: t.fail,
        channel: {
            send: t.fail,
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});

test('command processing long prefix', function(t){
    t.plan(1);
    bot.commands = {command: t.pass};
    bot.commandUsages = {command: {categories: []}};
    bot.checkBan = function(){
        return false;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        prefix: "hellohellohello!"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "hellohellohello!command",
        reply: t.fail,
        channel: {
            send: t.fail,
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});

test('command processing weird prefix', function(t){
    t.plan(1);
    bot.commands = {command: t.pass};
    bot.commandUsages = {command: {categories: []}};
    bot.checkBan = function(){
        return false;
    };
    bot.isRateLimited = function(){
        return false;
    };

    const config = {
        premium: false,
        serverPremium: false,
        allowNSFW: false,
        prefix: "***1234***"
    };
    const message = {
        author: {},
        guild: {},
        getSetting: function(key){
            return config[key]
        },
        getBool: function(key){
            return config[key];
        },
        content: "***1234***command",
        reply: t.fail,
        channel: {
            send: t.fail,
        },
        replyLang: t.fail
    };

    bot.client.emit("message", message);
});

