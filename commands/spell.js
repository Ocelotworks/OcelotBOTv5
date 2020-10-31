
module.exports = {
    name: "Spell with Reactions",
    usage: "spell [^] <send>",
    commands: ["spell", "react"],
    categories: ["fun"],
    equiredPermissions: ["ADD_REACTIONS"],
    run: async function run(message, args, bot){
        if(!args[1]){
            message.channel.send(`Invalid usage: ${args[0]} <sentence>`);
            return;
        }
        const messageFetch = await message.channel.messages.fetch({limit: 2});
        let letters = {
            abcd: ["🔡","🔠"],
            abc: ["🔤"],
            ab: ["🆎"],
            id: ["🆔"],
            vs: ["🆚"],
            ok: ["🆗"],
            cool: ["🆒"],
            lo: ["🔟"],
            new: ["🆕"],
            ng: ["🆖"],
            free: ["🆓"],
            cl: ["🆑"],
            wc: ["🚾"],
            sos: ["🆘"],
            atm: ["🏧"],
            up: ["🆙"],
            end: ["🔚"],
            back: ["🔙"],
            on: ["🔛"],
            top: ["🔝"],
            soon: ["🔜"],
            off: ["📴"],
            oo: ["➿", "🈁"],
            zzz: ["💤"],
            "0": ["0⃣","🇴", "🅾", "⭕", "🔄", "🔃"],
            "1": ["1⃣"],
            "2": ["2⃣"],
            "3": ["3⃣"],
            "4": ["4⃣"],
            "5": ["5⃣"],
            "6": ["6⃣"],
            "7": ["7⃣"],
            "8": ["8⃣"],
            "9": ["9⃣"],
            "10": ["🔟"],
            "18": ["🔞"],
            "100": ["💯"],
            "1234": ["🔢"],
            "$": ["💲"],
            "!!": ["‼"],
            "!": ["❗", "❕", "⚠", "‼"],
            "?": ["❓", "❔"],
            "*": ["*⃣"],
            "#": ["#⃣"],
            tm: ["™"],
            a: ["🅰",  "🇦" ],
            b: ["🅱", "🇧"],
            c: ["🇨", "©", "↪", "🌊"],
            d: ["🇩"],
            e: ["🇪", "📧"],
            f: ["🇫"],
            g: ["🇬"],
            h: ["🇭"],
            i: ["🇮", "ℹ", "🇯", "♊", "👁" ],
            j: ["🇯", "🇮"],
            k: ["🇰"],
            l: ["🇱", "🛴"],
            m: ["🇲", "Ⓜ", "〽", "🇳"],
            n: ["🇳", "🇲", "Ⓜ"],
            o: ["🇴", "🅾", "⭕", "🔄", "🔃", "0⃣","👁‍", "🔅", "🔆"],
            p: ["🇵", "🅿"],
            q: ["🇶"],
            r: ["🇷", "®"],
            s: ["🇸", "💲", "💰"],
            t: ["🇹", "✝"],
            u: ["🇺"],
            v: ["🇻", "♈"],
            w: ["🇼"],
            x: ["🇽", "❌", "✖", "❎"],
            y: ["🇾"],
            z: ["🇿", "💤"]
        };


        let target = message.cleanContent.substring(args[0].length).trim().toLowerCase();

        for(let passes = 0; passes < 20; passes++){
            let done = true;
            for(let replacer in letters){
                if(letters.hasOwnProperty(replacer)){
                    const ind = target.indexOf(replacer);
                    if(ind > -1){
                        done = false;
                        target = target.replace(replacer, letters[replacer][0]+" ");
                        letters[replacer].splice(0, 1);
                        if(letters[replacer].length === 0)
                            delete letters[replacer];
                    }
                }
            }
            if(done){
                bot.logger.log("Done after "+passes+" passes.");
                break;
            }
        }

        const output = target.replace(/[A-z%$+\-:/\\"'@£^~.,\[\]><()]/g, "").split(" ");

        const targetMessage = messageFetch.last();

        if(!targetMessage || !targetMessage.react)
            return message.channel.send(":bangbang: Could not find a message to react to...");

        for(let i = 0; i < output.length; i++){
            try {
                if(output[i])
                    await targetMessage.react(output[i]);

            }catch(e){
                if(e.message === "Reaction blocked"){
                    message.replyLang("SPELL_REACTION_BLOCKED");
                    break;
                }else if(e.message.startsWith("Maximum number of reactions reached")){
                    message.replyLang("SPELL_MAXIMUM_REACHED");
                    break;
                }
                bot.logger.log(`Invalid emoji ${output[i]} (${e.message})`);
            }
        }


    }
};