const archiver = require('archiver');
const fs = require('fs');
const Discord = require('discord.js')
module.exports = {
    name: "Export Your Data",
    usage: "export",
    commands: ["dataexport", "export", "gdpr", "data", "downloadmydata"],
    run: async function (context, bot) {
        if(await bot.redis.get(`gdpr/${context.user.id}`).catch(()=>null)){
            return context.send({content: "You have done a Data Request recently. Please wait a while before doing another.", ephemeral: true});
        }

        bot.redis.set(`gdpr/${context.user.id}`, 1, 86400000)

        bot.database.dataExport(context.user.id).then(async (data)=>{
            const dm = await context.user.createDM();
            const path = `${__dirname}/../../temp/${context.user.id}.zip`;
            bot.logger.log(`Zipping to ${path}`);
            const archive = archiver('zip', {zlib: {level: 9}});

            archive.on("end", async ()=>{
                bot.logger.log(`Uploading data export...`);
                await dm.send({content: `📥 The Data Export you requested in <#${context.channel.id}> has finished processing.\nIf you have any questions about the contents of the export, or wish to permanently delete your data, contact Big P#1843`, files:[new Discord.MessageAttachment(path, "export.zip")]}).catch(console.error);
                bot.logger.log(`Sent successfully!`);
                fs.unlink(path, console.log);
            })

            const output = fs.createWriteStream(path);
            archive.pipe(output);
            const exportNames = Object.keys(data);
            for(let i = 0; i < exportNames.length; i++){
                const name = exportNames[i];
                if(data[name].length === 0)continue;
                bot.logger.log(`Converting ${name} to csv...`);
                archive.append(objectToCsv(data[name]), {name: `${name}.csv`});
            }
            archive.finalize();
        }).catch((e)=>{
            console.error(e);
            bot.raven.captureException(e);
        });
        return context.send({content: "Your data export is processing. A zip file will be DM'ed to you when it is ready.", ephemeral: true});
    }
};

function objectToCsv(obj){
    const rows = Object.keys(obj[0]);
    let output = rows.join(",")+"\n";
    for(let o = 0; o < obj.length; o++) {
        for (let i = 0; i < rows.length; i++) {
            const key = rows[i];
            const data = obj[o][key];

            if(typeof data === "string" && data.indexOf(",") > -1)
                output += `"${data.replace(/"/g, `""`)}"`;
            else
                output += data;
            output += ",";
        }
        output += "\n";
    }
    return output;
}