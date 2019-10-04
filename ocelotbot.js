#! /bin/node
/**
 *  OcelotBOT Version 5 (Discord)
 *  Copyright 2018 Ocelotworks
 */


const   config          = require('config'),
        EventEmitter    = require('events'),
        logger          = require('ocelot-logger'),
        Raven           = require('raven'),
        os              = require('os'),
        dateFormat      = require('dateformat'),
        colors          = require('colors'),
        caller_id       = require('caller-id'),
        path            = require('path'),
        tracer          = require('dd-trace');


//The app object is shared between all modules, it will contain any functions the modules expose and also the event bus.
let bot = {};


/**
 * Initialise the Chat server
 */
function init(){
    tracer.init({analytics: true});
    process.setMaxListeners(100);

    bot.bus = new EventEmitter();

    bot.admins = ["139871249567318017", "145200249005277184", "318431870666932225", "145193838829371393"];

    Raven.config(config.get("Raven.DSN"), {
        environment: os.hostname() === "Jupiter" ? "production" : "development",
        captureUnhandledRejections: true,
        autoBreadcrumbs: true
    }).install();
    bot.raven = Raven;

    bot.logger = {};
    bot.logger.log = function log(message, caller, error){
        if(!caller)
            caller = caller_id.getData();
        let file = ["Nowhere"];
        if(caller.filePath)
            file = caller.filePath.split(path.sep);

        let origin = `[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}] `.bold;

        // if(typeof message === 'object')
        //     console.log(message);
        // let output = origin+message;
        let shard = "?";
        if(bot.client && bot.client.shard){
            shard = bot.client.shard.id;
            if(shard < 10)
                shard = "0"+shard;
        }
        if(error)
            console.error(`[${shard}][${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`,origin, message);
        else
            console.log(`[${shard}][${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`, origin, message);
    };

    bot.logger.error = function error(message){
        bot.logger.log(message.red, caller_id.getData(), true);
    };

    bot.logger.warn = function warn(message){
        bot.logger.log(message.yellow, caller_id.getData());
    };

    bot.logger.info = function warn(message){
        bot.logger.log(message.grey, caller_id.getData());
    };


    loadModules();
}


/**
 * Loads the module files from the specified directory in config `General.ModulePath`
 * The modules are loaded in the order they are in config `Modules`
 */
function loadModules(){
    logger.log("Loading modules");
    const moduleFiles = config.get("Modules");
    const modulePath = config.get("General.ModulePath");

    //Attempt to load each module file
    for(let i = 0; i < moduleFiles.length; i++){
        const fileName = moduleFiles[i];
        //The module loading is wrapped in a try/catch incase the module fails to load, the server will still run.
        try{
            let loadedModule = require(`.${modulePath}/${fileName}.js`);
            //Check that the module has `name` and `init` values
            if(loadedModule.name && loadedModule.init){
                //Here the module itself starts execution. In the future we might want to do this asynchronously.
                //The app object is passed to the
                bot.raven.context(function initModule(){
                    bot.raven.captureBreadcrumb({
                        message: "Start load of module.",
                        category:  "modules",
                        data: {
                            name: loadedModule.name,
                            path: modulePath,
                            file: fileName,
                            moduleFiles: moduleFiles
                        }
                    });
                    loadedModule.init(bot);
                    logger.log(`Loaded module ${loadedModule.name}`);
                });
            }else{
                //If the app has not got these. It's not setup properly.
                //Throw out a warning and skip attempting to load it.
                logger.warn(`${fileName} is not a valid module. Missing 'name' and/or 'init'`);
            }
        }catch(e){
            //Spit the error out and continue loading modules.
            //Modules that depend on the failed module's functions will probably also fail too.
            logger.error(`Error loading ${fileName}:`);
            console.error(e);
            if(bot.client && bot.client.shard) {
                bot.client.shard.send({
                    type: "warning", payload: {
                        id: "badModule-" + fileName,
                        message: `Couldn't load module ${module}:\n${e.message}`
                    }
                });
            }
        }
    }
}

process.on('unhandledRejection', error => {
    console.error(error);
});

//Start the app.
init();
