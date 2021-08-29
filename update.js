const targetVersion = process.env.TARGET_VERSION;
const webhook = process.env.RELEASE_WEBHOOK_URL;
const changelogWebhook = process.env.RELEASE_CHANGELOG_URL;
const axios = require('axios');
const fs = require('fs');
const botName = process.env.BOT_NAME;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

let messageId;

const interval = 5000;
let count = 0;

let lastUpdatedValue = 0;

async function check(){
    count += interval;
    let result = await axios.get(process.env.RELEASE_API_URL);
    let keys = Object.keys(result.data);
    let updated = [];
    let waiting = [];
    for(let i = 0; i < keys.length; i++){
        let shard = result.data[keys[i]];
        let hasUpdated = false;
        for(let s = 0; s < shard.length; s++){
            if(shard[s].version === targetVersion){
                updated.push(shard[s]);
                hasUpdated = true;
            }else if(!hasUpdated){
                waiting.push(shard[s]);
            }
        }
    }

    if(waiting.length === 0){
        console.log("Waiting complete");
        await sendWebhookMessage({
            "content": null,
            "embeds": [
                {
                    "title": "Deployment Complete",
                    "description": `All ${botName} shards are now on Version \`${targetVersion}\`.`,
                    "color": 5697536,
                }
            ]
        });
        try{
            if(!changelogWebhook)return console.log("Skipping changelog because no changelog webhook");
            const changelog = loadChangelog();
            if(changelog.indexOf("NO CHANGELOG") > -1)return console.log("Skipping changelog because NO CHANGELOG was present");
            const result = await axios.post(changelogWebhook, {content: changelog.substring(0, 2000)});
            console.log("Posted changelog");
            console.log(result.data);
        }catch(e){
            console.error(e);
        }
        process.exit(0);
        return;
    }

    if(count > 1800000 ){
        return sendWebhookMessage({
            "content": null,
            "embeds": [
                {
                    "title": "Deployment Stuck",
                    "description": `Not all ${botName} shards have updated to \`${targetVersion}\` within 30 minutes.\nMost likely one host is not updating correctly.`,
                    "color": 16726072,
                    "fields": [
                        {
                            "name": `${waiting.length} Waiting`,
                            "value": mapShards(waiting)
                        },
                        {
                            "name": `${updated.length} Updated`,
                            "value": mapShards(updated)
                        }
                    ]
                }
            ]
        });
        process.exit(0);
        return;
    }

    if(updated.length > 0 && updated.length !== lastUpdatedValue){
        lastUpdatedValue = updated.length;
        return sendWebhookMessage({
            "content": null,
            "embeds": [
                {
                    "title": "Deployment Progress",
                    "description": `${botName} Version \`${targetVersion}\` is deploying...`,
                    "color": 16757506,
                    "fields": [
                        {
                            "name": `${waiting.length} Waiting`,
                            "value": mapShards(waiting)
                        },
                        {
                            "name": `${updated.length} Updated`,
                            "value": mapShards(updated)
                        }
                    ]
                }
            ]
        });
    }
}

function mapShards(shards){
    if(shards.length < 5){
        return shards.map((s)=>`${s.shard} (${s.dockerHost})`).join("\n");
    }
    return shards.map((s)=>s.shard).join(", ");
}


async function sendWebhookMessage(data){
    if(messageId){
        return axios.patch(`${webhook}/messages/${messageId}`, data);
    }

    let result = await axios.post(webhook+"?wait=true", data);
    messageId = result?.data?.id;
}


function loadChangelog(){
    const file = fs.readFileSync("CHANGELOG.md").toString();
    return file
        .substring(file.indexOf("-->")+5)
        .replace(/^## (.*)\n/gm, `**Release \`v$1\`:**\n`)
        .replace(/^### (.*)\n/gm, "**$1**")
        .replace(/ \(.*\)(\n|$)/gm, "\n");
}

sendWebhookMessage({
    "content": null,
    "embeds": [
        {
            "title": "Deployment Started",
            "description": `${botName} Version \`${targetVersion}\` has begun deployment.`,
            "color": 3001599
        }
    ]
});
setInterval(check, interval)
