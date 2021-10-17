let challengeListeners = [];
module.exports = {
    name: "Points",
    usage: "points",
    categories: ["meta"],
    detailedHelp: "View the amount of points you have",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["points"],
    nestedDir: "points",
    init: async function init(bot){
        bot.addCommandMiddleware(async (context)=>{
            if(context.getBool("serverPremium"))return true;
            if(!context.getBool("points.enabled"))return true;
            if(!context.commandData.pointsCost)return true;
            const canUse = await bot.database.takePoints(context.user.id, context.commandData.pointsCost, context.commandData.id);
            if (!canUse)
                context.replyLang({content: "POINTS_REQUIRED", ephemeral: true}, {required: context.commandData.pointsCost})
            return canUse;
        }, "Points Cost")

        bot.bus.on("reloadChallenges", async () => {
            bot.logger.log("Reloading challenges...");
            for(let i = 0; i < challengeListeners.length; i++){
                const listener = challengeListeners[i];
                bot.bus.removeListener(listener.challengeType.event, listener.listener);
                bot.logger.log(`Removing existing listener for ${listener.challengeType.event}`);
            }
            await module.exports.loadChallengeTypes(bot);
        })

        return module.exports.loadChallengeTypes(bot);
    },
    async loadChallengeTypes(bot){
        let challengeTypes = await bot.database.getPointsChallengeTypes();
        for(let i = 0; i < challengeTypes.length; i++){
            const challengeType = challengeTypes[i];
            try {
                let challengeFunction = eval(`(user, data, context, challenge) => ${challengeType.completionLogic}`);
                let listener = async (user, data, context) => {
                    const activeChallenges = await bot.database.getPointsChallengesByType(challengeType.id);
                    for (let i = 0; i < activeChallenges.length; i++) {
                        const challenge = activeChallenges[i];
                        try {
                            if (!challengeFunction(user, data, context, challenge)) continue; // Check for a valid advancement to the challenge
                            bot.logger.log(`${user.id} advanced in the challenge`);
                            let currentProgress = await bot.database.getChallengeLog(user.id, challenge.id);
                            if (!currentProgress) currentProgress = {
                                complete: false,
                                progress: 0,
                                challenge: challenge.id,
                                user: user.id
                            }; // Create a challenge object now
                            if (currentProgress.complete) continue; // Don't bother if the challenge is already complete
                            // Increment the progress
                            currentProgress.progress++;
                            // Check if challenge is completed
                            if (currentProgress.progress >= challenge.challenge_value) {
                                currentProgress.complete = true;
                                bot.bus.emit("challengeCompleted", user, data, context, challenge);
                                await bot.database.addPoints(user.id, challenge.reward_value, `completed challenge ${challenge.id}`);
                                context.sendLang("POINTS_CHALLENGE_COMPLETE", {user, challenge});
                            }
                            if (currentProgress.timestamp)
                                await bot.database.updateChallengeLog(currentProgress.user, currentProgress.challenge, currentProgress.progress, currentProgress.complete);
                            else
                                await bot.database.addChallengeLog(currentProgress);
                        } catch (e) {
                            bot.logger.log(`Error running challenge ${challenge.id}`);
                            bot.logger.error(e);
                        }
                    }
                };
                challengeListeners.push({listener, challengeType});
                bot.bus.on(challengeType.event, listener);
            }catch(e){
                bot.logger.log(`Error setting listener for challengeType ${challengeType.id}`);
                bot.logger.error(e);
            }

        }
    }
};