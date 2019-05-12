/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) shard.js
 *  ════╝
 */

const express = require('express');

 module.exports = {
     name: "Shard Info",
     base: "/shard",
     init: function init(broker){
         let router = express.Router();

         router.get('/', function(req, res){
             let output = [];
             broker.manager.shards.forEach(function(shard){
                 output.push({
                     id: shard.id,
                     ready: shard.ready
                 });
             });
             res.json(output);
         });

         router.get('/shard/count', function(req, res){
             res.json({count: broker.manager.totalShards});
         });


         router.get('/:id', function(req, res){
             const shard = broker.manager.shards.get(broker.manager.shards.keyArray()[req.params.id]);
             if(shard) {
                 res.json({
                     id: shard.id,
                     ready: shard.ready
                 });
             }else{
                 res.json({});
             }
         });

         router.get('/:id/restart', function(req, res){
             const shard = broker.manager.shards.get(broker.manager.shards.keyArray()[req.params.id]);
             if(shard) {
                 shard.respawn();
                 res.json({success: true});
             }else{
                 res.json({success: false});
             }
         });

         router.get('/:id/:field', function(req, res){
             const shard = broker.manager.shards.get(broker.manager.shards.keyArray()[req.params.id]);
             if(shard) {
                 broker.ipc.requestData(req.params.field, function(resp){
                     res.json(resp);
                 }, {shard: req.params.id});
             }else{
                 res.json({});
             }
         });

         return router;
     }
 };