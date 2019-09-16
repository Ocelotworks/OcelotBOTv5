/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/09/2019
 * ╚════ ║   (ocelotbotv5) reminders
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   config          = require('config'),
        amqplib         = require('amqplib'),
        knex            = require('knex')(config.get("Database"));


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

async function init(){

    console.log("Loading reminders");
    reminders = await knex.select().from("ocelotbot_reminders");

    console.log("Loaded "+reminders.length+" reminders.");

    let now = new Date();
    for(let i = 0; i < reminders.length; i++){
        let reminder = reminders[i];
        let diff = reminder.at-now;
        setLongTimeout(()=>triggerReminder(reminder), diff);
    }

    let con = await amqplib.connect(config.get("RabbitMQ.productionHost"));
    channel = await con.createChannel();

    channel.assertQueue("triggerReminder");
    channel.assertQueue('addReminder');
    channel.consume('addReminder', function(msg){
        console.log("Processing "+msg.content.toString());
        let reminder = JSON.parse(msg.content.toString());

    });

}

init();

