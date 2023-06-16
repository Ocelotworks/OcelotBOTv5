const Discord = require("discord.js");
const {axios} = require("../../util/Http");
const config = require("config");
const Util = require("../../util/Util");
const {LangEmbed} = require("../../util/Embeds");
module.exports = {
    name: "Sentry ID",
    usage: "sentry :id",
    commands: ["sentry"],
    run: async function (context, bot) {
        const token = await Util.GetSecret("SENTRY_KEY");
        await context.defer();
        const {status, data: event} = await axios.get(`https://sentry.io/api/0/projects/${config.get("Sentry.org")}/${config.get("Sentry.project")}/events/${context.options.id}/`,{
            headers: {
                authorization: `Bearer ${token}`
            },
            validateStatus: ()=>true
        });

        if(status > 399){
            return context.send(`Error ${status}`)
        }

        const tagsAsObj = event.tags.reduce((o, t)=>{
            o[t.key] = t.value;
            return o;
        }, {});


        const embed = new LangEmbed(context);
        if(event.user)
            embed.setAuthor(`${event.user.username} (${event.user.id})`);
        embed.setTitle(event.title);
        let desc = `\`${event.location}\`\n`
        desc += `[View in Sentry](https://sentry.io/organizations/${config.get("Sentry.org")}/issues/${event.groupID}/?project=${event.projectID})`
        if(event.user)
            desc += ` | [View in Dashboard](https://ocelotbot.xyz/dash-beta/#/admin/user/${event.user.id}\`)`;
        if(tagsAsObj["server_name"] && process.env.PORTAINER_URL){
            const [containerID] = tagsAsObj["server_name"].split("-");
            desc += ` | [View Container](${process.env.PORTAINER_URL}#!/1/docker/containers/${containerID})`;
        }
        if(event.release?.versionInfo?.description)
            desc += ` | [View Release](https://gl.ocelotworks.com/ocelotbot/OcelotBOTv5/-/tags/v${event.release.versionInfo.description})`;
        if(event.context.context){
            desc += `\`\`\`json\n${JSON.stringify(event.context.context)}\n\`\`\``;
        }
        embed.setDescription(desc);
        embed.setTimestamp(new Date(event.dateReceived));
        embed.addFields(event.tags.map((tag)=>({name: tag.key, value: tag.value, inline: true})))
        if(event.release)
            embed.setFooter(event.release.version)
        console.log(status, event);
        const buttons = [];
        if(tagsAsObj["guild"])
            buttons.push(bot.interactions.suggestedCommand(context, `si ${tagsAsObj["guild"]}`));
        if(event.user)
            buttons.push(bot.interactions.suggestedCommand(context, `ui ${event.user.id}`));

        context.send({embeds: [embed], components: [bot.util.actionRow(...buttons)]})
    }
};