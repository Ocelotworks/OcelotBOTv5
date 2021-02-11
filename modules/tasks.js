/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 12/09/2019
 * ╚════ ║   (ocelotbotv5) tasks
 *  ════╝
 */
module.exports = {
    name: "Task Manager",
    init: function (bot) {
        bot.tasks = {};

        bot.tasks.running = [];
        bot.tasks.taskTimers = {};


        bot.api.get("/tasks", (req, res)=>{
            res.json(bot.tasks.running);
        });


        process.on('exit', async (code)=>{
            bot.logger.log("Waiting for tasks to end to quit");
            setInterval(()=>{
                if(bot.tasks.running.length === 0)
                    process.exit(0);
                else
                    bot.logger.warn(`Cannot quit - there are still ${bot.tasks.running.length} tasks!`);
            }, 1000)
        })

        bot.tasks.startTask = function startTask(name, id) {
            if (bot.tasks.hasTask(name, id))
                return bot.logger.warn(`Task ${name} ${id} already exists!`);
            bot.tasks.running.push(name + id);
            bot.tasks.taskTimers[name + id] = setTimeout(function taskTimeout() {
                bot.logger.warn(`Task ${name}-${id} did not end!`);
                bot.tasks.endTask(name, id);
            }, 1500000);
            bot.logger.info(`Started task ${name} (${id})`);
            try {
                bot.rabbit.event({type: "tasksClear", payload: false});
            }catch(e){
                bot.raven.captureException(e);
                if(e.message && e.message.includes("Channel closed")){
                    process.exit(1)
                }
            }
        };


        bot.tasks.hasTask = function hasTask(name, id) {
            return bot.tasks.getTaskIndex(name, id) > -1;
        };

        bot.tasks.getTaskIndex = function getTaskIndex(name, id) {
            return bot.tasks.running.indexOf(name + id);
        };

        bot.tasks.renewTask = function renewTask(name, id){
            const index = bot.tasks.getTaskIndex(name, id);
            if (index === -1)
                return bot.logger.warn(`Task ${name} ${id} doesn't exist!`);
            if (bot.tasks.taskTimers[name + id])
                clearTimeout(bot.tasks.taskTimers[name + id]);
            bot.tasks.taskTimers[name + id] = setTimeout(function taskTimeout() {
                bot.logger.warn(`Task ${name}-${id} did not end!`);
                bot.tasks.endTask(name, id);
            }, 1500000);
        }

        bot.tasks.endTask = function endTask(name, id) {
            const index = bot.tasks.getTaskIndex(name, id);
            if (index === -1)
                return bot.logger.warn(`Task ${name} ${id} doesn't exist!`);
            if (bot.tasks.taskTimers[name + id])
                clearTimeout(bot.tasks.taskTimers[name + id]);
            bot.logger.info(`Ended task ${name} (${id})`);
            bot.tasks.running.splice(index, 1);
            if(bot.drain && bot.tasks.length === 0) {
                console.log("all tasks are finished")
                process.exit(1);
            }
            try {
                bot.rabbit.event({type: "tasksClear", payload: true});
            }catch(e){
                bot.raven.captureException(e);
                if(e.message && e.message.includes("Channel closed")){
                    process.exit(1);
                }
            }
        };
    }
};
