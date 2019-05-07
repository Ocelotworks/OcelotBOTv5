/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) sub
 *  ════╝
 */
const express = require('express');
module.exports = {
    name: "Subscriptions Handler",
    base: "/sub",
    init: function init(broker) {
        let router = express.Router();
        router.post('/handle', function(req, res){
            console.log(req.body);
            res.json({});
        });

        router.post('/:id/trigger', function(req, res){
            broker.manager.broadcase({
                type: "triggerSub",
                payload: {
                    id: req.params.id,
                    body: req.body
                }
            });
            res.json({});
        });



        return router;
    }
};