/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) broker
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   caller_id       = require('caller-id'),
        colors          = require('colors'),
        config          = require('config'),
        Sentry          = require('@sentry/node'),
        path            = require('path'),
        dateFormat      = require('dateformat'),
        apm             = require('elastic-apm-node');
const header = "\n".white+
    "                   k,.';o                                                  o:,';k                   \n"+
    "                   d,;;,,;cdk                                           dc;;;;;,o                   \n"+
    "                   o';;;;;;,,;lk                                    kl;,,,,,,;,'l                   \n"+
    "                   o.,,,,,,,,,'';o0                              0o;'''','',,''.l                   \n"+
    "                   d.'''''''''','.,o   kdolc:;;;;::::::cclox    o,.''.''''''''..d                   \n"+
    "                   k'........'......'::,,;::::::::::::::::;;,::,...............'k                   \n"+
    "                   0,..............',;::::::::::::::::::::::::;,'..............:                    \n"+
    "                    l...........',;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;,'...........o                    \n"+
    "                    k.........',;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;,'........'0                    \n"+
    "                     c.......,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.......l                     \n"+
    "                      '....',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,'....'0                     \n"+
    "                      x...'','',''''''''''''''''''''''''''''''''''''''''''...x                      \n"+
    "                       :..''''''"+",:clc:,".green+"'''''''''''''''''''''''"+":lll:,".green+"''''''..:                       \n"+
    "                      k,.'.''."+"':oxxxxxo;'.".green+"''''''''''''''''.."+";oxxxxxd:'".green+"...''.'x                      \n"+
    "                      :......."+",dxxxxxxxdc".green+".................."+":dxxxxxxxd;".green+".......:                     ©️ 2014-"+new Date().getFullYear()+" Ocelotworks\n"+
    "   000                '......."+":dxxxxxxxxd:".green+"................"+";dxxxxxxxxd:".green+".......'k               000       ocelotworks.com\n"+
    "      0              k'......."+";dxxxxxxxxxo,".green+".............."+",oxxxxxxxxxd;".green+"........x         000000      \n"+
    "           0 kkk     0,........"+";oxxxxxxxxxc".green+".............."+"cxxxxxxxxxo;".green+"........'     00000            \n"+
    "                 xxx 0c.........."+",:lddxxxxo'".green+"............"+"'oxxxxdol:,".green+"..........: 0kk 0                \n"+
    "                   0kxc.............."+"',;;:;".green+".............."+",;;,,'".green+"..............ck                     \n"+
    "                      xl,..................................................'ok                      \n"+
    "                        d,................................................,d                        \n"+
    "                          o,............................................'o                          \n"+
    "                  000000000 dc,......................................,cd 000000000                  \n"+
    "               00               o,................................;o              00 0              \n"+
    "                                   xl;.......................':ok                     0             \n"+
    "                                       ko:,..............;cx0                                       \n";

let broker = {};

function init(){
    if(config.get("APM")){
        apm.start({
            serviceName: config.get("APM.ServiceName"),
            secretToken: config.get("APM.Token"),
            serverUrl: config.get("APM.Server"),
            errorOnAbortedRequests: false,
        })
    }

    broker.logger = {};
    broker.logger.log = function log(message, caller, error){
        if(!caller)
            caller = caller_id.getData();
        let file = ["Nowhere"];
        if(caller.filePath)
            file = caller.filePath.split(path.sep);

        let origin = `[${file[file.length-1]}${caller.functionName ? "/"+caller.functionName : ""}] `.bold;

        if(error)
            console.error(`[BR][${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`.cyan,origin.cyan, message);
        else
            console.log(`[BR][${dateFormat(new Date(), "dd/mm/yy hh:MM")}]`.cyan, origin.cyan, message.cyan);
    };

    broker.logger.error = function error(message){
        broker.logger.log(message.red, caller_id.getData(), true);
    };

    broker.logger.warn = function warn(message){
        broker.logger.log(message.yellow, caller_id.getData());
    };

    broker.logger.info = function warn(message){
        broker.logger.log(message.grey, caller_id.getData());
    };

    broker.logger.log(header);

    Sentry.init({dsn: config.get("Sentry.DSN")})
    broker.raven = Sentry;

    broker.logger.log("Loading "+process.env.NODE_ENV);


    broker.warnings = {};


    loadModules();

}


function loadModules(){
    broker.logger.log("Loading Modules");

    const moduleFiles = config.get("Broker.Modules");
    const modulePath = config.get("Broker.General.ModulePath");

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
                Sentry.configureScope((scope)=>{
                    scope.addBreadcrumb({
                        message: "Start load of module.",
                        category:  "modules",
                        data: {
                            name: loadedModule.name,
                            path: modulePath,
                            file: fileName,
                            moduleFiles: moduleFiles
                        }
                    })
                    loadedModule.init(broker);
                    broker.logger.log(`Loaded module ${loadedModule.name}`);
                });
            }else{
                //If the app has not got these. It's not setup properly.
                //Throw out a warning and skip attempting to load it.
                broker.logger.warn(`${fileName} is not a valid module. Missing 'name' and/or 'init'`);
            }
        }catch(e){
            //Spit the error out and continue loading modules.
            //Modules that depend on the failed module's functions will probably also fail too.
            broker.logger.error(`Error loading ${fileName}:`);
            console.error(e);
        }
    }
}


init();