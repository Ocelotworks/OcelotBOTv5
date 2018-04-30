/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
const config = require('config');
const states = config.get("Commands.peterstate.states");


const facts = [
	"Peter has re-ocurring dreams in which **Ed Sheeran** is his friend.",
	"Peter's favourite genre of music is **shitty 90s/noughties love ballads**.",
	"Peter spends over **50%** of his time on his computer.",
	"Peter once pretended he was left handed for **4 months** because he couldn't admit his mistake.",
	"Peter spends **1/3rd** of his time asleep. Like most humans.",
	"If Peter doesn't have his vitamins in the morning, he turns into the weak version of **The Hulk**.",
	"Peter is allergic to **dust** and **citrus fruit**.",
	"Peter did try and automatically record sex using sensors, but his girlfriend wouldn't allow it.",
	"Peter plays <:Overwatch:230070017390149632> **Overwatch**: Peter#25877",
	"Peter once got stranded for **4 hours** in a town within walking distance of his house.",
	"Bragging about **Reddit Karma** is not a good way to impress a girl.",
	"Peter has a weird ability to remember numbers that contain a **9**.",
	"Peter works for a company his mum compared to the **Hitler Youth**.",
	"Hiding a **fire extinguisher** in your room is not a good way to impress a girl.",
	"Peter kept track of how many times his ex got mad at him. The longest break between arguments was **5 days**",
	"Peter once pretended a girl was his **sister** purely for banter.",
	"Some times Peter remembers a **snail** he stepped on a few years ago and feels sad.",
	"Peter spends **too much money** on **useless shit**.",
	"Saying **'Any Hole's A Goal'** is not a good way to impress a girl.",
	"Peter's average bed time this month is **4AM**",
	"Peter went to comicon in a **cardboard box**. He'll show you pictures if you ask nicely.",
	"Peter knows **2^31** off by heart.",
	"Peter's nickname in primary school was **worm boy**...",
	"Peter once **fainted** because he stood up for too long.",
	"Peter once had a **canoe** on his roof."
];
module.exports = {
    name: "Peter State",
    usage: "peterstate",
    accessLevel: 0,
    commands: ["peterstate"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.embedLinks)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: await bot.lang.getTranslation(server, "ERROR_NEEDS_PERMISSION", "Embed Links")
			});
			return;
		}
    	var result = await bot.database.getLastPetermonData();
		request(`https://unacceptableuse.com/petify/api/${config.get("Commands.peterstate.petifyKey")}/nowPlaying/${config.get("Commands.peterstate.petifyUser")}`, async function (err, resp, body){
			if(err){
				bot.raven.captureException(err);
				recv.sendMessage({
					to: channel,
					message: err
				});
			}else{
				try {
					var data = JSON.parse(body);
					if (data.err) {
						bot.raven.captureException(err);
						recv.sendMessage({
							to: channel,
							message: await bot.lang.getTranslation(server, "PETERSTATE_GENERIC_ERROR", {source: "Petify", error: JSON.stringify(data.err)})
						});
					} else {
						request({
							url: "https://ha.petermaguire.xyz/api/job",
							headers: {
								"x-api-key": config.get("Commands.peterstate.octoprintKey")
							}
						}, async function(err, resp, body){
							var printerState = "Unknown";
							if(err){
								printerState = "Idle."
							}else{
								try{
									var pr = JSON.parse(body);
									if(pr.job && pr.progress){
										printerState = `${pr.state} - **${Math.round(pr.progress.completion)}%** complete. **${bot.util.prettySeconds(pr.progress.printTimeLeft)}** left.`;
									}else{
										printerState = pr.state ? pr.state : "Idle.";
									}

								}catch(e){
									printerState = "Error";
									bot.raven.captureException(e);
								}
							}
							var outside = await bot.database.getPetermonLastOutside();
							const now = new Date();
							const lastTimeOutside = new Date(outside[0].timestamp);
							const timeInside = now - lastTimeOutside;
							const peter = result[0];
							recv.sendAttachment(channel,
								await bot.lang.getTranslation(server, "PETERSTATE_FUN_FACT", (timeInside >= 8.64e+7 ? await bot.lang.getTranslation(server, "PETERSTATE_HOUSE_STATS", bot.util.prettySeconds(parseInt(timeInside / 1000))) : bot.util.arrayRand(facts))),
								[
									{
										fallback: "...",
										color: "#4d41ef",
										title: `Peter's last state was: ${states[peter.state] || peter.state}`,
										text: peter.state === "Home" ? `:musical_note: Listening to **[${data.artist_name} - ${data.title}](https://unacceptableuse.com/petify/song/${data.song_id}/-%7C)**` : `Last update: ${peter.timestamp}`,
										image: "https://ha.petermaguire.xyz/webcam/?action=snapshot&v="+Math.random(),
										fields: [
											{
												title: ":santa: Feeling Christmassy?",
												value: "A bit.",
												short: true
											},
											{
												title: await bot.lang.getTranslation(server, "PETERSTATE_ROOM_TEMP"),
												value: peter.inside_temp + " C",
												short: true
											},
											{
												title: await bot.lang.getTranslation(server, "PETERSTATE_PHONE_BATTERY"),
												value: peter.jimmy_battery + "%",
												short: true
											},
											{
												title: await bot.lang.getTranslation(server, "PETERSTATE_PHONE_TEMP"),
												value: peter.jimmy_light + " C",
												short: true
											},
											{
												title: await bot.lang.getTranslation(server, "PETERSTATE_SPEED"),
												value: peter.jimmy_speed + " m/s",
												short: true
											},
											{
												title: await bot.lang.getTranslation(server, "PETERSTATE_ALTITUDE"),
												value: await bot.lang.getTranslation(server, "PETERSTATE_ABOVE_SEALEVEL", peter.jimmy_altitude),
												short: true
											},
											{
												title: ":printer: 3D Printer",
												value: printerState,
												short: false
											},
										]
									}
								]);
						});
					}
				}catch(e){
					bot.raven.captureException(e);
					recv.sendMessage({
						to: channel,
						message: await bot.lang.getTranslation(server, "PETERSTATE_GENERIC_ERROR", {source: "Petify", error: JSON.stringify(e)})
					});
					bot.logger.error(e.stack);
				}
			}
		});
    }
};