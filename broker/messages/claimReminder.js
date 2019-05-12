/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) claimReminder
 *  ════╝
 */
module.exports = {
    name: "Claim Reminder",
    id: "claimReminder",
    init: function init(broker){
      broker.claimedReminders = [];
    },
    received: function received(broker, shard, payload){
        broker.claimedReminders.push(payload);

        if(broker.claimedReminderTimeout)
            clearTimeout(broker.claimedReminderTimeout);

        broker.claimedReminderTimeout = setTimeout(function handleClaimedReminders(){
            broker.logger.log(`Got ${broker.claimedReminders.length} claimed reminders`);
            broker.manager.broadcast({type: "handleClaimedReminders", payload: broker.claimedReminders});
        }, 60000);

    }
};