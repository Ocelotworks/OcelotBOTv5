const {google} = require('googleapis');
const config = require('config');
const Discord = require('discord.js');
const typeMap = {
    TOXICITY: "Toxic",
    SEVERE_TOXICITY: "Severely Toxic",
    IDENTITY_ATTACK: "Attack on Identity",
    PROFANITY: "Profanity",
    INSULT: "Insult",
    THREAT: "Threat",
    FLIRTATION: "Flirting",
    SEXUALLY_EXPLICIT: "Sexually Explicit",
    SPAM: "Spam",
    ATTACK_ON_COMMENTER: "Attack on User"
}


module.exports = {
    name: "Toxicity Checker",
    usage: "toxicity [text]",
    categories: ["text"],
    detailedHelp: "Checks how toxic a message is",
    usageExample: "toxicity Ocelotbot is are bad",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["toxicity", "toxic"],
    init: async function(){
        api = await google.discoverAPI("https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1");
    },
    run: async function(message, args, bot){
        let target;
        if(args.length > 1){
            target = message.content.substring(args[0].length);
        }else if (message.reference && message.reference.messageID) {
            const reference = await message.channel.messages.fetch(message.reference.messageID);
            target = reference.content;
        }else{
            const messages = await message.channel.messages.fetch({limit: 2});
            if (messages.size > 1 && messages.last().content.length > 1) {
                const message = messages.last();
                target = message.content;
            } else {
                return message.replyLang("SPONGEBOB_NO_TEXT")
            }
        }

        api.comments.analyze({key: config.get("API.perspective.key"), resource: {
            comment: {
                text: target,
            },
            doNotStore: true,
            requestedAttributes: {TOXICITY: {}, SEVERE_TOXICITY: {}, IDENTITY_ATTACK: {}, PROFANITY: {}, INSULT: {}, THREAT: {}, FLIRTATION: {}, SEXUALLY_EXPLICIT: {}, SPAM: {}, ATTACK_ON_COMMENTER: {}}
        }}, (err, resp)=>{
            if(err || !resp.data.attributeScores){
                console.log(err);
                return message.replyLang("GENERIC_ERROR");
            }
            const scores = resp.data.attributeScores;
            let bad = false;
            let output = Object.keys(scores).sort((a, b)=>scores[b].summaryScore.value-scores[a].summaryScore.value).map((type)=>{
                const score = (scores[type].summaryScore.value*100).toFixed(2)
                let output =  `${score}% - ${typeMap[type]}`;
                if(score < 50)return output;
                bad = true;
                return `**${output}**`;
            })
            let embed = new Discord.MessageEmbed();
            embed.setTitle("Toxicity Report");
            embed.setDescription("Target Message:\n> "+target);
            embed.addField("Results", output.join("\n"));
            embed.setColor(bad ? "#ff0000" : "#22aa22");
            return message.channel.send(embed);
        })
    }
};