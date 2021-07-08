const brain = require('brain.js');
const config = require('config');
const knex = require('knex')(config.get("Database"));


async function getTrainingData(){
    let databaseData = await knex.select("message", "response").from("ocelotbot_ai_conversations").limit(1000);
    return databaseData.map((row)=>({input: row.message, output: row.response}));
}


async function run(){
    let data = await getTrainingData();
    const net = new brain.recurrent.LSTM();
    console.log(`Training with ${data.length} rows...`);
    net.train(data);
    console.log("Training done");
    console.log(net.run('hello'));
}

run();