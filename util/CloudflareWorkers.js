const Util = require("./Util");
const axios = require('axios');
const uuid = require('uuid');

Util.LoadSecret("CFC_AUTH_KEY");
Util.LoadSecret("CFC_ACCOUNT_ID");
Util.LoadSecret("CFC_SIGNING_KEY");
Util.LoadSecret("CFC_BASE_URL");
const cf = axios.create({
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CFC_ACCOUNT_ID}/workers/scripts/`,
    headers: {
        'User-Agent': `OcelotBOT ${process.env.VERSION} (https://ocelotbot.xyz)`,
        authorization: `Bearer ${process.env.CFC_AUTH_KEY}`
    },
    validateStatus: ()=>true,
});

module.exports = class CloudflareWorkers {


    static async runPreview(session, context, script){
        const previewWorkerName = `cr-${context.guild.id}-${context.user.id}`;
        const {data} = await cf.post(`${previewWorkerName}/preview`, script, {
            headers: {
                'content-type': 'text/javascript'
            }
        });

        if(!data.success || !data.result?.preview_id){
            console.log("preview failure")
            console.error(data);
            return;
        }

        if(!session) {
            const sessionBuf = Buffer.alloc(16);
            uuid.v4({}, sessionBuf);
            session = sessionBuf.toString('hex');
        }

        const previewId = data.result.preview_id;

        console.log("Preview ID:", previewId);

        const request = await axios.post("https://00000000000000000000000000000000.cloudflareworkers.com/", {
            user: context.user.id,
            channel: context.channel.id,
            guild: context.guild.id
        }, {
            headers: {
                cookie: `__ew_fiddle_preview=${previewId}${session}1${process.env.CFC_BASE_URL}/${previewWorkerName}`
            },
            validateStatus: ()=>true,
        });

        console.log(request.status);
        if(request.status >= 400){
            context.send(`Server responded with ${request.status}: ${request.data}`);
        }else {
            context.send(JSON.stringify(request.data));
        }

        return session;



    }
}
