const gm = require('gm');
const wrap = require('word-wrap');
const Discord = require('discord.js');
module.exports = {
    name: "Utilities",
    init: function(bot){

        bot.util = {};


        bot.util.vowels = ["a", "e", "i", "o", "u","ａ","ｅ","ｉ","ｏ","ｕ","Ａ","Ｅ","Ｉ","Ｏ","Ｕ"];

        /**
         * Returns a random number between `min` and `max`
         * @param {Number} min
         * @param {Number} max
         * @returns {number}
         */
        bot.util.intBetween = function(min, max){
            return parseInt((Math.random() * max)+min);
        };

        /**
        * Chooses a random object from `array`
        * @param {Array} array
        * @returns {*} A random object from the specified array
        */
        bot.util.arrayRand = function arrayRand(array){
            return array[Math.round(Math.random()*(array.length-1))];
        };

        /**
         *
         * @param {Function} callback The function called once the time is up
         * @param {Number} timeout_ms The amount of milliseconds until the time should be called
         */
        bot.util.setLongTimeout = function setLongTimeout(callback, timeout_ms){
            if(timeout_ms > 2147483646){
                setTimeout(function(){
                    setLongTimeout(callback, (timeout_ms - 2147483646));
                },2147483646);
            }
            else{
                setTimeout(callback, timeout_ms);
            }
        };

        /**
         * Returns the difference between two arrays
         * @param {Array} first
         * @param {Array} second
         * @returns {Array}
         */
        bot.util.arrayDiff = function(first, second) {
            return first.filter(function(i) {return second.indexOf(i) < 0;});
        };

        /**
         * Randomly shuffles an array
         * @param {Array} a
         */
        bot.util.shuffle = function shuffle(a) {
            var j, x, i;
            for (i = a.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x
            }
        };

        /**
         *
         * @param {Array} data
         * @param {String} unit
         * @param {Number} value
         * @returns {Array}
         */
        bot.util.quantify = function quantify(data, unit, value) {
            if (value && value >= 1) {
                if (value > 1 || value < -1)
                    unit += 's';

                data.push(value + ' ' + unit);
            }

            return data;
        };

        /**
         * Parses a number of seconds as a proper time
         * @param {Number} seconds
         * @returns {String}
         */
        bot.util.prettySeconds = function prettySeconds(seconds) {

            var prettyString = '',
                data = [];

            if (typeof seconds === 'number') {
                data = bot.util.quantify(data, 'day',    parseInt((seconds) / 86400));
                data = bot.util.quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
                data = bot.util.quantify(data, 'minute', parseInt((seconds % 3600) / 60));
                data = bot.util.quantify(data, 'second', Math.floor(seconds % 60));

                var length = data.length,
                    i;

                for (i = 0; i < length; i++) {

                    if (prettyString.length > 0)
                        if (i == length - 1)
                            prettyString += ' and ';
                        else
                            prettyString += ', ';

                    prettyString += data[i];
                }
            }

            return prettyString;
        };

        /**
         * Format memory as a string
         * @param {Number} bytes The number of Bytes
         * @returns {string}
         */
        bot.util.prettyMemory = function prettyMemory(bytes){
            if(bytes < 1000)return bytes+" bytes"; //< 1kb
            if(bytes < 1000000)return parseInt(bytes/1000)+"KB"; //<1mb
            if(bytes < 1e+9)return parseInt(bytes/1000000)+"MB"; //<1gb
            if(bytes < 1e+12)return parseInt(bytes/1e+9)+"GB"; //<1tb
            if(bytes < 1e+15)return parseInt(bytes/1e+12)+"TB"; //<1pb
            return parseInt(bytes/1e+15)+"PB";
        };

        /**
         *
         * @param {Function} func
         * @param {Number} wait
         * @param {Boolean} immediate
         * @returns {Function}
         */        bot.bans = {
          user: [],
          channel: [],
          server: []
        };
        bot.util.debounce = function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this
                    , args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate)
                        func.apply(context, args)
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow)
                    func.apply(context, args)
            }
        };

        /**
         *
         * @param {Function} fn
         * @param {Number} threshhold
         * @param {*} scope
         * @returns {Function}
         */
        bot.util.throttle = function throttle(fn, threshhold, scope) {
            threshhold || (threshhold = 250);
            var last, deferTimer;
            return function() {
                var context = scope || this;
                var now = +new Date
                    , args = arguments;
                if (last && now < last + threshhold) {
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args)
                    }, threshhold)
                } else {
                    last = now;
                    fn.apply(context, args)
                }
            }
        };

        /**
         * Separate an array into chunks
         * @param {Array} a
         * @param {Number} n
         * @param {Boolean} balanced
         * @returns {Array<Array>}
         */
        bot.util.chunkify = function chunkify(a, n, balanced) {

            if (n < 2)
                return [a];

            var len = a.length,
                out = [],
                i = 0,
                size;

            if (len % n === 0) {
                size = Math.floor(len / n);
                while (i < len) {
                    out.push(a.slice(i, i += size));
                }
            }

            else if (balanced) {
                while (i < len) {
                    size = Math.ceil((len - i) / n--);
                    out.push(a.slice(i, i += size));
                }
            }

            else {

                n--;
                size = Math.floor(len / n);
                if (len % size === 0)
                    size--;
                while (i < size * n) {
                    out.push(a.slice(i, i += size));
                }
                out.push(a.slice(size * n));

            }

            return out;
        };

        /**
         *
         * @param {String} message
         * @param {Array<String>} args
         * @param {Number} x The x position of the text
         * @param {Number} y The y position of the text
         * @param {Number} textSize The Size of the text
         * @param {Number} textWidth The Width of the text lines
         * @param {String} fileName The name of the uploaded file
         * @param {String} filePath The path of the template
         */
        bot.util.processImageMeme = function processImageMeme(message, args, x, y, textSize, textWidth, fileName, filePath){
            if(!args[1]){
                message.replyLang("IMAGE_NO_TEXT");
                return;
            }

            message.channel.startTyping();
            gm(filePath)
                .font("static/arial.ttf", textSize)
                .drawText(x, y, wrap(message.cleanContent.substring(args[0].length).substring(0,1010), {width: textWidth, indent: ''}))
                .toBuffer('PNG', function convertToPNG(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        bot.logger.log(err);
                        bot.raven.captureException(err);
                    }else{
                        const attachment = new Discord.Attachment(buffer, fileName);
                        message.channel.send("", attachment);
                    }
                    message.channel.stopTyping();
                });
        };

        String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
            function () {
                "use strict";
                let str = this.toString();
                if (arguments.length) {
                    let t = typeof arguments[0];
                    let key;
                    let args = ("string" === t || "number" === t) ?
                        Array.prototype.slice.call(arguments)
                        : arguments[0];

                    for (key in args) {
                        str = str.replace(new RegExp("\\{{" + key + "\\}}", "gi"), args[key]);
                    }
                }

                return str;
            };

        /**
         * Get an image for use in meme templates
         * @param {Object} message The message object
         * @param {Array<String>} args
         * @returns {Promise.<*>}
         */
        bot.util.getImage = async function getImage(message, args){
            try {
                if (message.mentions && message.mentions.users && message.mentions.users.size > 0) {
                    return message.mentions.users.first().avatarURL;
                } else if (args[1] && args[1].indexOf("http") > -1) {
                    return args[1];
                } else {
                    message.channel.startTyping();
                    const result = bot.util.getImageFromPrevious(message);
                    message.channel.stopTyping();
                    return result;
                }
            }catch(e){
                bot.raven.captureException(e);
                return null;
            }

        };

        /**
         * Get an image from previous messages
         * @param {Object} message
         * @returns {Promise.<*>}
         */
        bot.util.getImageFromPrevious = async function getImageFromPrevious(message){
            const previousMessages = (await message.channel.fetchMessages({limit: 50})).sort((a, b) => b.createdTimestamp - a.createdTimestamp);
            const targetMessage = previousMessages.find((previousMessage) =>{
                if(previousMessage.content.startsWith("http"))return true;
                if(previousMessage.attachments && previousMessage.attachments.size > 0)return true;
                return (previousMessage.embeds && previousMessage.embeds.size > 0);
            });
            if(targetMessage){
               if(targetMessage.content.startsWith("http")) {
                   return targetMessage.content.substring(0, targetMessage.content.indexOf(" "));
               }else if(targetMessage.attachments && targetMessage.attachments.size > 0){
                   const targetAttachment = targetMessage.attachments.find((attachment)=>(attachment.url || attachment.proxyURL));
                   return targetAttachment.url || targetAttachment.proxyURL;
               }else if(targetMessage.embeds && targetMessage.embeds.size > 0){
                    const targetEmbed = targetMessage.embeds.find((embed)=> embed.image && (embed.image.url || embed.image.proxyURL));
                    return targetEmbed.image.url || targetEmbed.image.proxyURL;
               }
               return null;
            }else{
                return null;
            }
        };

        Object.defineProperty(Array.prototype, 'chunk', {
            value: function(chunkSize) {
                var R = [];
                for (var i=0; i<this.length; i+=chunkSize)
                    R.push(this.slice(i,i+chunkSize));
                return R;
            }
        });

        /**
         * Get the prefix for numbers e.g 1st 2nd 3rd
         * @param {Number} i
         * @returns {string}
         */
        bot.util.getNumberPrefix = function getNumberPrefix(i){
            let j = i % 10,
                k = i % 100;
            if (j === 1 && k !== 11) {
                return i + "st";
            }
            if (j === 2 && k !== 12) {
                return i + "nd";
            }
            if (j === 3 && k !== 13) {
                return i + "rd";
            }
            return i + "th";
        }

    }
};