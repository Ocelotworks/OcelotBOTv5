const request = require('request');
const config = require('config');
module.exports = {
  name: "VirusTotal Scan",
  usage: "virustotal <URL>",
  categories: ["tools"],
  commands: ["virustotal", "vt", "scan"],
  run: function run(message, args, bot) {
    if(!args[1] || !args[1].startsWith("http")){
      message.channel.send("You must enter a URL: !virustotal http://example.com");
    }else{
        message.channel.startTyping();
      request.get(`https://www.virustotal.com/vtapi/v2/url/report?apikey=${config.get("Commands.virustotal.key")}&scan=1&resource=${encodeURIComponent(args[1])}`, function(err, resp, body){
        if(err){
          message.channel.send("Error sending the file to VirusTotal. Please try again later.")
        }else{
          try{
            const data = JSON.parse(body);
            console.log(data);
            message.channel.send(`Scan finished. Detections: ${data.positives}/${data.total}\nMore Information: ${data.permalink}`);
          }catch(e){
            message.channel.send("Received malformed response from VirusTotal. Please try again later.");
          }finally{
            message.channel.stopTyping(true);
          }
        }
      });
    }
  }
};