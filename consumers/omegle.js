/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 01/11/2019
 * ╚════ ║   (ocelotbotv5) omegle
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const
    config          = require('config'),
    amqplib         = require('amqplib'),
    omegle          = require('omegle-node')//,
   // tracer          = require('dd-trace');

const bannedWords = [
    "@giggle.planet",
    "𝙈𝙞𝙙𝙣𝙞𝙜𝙝𝙩",
    "vidchan.net",
    "mystigan211",
    "yuji",
    "playsx",
    "discord(gg)",
    "discord.gg",
    "★Hey!★",
    "mmmm u like that baby?",
    "mistressadrian"
];

let sessions = {};

async function init(){
   // tracer.init({
   //     analytics: true
   // });
    let con = await amqplib.connect(config.get("RabbitMQ.host"));
    let channel = await con.createChannel();


    function reply(msg, payload){
        console.log(payload);
        console.log("Replying "+msg.properties.replyTo);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(payload)));
    }


    function startSession(msg, channel){
        if(sessions[channel])
            return reply(msg, {type: "error", data: {channel, lang: "OMEGLE_SESSION_EXISTS"}});
        let timeout, om;
        sessions[channel] = om = new omegle();

        om.on('omerror', function(error){
            console.log(error);
            reply(msg, {type: "error", data: {channel, lang: "OMEGLE_ERROR", data: {error}}});
        });

        om.on('waiting', function(){
            reply(msg, {type: "waiting", data: channel});
        });

        om.on('connected', function(){
            clearTimeout(timeout);
            reply(msg, {type: "connected", data: channel});
        });

        om.on('commonLikes', function(likes){
            console.log("Common likes", likes);
            if(likes.includes("ocelotbot"))
                reply(msg, {type: "isOtherServer", data: channel});
        });

        om.on('strangerDisconnected', function(){
            reply(msg, {type: "disconnected", data: channel});
            if(om.connected)
                om.disconnect();
            delete sessions[channel];
        });

        om.on('connectionDied', function(){
            reply(msg, {type: "disconnected", data: channel});
            if(om.connected)
                om.disconnect();
            delete sessions[channel];
        });

        om.on('omegleError', function(){
            reply(msg, {type: "error", data: {channel, lang: "OMEGLE_BANNED"}});
            if(om.connected)
                om.disconnect();
            delete sessions[channel];
        })

        om.on('gotMessage',function(message){
            if(message === "Use Omegle over Discord with OcelotBOT: https://ocelot.xyz/")return;
            for(let i = 0; i < bannedWords.length; i++){
                if(message.toLowerCase().indexOf(bannedWords[i]) > -1){
                    message = "<Spam Filtered>";
                    break;
                }
            }
            reply(msg, {type: "message", data: {channel, message}});
        });

        om.on('antinudeBanned', function(){
            reply(msg, {type: "error", data: {channel, lang: "OMEGLE_BANNED"}});
            if(om.connected)
                om.disconnect();
            delete sessions[channel];
        });

        om.on('recaptchaRequired', function(challenge){
            reply(msg, {type: "error", data: {channel, lang: "OMEGLE_RECAPTCHA", data: {challenge}}});
        });

        om.on('gotID', function(id){
            console.log("Connected as "+id);
        });

        om.connect(['ocelotbot']);
        timeout = setTimeout(function(){
            om.stopLookingForCommonLikes();
        }, 5000);
    }

    function endSession(msg, channel){
        if(!sessions[channel])
            return;
        if(sessions[channel].connected) {
            sessions[channel].send("Use Omegle over Discord with OcelotBOT: https://ocelot.xyz/");
            setTimeout(()=>{
                sessions[channel].disconnect();
            }, 1000)
        }
        delete sessions[channel];
    }


    function sendMessage(msg, channel, message){
        if(!sessions[channel])return;

        sessions[channel].send(message);
    }

    channel.assertQueue('omegle');

    channel.consume('omegle', function(msg){
        console.log("Processing "+msg.content.toString());
        let {type, data} = JSON.parse(msg.content.toString());
        switch(type){
            case "start":
                startSession(msg, data);
                break;
            case "end":
                endSession(msg, data);
                break;
            case "message":
                sendMessage(msg, data.channel, data.message);
                break;
            default:
                console.error("Unknown command", type);
                break;
        }
        channel.ack(msg);

    });

}




init();

