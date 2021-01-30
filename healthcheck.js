const axios = require('axios');


axios.get("http://localhost:8006/stats").then((res)=>{
    if(res.status !== 200){
        console.error("Bad status code ", res.status);
        process.exit(1);
    }

    if(res.data.messagesPerMinute < (process.env.HEALTHCHECK_MESSAGES_PER_MINUTE || 5)){
        console.error("Messages per minute: ", res.data.messagesPerMinute)
        process.exit(1);
    }
}).catch((err)=>{
    console.error(err);
    process.exit(1);
})