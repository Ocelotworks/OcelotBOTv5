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
            broker.logger.log(`Got vote from ${req.params.id} - ${JSON.stringify(req.query)}`);
            broker.manager.broadcast({type: "registerVote", payload: {
                user: req.params.id,
                ...req.query
            }});
            res.json({});
        });

        router.get('/:id', async function getUser(req, res){
            const userID = req.params.id.replace(/[^0-9]/g, '');
            let user;
            try {
                user = await broker.manager.shards.get(0).eval(`this.users.fetch("${userID}")`);
            }catch(e){
                res.status(404).json({});
                return;
            }
            res.json(user);
        })

        return router;
    }
};