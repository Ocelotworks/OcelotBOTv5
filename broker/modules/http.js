/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) http
 *  ════╝
 */
const fs = require('fs');
const express = require('express');
const port = process.env.PORT || 3001;
const Sentry = require('@sentry/node');
module.exports = {
    name: "HTTP API",
    init: function (broker) {

        broker.http = express();

        fs.readdir("api", async function readRoutesDir(err, files){
            if(err){
                console.error(err);
                return;
            }

            for(let i = 0; i < files.length; i++){
                try {
                    let route = require(`${__dirname}/../api/${files[i]}`);

                    if(!route.init) {
                        broker.logger.log(`Route ${files[i]} has no init!`);
                        continue
                    }

                    broker.logger.log(`Loading Route ${route.name} (${route.base})`);
                    broker.http.use(route.base, await route.init(broker));
                }catch(e){
                    Sentry.captureException(e);
                    broker.logger.error(`Failed to load ${files[i]}`);
                    console.error(e);
                }
            }
        });

        // broker.http.use(function notFoundHandler(req, res, next){
        //     res.status(404);
        //     broker.logger.warn(`404 on ${req.url}`);
        //     res.send('Not Found');
        // });


        if(process.env.NODE_ENV === "staging"){
            return
             // fuck this shit
        }

        broker.http.listen(port, "127.0.0.1", function(){
            broker.logger.log(`Running broker API server on ${port}`);
        });


    }
};