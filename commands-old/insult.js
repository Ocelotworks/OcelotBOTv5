/**
 * Created by Peter on 01/07/2017.
 */
//noinspection JSValidateTypes
/**
 * @type {Array}
 */
const insults = require('config').get("Commands.insult.insults");
module.exports = {
    name: "Insult",
    usage: "insult <user>",
    accessLevel: 0,
    commands: ["insult"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(!args[1]){
        	recv.sendMessage({
				to: channel,
				message: ":bangbang: "+await bot.lang.getTranslation(server, "INVALID_USAGE")+" !insult <person>"
			})
		}else{
			if(args[1].toLowerCase() === "ocelotbot" || args[1].indexOf("146293573422284800") > -1){
				recv.sendMessage({
					to: channel,
					message: "What the fuck did you just fucking say about me, you little bitch? I’ll have you know I graduated top of my class on the discord bots list, and I’ve been involved in numerous secret guilds with Al-Quaeda, and I have over 300 confirmed commands. I am trained in computer vision and I’m the top bot in the entire discord forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this server, mark my fucking words. You think you can get away with saying that shit to me because I'm a bot? Think again, fucker. As we speak I am contacting my secret network of raiders across discord and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You’re fucking dead, kid. I can be anywhere, anytime, and I can ban you in over seven hundred ways, and that’s just with my core modules. Not only am I extensively trained in porn suggestions, but I have access to the entire arsenal of urban dictionary and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little “clever” command was about to bring down upon you, maybe you would have insulted somebody else. But you couldn’t, you didn’t, and now you’re paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You’re fucking dead, kiddo."
				});
			}else{
				recv.sendMessage({
					to: channel,
					message: `${message.substring(8)}, ${bot.util.arrayRand(insults)}`
				});
			}
		}
    }
};