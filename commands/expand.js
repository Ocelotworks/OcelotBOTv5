/**
 * Created by Peter on 01/07/2017.
 */
module.exports = {
    name: "Expand",
    usage: "expand :word+",
    commands: ["expand"],
    categories: ["text", "fun"],
    detailedHelp: "Makes the text look like t h i s ",
    usageExample: "expand aesthetic",
    responseExample: "a e s t h e t i c",
    run: function run(context) {
        return context.send([...context.options.word].join(" "));
    }
};