const responses = [
    "it take square ass to shit brick",
    "man who fart in church sit in own pew",
    "man who stand on toilet gets high on pot",
    "man who fly upside down have crackup",
    "man who run behind car get exhausted",
    "boy who go to sleep with sex problem wake up with solution in hand",
    "man with athletic finger make broad jump",
    "squirrel who run up womans legs not find nuts",
    "boy with hole in pocket feel cocky all day",
    "man with woman on ground have piece on earth",
    "man who go to bed with itchy butt wake up with smelly finger",
    "man who take lady on camping trip have one intent",
    "he who eats many prunes sit on toilet many moons",
    "he who makes beans and peas in same pot very unsanitary",
    "he who walk through airport door sideways going to bangcok",
    "man who drop watch in toilet have shitty time",
    "man who sneeze without tissue take matters into his own hands",
    "lady who live in glass house, dress in basement",
    "couple on seven day honeymoon make whole week",
    "learn to masturbate - come in handy",
    "he who laughs last does not get joke",
    "man who sits on thumbtack will get the point",
];


module.exports = {
    name: "Wise Advice",
    usage: "advice",
    rateLimit: 10,
    detailedHelp: "Get some great advice from the wise elders.",
    usageExample: "advice",
    responseExample: "📜 `man who fart in church sit in own pew`",
    categories: ["fun"],
    commands: ["advice", "advise", "wise"],
    run: function (context, bot) {
        return context.send(`:scroll: \`${bot.util.arrayRand(responses)}\``);
    },
};