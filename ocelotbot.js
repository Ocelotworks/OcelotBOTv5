#! /bin/node
/**
 *  OcelotBOT Version 5 (Discord)
 *  Copyright 2018-2021 Ocelotworks
 */


const   config          = require('config'),
        EventEmitter    = require('events'),
        Sentry          = require('@sentry/node'),
        Tracing         = require("@sentry/tracing"),
        os              = require('os'),
        dateFormat      = require('dateformat'),
        _               = require('colors'),
        caller_id       = require('caller-id'),
        path            = require('path')
        express         = require('express');


//The app object is shared between all modules, it will contain any functions the modules expose and also the event bus.
let bot = {};


function configureSentry(){
    bot.logger = {};
    bot.logger.log = function log(message, caller, error){
        if(!caller)
            caller = caller_id.getData();
        let file = ["Nowhere"];
        if(caller.filePath)
            file = caller.filePath.split(path.sep);

        let origin = `[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}] `.bold;

        let shard = bot.util ? bot.util.shard : "??";
        if(shard < 10)
            shard = "0"+shard;
        if(bot.rabbit && bot.rabbit.emit){
            bot.rabbit.emit("log", {
                message: message instanceof Error ? {
                    type: "exception",
                    ...message,
                    name: message.name,
                    message: message.message,
                    stack: message.stack,
                } : message,
                caller,
                error,
                timestamp: new Date(),
                shard: bot.util.shard,
                hostname: os.hostname(),
            });
        }
        let consoleMessage = message;
        if(typeof message === "object" && message.type){
            switch(message.type){
                case "messageSend":
                    // TODO: interactions
                    if(message.message)
                        consoleMessage = `[${message.message.guild?.name || "DM"}] (${message.message.guild?.id}) #${message.message.channel?.name || "DM"} (${message.message.channel?.id}) -> ${message.message.content}`;
                    break;
                case "commandPerformed":
                    if(message.message)
                        consoleMessage = `[${message.message.guild?.name || "DM"}] (${message.message.guild?.id}) ${message.message.author?.username} (${message.message.author?.id}) #${message.message.channel?.name || "DM"} (${message.message.channel?.id}) performed command ${message.command.name}: ${message.message.content}`;
                    if(message.interaction)
                        consoleMessage = `[${message.interaction.guild?.name || "DM"}] (${message.interaction.guild?.id}) ${message.interaction.user?.username} (${message.interaction.user?.id}) #${message.interaction.channel?.name || "DM"} (${message.interaction.channel?.id}) (INTERACTION) performed command ${message.command.name}: ${message.command.content}`;
                    break;
            }
        }
        console[error?"error":"log"](`[${shard}][${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`, origin, consoleMessage);
    };

    bot.logger.error = function error(message){
        if(message) {
            if(typeof message == "object")
                message.level = "error"
            else
                message = {type: "text", message, level: "error"};
            bot.logger.log(message, caller_id.getData(), true);
        }
    };

    bot.logger.warn = function warn(message){
        if(message) {
            if(typeof message == "object")
                message.level = "warn"
            else
                message = {type: "text", message, level: "warn"};
            bot.logger.log(message, caller_id.getData());
        }
    };

    bot.logger.info = function info(message){
        if(message) {
            if(typeof message == "object")
                message.level = "info"
            else
                message = {type: "text", message, level: "info"};
            bot.logger.log(message, caller_id.getData());
        }
    };

    bot.version = `stevie5 Build ${process.env.VERSION}`;

    bot.api = express();
    Sentry.init({
        captureUnhandledRejections: true,
        autoBreadcrumbs: true,
        dsn: config.get("Sentry.DSN"),
        serverName: `${os.hostname()}-${process.env.BOT_ID}-${process.env.SHARD}`,
        release: `ocelotbot@${process.env.VERSION}`,
        integrations: [new Tracing.Integrations.Express({
            app: bot.api
        })],
        tracesSampleRate: 1.0,
        attachStacktrace: true,
    });

    Sentry.setContext("ocelotbot", {
        host: process.env.DOCKER_HOST,
        shard: process.env.SHARD,
        bot: process.env.BOT_ID,
        version: process.env.VERSION,
    })
    bot.api.use(Sentry.Handlers.requestHandler());
    bot.api.use(Sentry.Handlers.tracingHandler());

    bot.raven = Sentry; //Cheeky backwards compatibility
    init();
}

/**
 * Initialise the Chat server
 */
function init(){

    process.env.SHARDS = `[${process.env.SHARD-1}]` // Yes

    process.setMaxListeners(100);
    bot.bus = new EventEmitter();
    loadModules().then(()=>{
        bot.logger.log("All modules loaded!");
        bot.bus.emit("modulesLoaded");
    })
}


/**
 * Loads the module files from the specified directory in config `General.ModulePath`
 * The modules are loaded in the order they are in config `Modules`
 */
async function loadModules(){
    bot.logger.log("Loading modules...");
    const moduleFiles = config.get("Modules");
    const modulePath = config.get("General.ModulePath");

    //Attempt to load each module file
    for(let i = 0; i < moduleFiles.length; i++){
        const fileName = moduleFiles[i];
        //The module loading is wrapped in a try/catch incase the module fails to load, the server will still run.
        try{
            let loadedModule = require(`.${modulePath}/${fileName}.js`);
            if(loadedModule instanceof Function){
                bot.logger.log("Detected class-style module "+loadedModule.name);
                loadedModule = new loadedModule(bot);
            }else if(!loadedModule.name || !loadedModule.init){
                console.log(loadedModule);
                //If the app has not got these. It's not setup properly.
                //Throw out a warning and skip attempting to load it.
                bot.logger.warn(`${fileName} is not a valid module. Missing 'name' and/or 'init'`);
                continue;
            }
            //Here the module itself starts execution. In the future we might want to do this asynchronously.
            //The app object is passed to the
            Sentry.configureScope(function initModule(scope){
                scope.addBreadcrumb({
                    category: 'modules',
                    message: 'Loading module.',
                    level: Sentry.Severity.Info,
                    data: {
                        name: loadedModule.name,
                        path: modulePath,
                        file: fileName,
                        moduleFiles: moduleFiles
                    }
                });
            });
            if(loadedModule.async)
                await loadedModule.init(bot);
            else
                loadedModule.init(bot);
            bot.logger.log(`Loaded module ${loadedModule.name}`);
        }catch(e){
            //Spit the error out and continue loading modules.
            //Modules that depend on the failed module's functions will probably also fail too.
            bot.logger.error(`Error loading ${fileName}:`);
            console.error(e);
            if(bot.client && bot.client.shard) {
                bot.rabbit.event({
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
    Sentry.captureException(error);
});

//Start the app.
configureSentry();
