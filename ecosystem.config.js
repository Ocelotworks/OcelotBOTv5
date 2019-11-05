const ocelotEnv = {
    NODE_ENV: "production",
    PORT: "3006"
};

module.exports = {
    apps : [
        {
            name: "ob-prod",
            script: "broker.js",
            cwd: "./broker/",
            env: ocelotEnv,
        },
        {
            name: "ob-staging",
            script: "broker.js",
            cwd: "./broker/",
            env: {
                NODE_ENV: "staging",
                PORT: "3007"
            },
        },
        {
            name: "ob-analytics",
            script: "analytics.js",
            cwd: "./consumers/",
            env: ocelotEnv,
        },
        {
            name: "ob-livecount",
            script: "livecount.js",
            cwd: "./consumers/",
            env: ocelotEnv,
        },
        {
            name: "ob-reminders",
            script: "reminders.js",
            cwd: "./consumers/",
            env: ocelotEnv
        },
        {
            name: "ob-spook",
            script: "spook.js",
            cwd: "./consumers/",
            env: ocelotEnv
        },
        {
            name: "ob-lavalink",
            script: "Lavalink.jar",
            interpreter: "/usr/bin/java",
            cwd: "~/lavalink",
            interpreter_args: "-jar -javaagent:dd-java-agent.jar"
        },
        {
            name: "ob-zork",
            script: "OcelotZ5Kotlin.jar",
            interpreter: "/usr/bin/java",
            cwd: "~/zork",
            interpreter_args: "-jar"
        },
        {
            name: "chacha",
            script: "./chacha.js",
        },
        {
            name: "anex",
            script: "./anex.js",
        }

    ]
};