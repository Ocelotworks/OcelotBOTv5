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

bot.logger = console;

bot.database = {
};

bot.client = new EventEmitter();

bot.raven = {
    wrap: function(arg){
        return arg;
    },
    captureBreadcrumb: function(){}
};

bot.bus = new EventEmitter();

bot.isRatelimited = function(){
    return false;
}


bot.database = {
    logCommand: function(){
        return new Promise(function(resolve){
            resolve([0]);
        })
    }
};


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
