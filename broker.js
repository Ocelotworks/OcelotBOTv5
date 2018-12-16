const {ShardingManager} = require('discord.js');
const config = require('config');
const logger = require('ocelot-logger');
const Raven = require('raven');
const express = require('express');
const app = express();
const port = 3006;
Raven.config(config.get("Raven.DSN")).install();


let commandList;

const manager = new ShardingManager(`${__dirname}/ocelotbot.js`, config.get("Discord"),);


manager.spawn();

manager.on('launch', function launchShard(shard) {
    logger.log(`Successfully launched shard ${shard.id+1}/${manager.totalShards} (ID: ${shard.id})`);
});

manager.on('message', function onMessage(process, message){
    if(message.type) {
        if(message.type === "commandList"){
            logger.log("Got command list");
            commandList = message.payload;
            return;
        }
        logger.log("Broadcasting message");
        manager.broadcast(message);
    }
});



app.get('/commands', function(req, res){
    res.json(commandList);
});

app.get('/shard/count', function(req, res){
   res.json({count: manager.totalShards});
});

app.get('/server/:id/reloadConfig', function(req, res){
   res.json({});
   manager.broadcast({type: "reloadConfig", payload: req.params.id});
});

app.get('/shard/:id', function(req, res){
   const shard = manager.shards.get(manager.shards.keyArray()[req.params.id]);
   if(shard) {
       res.json({
           id: shard.id,
           ready: shard.ready
       });
   }else{
       res.json({});
   }
});

app.get('/user/:id/registerVote', function(req, res){
    console.log("Got vote from "+req.params.id);
    manager.broadcast({type: "registerVote", payload: {
        user: req.params.id
    }});
    res.json({});
});

app.post('/shard/:id/restart', function(req, res){
    const shard = manager.shards.get(manager.shards.keyArray()[req.params.id]);
    if(shard) {
       shard.respawn();
       res.json({success: true});
    }else{
        res.json({success: false});
    }
});


app.listen(port, "127.0.0.1", function(){
   logger.log(`Running broker API server on ${port}`);
});



