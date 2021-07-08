const axios = require('axios').create({
    headers: {'User-Agent': `OcelotBOT ${process.env.VERSION} (https://ocelotbot.xyz)`}
});

module.exports = {axios};

