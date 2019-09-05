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
        Raven           = require('raven'),
        os              = require('os'),
        fs              = require('fs'),
        path            = require('path'),
        dateFormat      = require('dateformat');

const header ="\n".white+
    "                `-+shdmNMMMMNmdhs+-`              \n" +
    "            :smMMMMmdyssoossydmMMMMms:            \n" +
    "         :yNMMmy+-              -+ymMMNy:         \n" +
    "       /mMMMm/                      -omMMm/       \n" +
    "     -mMMMMMMMNy:                 .odNMMMMMm-     \n" +
    "    sMMNdMMMMMMMMh``-:/++++/:-` .yMMMMMMMMMMMs    \n" +
    "  `dMMh`/MMMMMMMMMMMMMMMMMMMMMMNNMMMMMMMMM-hMMh`  \n" +
    "  dMMs   sMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMo  sMMd  \n" +
    " sMMy     /NMMMMMMMMMMMMMMMMMMMmmNMMMMMm:    yMMs \n" +
    "-MMN`     :MMMMd"+"ssss".green+"hNMMMMMMNy"+"ssssy".green+"MMMM/     `NMM-\t© Copyright 2014-2019\n" +
    "yMMo      NMMMMh"+"sssss".green+"yMMMMMMd"+"sssss".green+"mMMMMN      oMMy\tOcelotworks\n" +
    "mMM:...--:MMMMMMN"+"dddd".green+"NMMMMMMM"+"mddm".green+"MMMMMMM:----.:MMm\tpetermaguire.xyz\n" +
    "MMMyysssssmMMMMMMMMMMMMMMMMMMMMMMMMMMMMmosssssyMMM\n" +
    "NMM.      .mMMMMMMMMMMMMMMMMMMMMMMMMMMm.      .MMN\n" +
    "hMM/       `sMMMMMMMMMMMMMMMMMMMMMMMMs`       /MMh\n" +
    "/MMd         `odMMMMMMMMMMMMMMMMMMmo`         dMM/\n" +
    " mMM/           .sMMMMMMMMMMMMMN+.           /MMm \n" +
    " -NMN-         /mMMMMMMMMMMMMMMMMy.         -NMN- \n" +
    "  :NMN:       yMMMMMMMMMMMMMMMMMMMMo       :NMN:  \n" +
    "   -mMMs`    sMMMMMMMMMMMMMMMMMMMMMMs    `sMMm-   \n" +
    "    `yMMm/  `MMMMMMMMMMMMMMMMMMMMMMMM-  /mMMy`    \n" +
    "      -dMMmo-MMMMMMMMMMMMMMMMMMMMMMMMsomMMd-      \n" +
    "        -yMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMy-        \n" +
    "          `/hNMMMMMMMMMMMMMMMMMMMMMMNh/`          \n" +
    "              -+ydNMMMMMMMMMMMMNdy+-              \n" +
    "                   `-://++//:-`      ";



let broker = {};

function init(){
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


    Raven.config(config.get("Raven.DSN"), {
        environment: os.hostname() === "Jupiter" ? "production" : "development"
    }).install();
    broker.raven = Raven;


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
                broker.raven.context(function initModule(){
                    broker.raven.captureBreadcrumb({
                        message: "Start load of module.",
                        category:  "modules",
                        data: {
                            name: loadedModule.name,
                            path: modulePath,
                            file: fileName,
                            moduleFiles: moduleFiles
                        }
                    });
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