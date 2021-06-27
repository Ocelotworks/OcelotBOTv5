/**
 * @typedef {{string: string, name: string, id: string, url: string}} icon
 */

/**
 * Constructs an Icon
 * @param name {string}
 * @param id {string}
 * @param animated {boolean}
 * @returns {icon}
 */
function constructIcon(name, id, animated = false){
    return {
        name, id,
        url: `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?v=1`,
        string: `<${animated ? "a":""}:${name}:${id}>`,
        toString(){
            return this.string;
        }
    }
}

/**
 * OcelotBOT emote icons
 * @type {Object.<string, icon>}
 */
let icons = {
    points: constructIcon("points", "817100139603820614"),
    points_off: constructIcon("points_off", "825695949790904330"),
    points_ending: constructIcon("points_ending", "825704034031501322", true),

}

module.exports = icons;