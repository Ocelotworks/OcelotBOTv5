module.exports = class Util {
    /**
     * Returns slash command options given an ocelotbot pattern
     * @param pattern
     * @param argDescriptions
     * @constructor
     */
    static PatternToOptions(pattern, argDescriptions = {}){
        let output = [];
        for(let i = 0; i < pattern.length; i++){
            const argument = pattern[i];
            let option = {
                name: argument.name,
                description: argDescriptions[argument.name] || argument.name,
                required: !argument.optional,
            };
            if(argument.type === "single"){
                option.type = "STRING";
            }else if(argument.type === "option") {
                option.choices = argument.options.map((option)=>({name: argDescriptions[option] || option, value: option}))
            }else{
                option.type = "STRING";
                console.log("TODO: argument.type ", argument.type);
            }
            output.push(option);
        }
        return output;
    }
}