#! /bin/node
/**
 *  OcelotBOT Version 5 (Discord)
 *  Copyright 2018 Ocelotworks
 */


const   config          = require('config'),
        EventEmitter    = require('events'),
        logger          = require('ocelot-logger'),
        Raven           = require('raven');

//The app object is shared between all modules, it will contain any functions the modules expose and also the event bus.
let bot = {};


/**
 * Initialise the Chat server
 */
function init(){
    bot.bus = new EventEmitter();
    bot.logger = logger;

    bot.admins = ["139871249567318017", "145200249005277184"];

    Raven.config(config.get("Raven.DSN")).install();
    bot.raven = Raven;


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
        }
    }
}

process.on('unhandledRejection', error => {
    console.error(error);
});

//Start the app.
init();
