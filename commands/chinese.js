const subs = {
    "a": ["卂", "冃", "円", "闩", "丹"],
    "b": ["阝"],
    "c": ["匚", "亡", "匸", "汇"],
    "d": ["刀"],
    "e": ["巳", "乇", "㔾", "彐"],
    "f": ["下"],
    "g": ["ム"],
    "h": ["卄", "九", "廾"],
    "i": ["彳", "丨", "讠", "辶", "工"],
    "j": ["丿"],
    "k": ["长", "Ｋ"],
    "l": ["丨"],
    "m": ["爪"],
    "n": ["冂", "兀", "刀", "れ"],
    "o": ["口", "曰"],
    "p": ["尸", "户", "ㄗ"],
    "q": ["㔿"],
    "r": ["尺", "卜", "厂", "广"],
    "s": ["丂"],
    "t": ["丁", "ㄒ", "㓀", "十", "卞", "才"],
    "u": ["凵", "凹"],
    "v": ["リ"],
    "w": ["山"],
    "x": ["乂"],
    "y": ["丫"],
    "z": ["乙"]
};

module.exports = {
    name: "Chinese Text",
    usage: "chinese <text>",
    accessLevel: 0,
    rateLimit: 10,
    detailedHelp: "This command does NOT translate things into chinese. It transforms the input text into chinese characters that kinda look like their english counterpart.\nDon't use these for your Chinese exam.",
    categories: ["text"],
    commands: ["chinese", "chin"],
    run: function run(message, args, bot) {
        if(!args[1]){
            message.replyLang("CHINESE_NO_TEXT");
            return;
        }
        const sentence = message.cleanContent.substring(args[0].length+1).toLowerCase();
        const letters = [...sentence];
        let output = "";
        for(let i in letters)
            output += (subs[letters[i]]) ? bot.util.arrayRand(subs[letters[i]]) : letters[i];


        message.channel.send(output);
    },
    test: function(test){
        test('chinese no text', function(t){
            const message = {
                replyLang: function(message){
                    t.is(message, "CHINESE_NO_TEXT")
                }
            };
            module.exports.run(message, []);
        });

        test('chinese with working letters', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "卂阝匚")
                    }
                },
                cleanContent: "!chinese abc"
            };
            const args = ["!chinese", "abc"];
            const bot = {
                util: {
                    arrayRand: function(array){
                        return array[0]
                    }
                }
            };
            module.exports.run(message, args, bot);
        });
        test('chinese with not undefined letters', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "!?")
                    }
                },
                cleanContent: "!chinese !?"
            };
            const args = ["!chinese", "!?"];
            const bot = {
                util: {
                    arrayRand: function(array){
                        return array[0]
                    }
                }
            };
            module.exports.run(message, args, bot);
        });
    }
};