module.exports = {
    name: "Kill Shard",
    usage: "killshard",
    commands: ["killshard", "killshart"],
    slashHidden: true,
    run: function () {
        process.exit(0);
    }
};