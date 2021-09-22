

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


    static async #getEligibleUser(bot, guild, num){
        return guild.members.fetch().then((ms)=>ms.filter((m)=>!m.user.bot && !bot.config.getBool(guild.id, "spook.optout", m.id) && m.presence && m.presence?.status !== "offline")).then(r=>r.random(num));
    }

    static async GetDataForBodyguard(bot, toMember, roleInfo){
        let spooked = await SpookRoles.#getEligibleUser(bot, toMember.guild);
        if(!spooked)return null;
        return {spooked: spooked.id};
    }

    static async GetDataForBully(bot, toMember, roleInfo){
        let spooked = await SpookRoles.#getEligibleUser(bot, toMember.guild);
        if(!spooked)return null;
        let num = bot.util.intBetween(2, 100);
        return {spooked: spooked.id, num};
    }

    static async GetDataForJoker(bot, toMember, roleInfo){
        let [spooked, spooker] = await SpookRoles.#getEligibleUser(bot, toMember.guild, 2);
        if(!spooked || !spooker)return null;
        let num = bot.util.intBetween(2, 100);
        return {spooker: spooker.id, spooked: spooked.id, num};
    }

}