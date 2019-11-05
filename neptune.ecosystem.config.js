const ocelotEnv = {
    NODE_ENV: "production"
};

module.exports = {
    apps : [
        {
            name: "ob-image",
            script: "image.js",
            cwd: "./consumers/",
            env: ocelotEnv
        },
        {
            name: "ob-omegle",
            script: "omegle.js",
            cwd: "./consumers/",
            env: ocelotEnv
        },
    ]
};