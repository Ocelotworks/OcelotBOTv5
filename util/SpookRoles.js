

module.exports = class SpookRoles {

    static BadgeMap = {
        "joker": 78,
        "sab": 79,
        "bodyguard": 80,
        "bully": 81,

    }

    static roleFunctions = {
        "bodyguard": SpookRoles.GetDataForBodyguard,
        "sab": SpookRoles.GetDataForBodyguard,
        "bully": SpookRoles.GetDataForBully,
        "joker": SpookRoles.GetDataForJoker,
    }


    static GetDataForSpookRole(bot, toMember, roleInfo){
        return SpookRoles.roleFunctions[roleInfo.id](bot, toMember, roleInfo);
    }

    static async #getEligibleUser(bot, guild, num, user){
        return guild.members.fetch().then((ms)=>ms.filter((m)=>!m.user.bot && !bot.config.getBool(guild.id, "spook.optout", m.id) && m.presence && m.presence?.status !== "offline" && m.user.id !== user)).then(r=>r.random(num));
    }

    static async GetDataForBodyguard(bot, toMember, roleInfo){
        let spooked = await SpookRoles.#getEligibleUser(bot, toMember.guild, 1, toMember.user.id);
        if(!spooked || !spooked.user)return null;
        return {spooked: spooked.user.id};
    }

    static async GetDataForBully(bot, toMember, roleInfo){
        let spooked = await SpookRoles.#getEligibleUser(bot, toMember.guild,1, toMember.user.id);
        if(!spooked || !spooked.user)return null;
        let num = bot.util.intBetween(2, 50);
        return {spooked: spooked.user.id, num};
    }

    static async GetDataForJoker(bot, toMember, roleInfo){
        let [spooked, spooker] = await SpookRoles.#getEligibleUser(bot, toMember.guild, 2, toMember.user.id);
        if(!spooked || !spooked.user || !spooker || !spooker.user)return null;
        let num = bot.util.intBetween(2, 50);
        return {spooker: spooker.user.id, spooked: spooked.user.id, num};
    }

    static successFunctions = {
        "bodyguard": SpookRoles.GetSuccessForBodyguard(),
        "sab": SpookRoles.GetSuccessForSab(),
        "bully": SpookRoles.GetSuccessForBully(),
        "joker": SpookRoles.GetSuccessForJoker(),
    }


    static WasSuccessful(bot, roleData){
        return SpookRoles.successFunctions[roleData.role](bot, roleData);
    }

    static async GetSuccessForBodyguard(bot, roleData){
        return (await bot.database.getSpookedCountBySpooked(roleData.serverID, roleData.data.spooked)) === 0;
    }

    static async GetSuccessForBully(bot, roleData){
        return (await bot.database.getSpookedCountBySpookerAndSpooked(roleData.serverID, roleData.userID, roleData.data.spooked)) === roleData.data.num;
    }

    static async GetSuccessForJoker(bot, roleData){
        return (await bot.database.getSpookedCountBySpookerAndSpooked(roleData.serverID, roleData.data.spooker, roleData.data.spooked)) === roleData.data.num;
    }

    static async GetSuccessForSab(bot, roleData){
        let spookLoser = await bot.redis.cache(`spook/loser/${roleData.serverID}`, async ()=>await bot.database.getSpooked(roleData.serverID), 60000);
        return spookLoser === roleData.data.spooked;
    }
}