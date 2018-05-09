const subs = {
    "a": ["卂", "冃", "円", "闩", "丹"],
    "b": ["阝"],
    "c": ["匚", "亡", "匸", "汇"],
    // "d": [""],
    "e": ["巳", "乇", "㔾", "彐"],
    //"f": [""],
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
    //"q": [""],
    "r": ["尺", "卜", "厂", "广"],
    //"s": [""],
    "t": ["丁", "ㄒ", "㓀", "十", "卞", "才"],
    "u": ["凵", "凹"],
    //"v": [""],
    "w": ["山"],
    "x": ["乂"],
    "y": ["丫"],
    "z": ["乙"]
};

module.exports = {
    name: "Chinese Text",
    usage: "chinese <text>",
    accessLevel: 0,
    commands: ["chinese", "chin"],
    run: function run(message, args, bot) {
        if(!args[1]){
            message.replyLang("CHINESE_NO_TEXT");
            return;
        }
        const sentence = message.content.substring(args[0].length+1);
        const letters = [...sentence];
        let output = "";
        for(let i in letters)
            output += (subs[letters[i]]) ? bot.util.arrayRand(subs[letters[i]]) : letters[i];


        message.channel.send(output);
    }
};