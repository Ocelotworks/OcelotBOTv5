const {axios} = require('./Http');
module.exports = class Services {

    static async GetService(namespace, id = "any") {
        const {data} = await axios.get(`https://frotter.int.unacc.eu/${namespace}/${id}`)
        return data.ip;
    }
}