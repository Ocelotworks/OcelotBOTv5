/**
 * Ported by Neil - 30/04/18
 */
const request = require('request');
const {axios} = require('../util/Http');
module.exports = {
    name: "Number Fact",
    usage: "numberfact :0number",
    categories: ["search"],
    rateLimit: 2,
    commands: ["numberfact"],
    run: async function run(context, bot) {
        const result = await axios.get(`http://numbersapi.com/${context.options.number}/`);
        return context.send(result.data);
    }
};