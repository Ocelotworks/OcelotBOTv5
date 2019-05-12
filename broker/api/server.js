/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) server
 *  ════╝
 */
const express = require('express');
module.exports = {
    name: "Server Info",
    base: "/server",
    init: function init(broker) {
        let router = express.Router();
        router.get('/:id/reloadConfig', function(req, res){
            res.json({});
            broker.manager.broadcast({type: "reloadConfig", payload: req.params.id});
        });

        router.get('/:id/channels', function(req, res){
            broker.ipc.requestData("channels", function(channels){
                res.json(channels);
            }, {server: req.params.id});
        });



        return router;
    }
};