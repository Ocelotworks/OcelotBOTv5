

module.exports = class Discord {

    static RoleRegex = /<@&(\d{17,19})>/g;

    /**
     * Finds a role given it's ID or it's name, or a mention
     * @param {Guild} guild
     * @param {*} target The Name, ID or mention
     * @returns {Role | null}
     * @constructor
     */
    static ResolveRole(guild, target){
        if(typeof target === "string") {
            const mention = Discord.RoleRegex.exec(target)
            if(mention) {
                return guild.roles.fetch(mention[1]).catch(()=>null);
            }
            target = target.toLowerCase();
        }
        return guild.roles.fetch().then(r=>r.find((role)=>role.name.toLowerCase() === target || role.id === target));
    }
}