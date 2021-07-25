const config = require('config')
const Util = require("../util/Util");
const {axios} = require('../util/Http');
const FormData = require('form-data');
const Embeds = require("../util/Embeds");
module.exports = {
    name: "Summarise Chat",
    usage: "summarise",
    detailedHelp: "Generates a summary of the last 100 messages",
    usageExample: "summarise",
    //responseExample: "",
    categories: ["tools"],
    rateLimit: 30,
    commands: ["summarise", "summarize", "summary"],
    requiredPermissions: ["READ_MESSAGE_HISTORY", "EMBED_LINKS"],
    run: async function run(context, bot) {
        const messages = await Util.FetchMessages(context.channel, 200);
        const content = messages.map((m)=>`<${m.author.username}>: ${m.cleanContent}`).join("\n");
        let formData = new FormData();
        formData.append("sm_api_input", content);
        let {data} = await axios.post(`https://api.smmry.com/?SM_API_KEY=${config.get("API.smmry.key")}`, formData, {headers: formData.getHeaders()});
        const embed = new Embeds.AuthorEmbed(context);
        embed.setTitle("Here is a summary of the last 200 messages:");
        embed.setDescription(data.sm_api_content.replace(/</g, "\n<"));
        embed.setFooter(`Reduced by ${data.sm_api_content_reduced}`);
        return context.send({embeds: [embed]});
    }
};