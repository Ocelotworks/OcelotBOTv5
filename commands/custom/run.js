// CFC_AUTH_KEY
// CFC_ACCOUNT_ID
// CFC_SIGNING_KEY
const CloudflareWorkers = require("../../util/CloudflareWorkers");
let session;
module.exports = {
    name: "Test Code",
    usage: "run [language?:lua,js] :code+",
    commands: ["run", "test", "compile"],
    run: async function (context, bot) {
        let {code, language} = context.commandData.getCodeBlock(context)
        const actualLanguage = context.options.language || language || "lua";

        if(language === "lua") {
            if (code.length === 0)
                return context.sendLang({content: "CUSTOM_CODE_AMBIGUOUS", ephemeral: true})

            return bot.util.runCustomFunction(code, context, actualLanguage);
        }

        const script = `
        addEventListener('fetch', (event) => {
            event.respondWith(bootstrap(event));  
        });
        
        async function bootstrap(event){
            const data = await event.request.json();       
            return new Response(JSON.stringify(await userCode(data)))
        }
        
        async function userCode(){
            ${code}
        }`

        await context.defer();
        session = await CloudflareWorkers.runPreview(session, context, script);

    }
}