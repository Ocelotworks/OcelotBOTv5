/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/09/2019
 * ╚════ ║   (ocelotbotv5) reminders
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   config          = require('config'),
        amqplib         = require('amqplib'),
        knex            = require('knex')(config.get("Database")),
        tracer          = require('dd-trace');


let reminders = [];
let channel;
function setLongTimeout(callback, timeout_ms){
    if(timeout_ms > 2147483646){
        setTimeout(function(){
            setLongTimeout(callback, (timeout_ms - 2147483646));
        },2147483646);
    }
    else{
        setTimeout(callback, timeout_ms);
    }
}

function triggerReminder(reminder){
    console.log("Triggered reminder");
    console.log(reminder);
    channel.sendToQueue("reminder", Buffer.from(JSON.stringify(reminder)));
}

function setReminder(reminder){
    let now = new Date();
    let diff = reminder.at-now;
    setLongTimeout(()=>triggerReminder(reminder), diff);
}

async function init(){
    tracer.init({
        analytics: true
    });
    console.log("Loading reminders");
    reminders = await knex.select().from("ocelotbot_reminders");

    console.log("Loaded "+reminders.length+" reminders.");
    for(let i = 0; i < reminders.length; i++){
        let reminder = reminders[i];
        setReminder(reminder);
    }

    let con = await amqplib.connect(config.get("RabbitMQ.host"));
    channel = await con.createChannel();

    channel.assertQueue("reminder");
    channel.assertQueue('newReminder');
    channel.consume('newReminder', function(msg){
        console.log("Processing "+msg.content.toString());
        let reminder = JSON.parse(msg.content.toString());
        setReminder(reminder);
    });

}

init();

