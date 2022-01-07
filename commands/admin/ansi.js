module.exports = {
    name: "ANSI Test",
    usage: "ansi",
    commands: ["ansi"],
    run: async function (context, bot) {
        let stringTypes = Object.keys(String.prototype);
        return context.send("```ansi\n"+stringTypes.filter((st)=>typeof st === "string").map((st)=>st[st].reset).join("\n")+"```");
    }
};