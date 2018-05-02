module.exports = {
    name: "Patient Says",
    usage: "ronald <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["hospital", "hospitalguysays", "hospitalguy", "patient", "patientsays"],
    run:  function(message, args, bot){
        bot.util.processImageMeme(message, args, 497, 64, 40, 15, "patientsays.png", "static/hospital.png");
    }
};