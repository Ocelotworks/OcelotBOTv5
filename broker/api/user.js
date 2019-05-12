/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) user
 *  ════╝
 */
const express = require('express');

module.exports = {
    name: "User Info",
    base: "/user",
    init: function init(broker) {
        let router = express.Router();

        router.get('/:id/registerVote', function registerVote(req, res){
            broker.logger.log("Got vote from "+req.params.id);
            broker.manager.broadcast({type: "registerVote", payload: {
                user: req.params.id
            }});
            res.json({});
        });

        return router;
    }
};