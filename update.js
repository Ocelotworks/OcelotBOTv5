const targetVersion = process.env.TARGET_VERSION;
const webhook = process.env.WEBHOOK_URL;
const axios = require('axios');


process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

let messageId;

const interval = 5000;
let count = 0;

let lastUpdatedValue = 0;

async function check(){
    count += interval;
    let result = await axios.get("https://ob-prod-sc.d.int.unacc.eu");
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
        await sendWebhookMessage({
            "content": null,
            "embeds": [
                {
                    "title": "Deployment Complete",
                    "description": `All OcelotBOT shards are now on Version \`${targetVersion}\`.`,
                    "color": 5697536,
                }
            ]
        });
        process.exit(0);
        // TODO: Send changelog here
        return;
    }

    if(interval > 3600000){
        return sendWebhookMessage({
            "content": null,
            "embeds": [
                {
                    "title": "Deployment Stuck",
                    "description": `Not all shards have updated to \`${targetVersion}\` within 1 hour.\nMost likely one host is not updating correctly.`,
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
                    "description": `OcelotBOT Version \`${targetVersion}\` is deploying...`,
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


sendWebhookMessage({
    "content": null,
    "embeds": [
        {
            "title": "Deployment Started",
            "description": `OcelotBOT Version \`${targetVersion}\` has begun deployment.`,
            "color": 3001599
        }
    ]
});
setInterval(check, interval)
