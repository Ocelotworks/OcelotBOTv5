

module.exports = class SpookRoles {

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
        if(!spooked || !spooked.user.id)return null;
        return {spooked: spooked.user.id};
    }

    static async GetDataForBully(bot, toMember, roleInfo){
        let spooked = await SpookRoles.#getEligibleUser(bot, toMember.guild,1, toMember.user.id);
        if(!spooked || !spooked.user)return null;
        let num = bot.util.intBetween(2, 100);
        return {spooked: spooked.user.id, num};
    }

    static async GetDataForJoker(bot, toMember, roleInfo){
        let [spooked, spooker] = await SpookRoles.#getEligibleUser(bot, toMember.guild, 2, toMember.user.id);
        if(!spooked || !spooked.user || !spooker || !spooker.user)return null;
        let num = bot.util.intBetween(2, 100);
        return {spooker: spooker.user.id, spooked: spooked.user.id, num};
    }

}