const Discord = require("discord.js");
const Icon = require('../util/Icon');

class LangEmbed extends Discord.MessageEmbed {
    context;
    constructor(context){
        super();
        this.setColor("#03F783");
        this.context = context;
    }

    setTitleLang(key, values) {
        return super.setTitle(this.context.getLang(key, values));
    }

    setDescriptionLang(key, values) {
        return super.setDescription(this.context.getLang(key, values));
    }

    setFooterLang(key, iconURL, values) {
        return super.setFooter(this.context.getLang(key, values), iconURL);
    }

    addFieldLang(nameKey, valueKey, inline, values) {
        return super.addField(this.context.getLang(nameKey, values), this.context.getLang(valueKey, values), inline);
    }

    setAuthorLang(nameKey, values, iconURL, url) {
        return super.setAuthor(this.context.getLang(nameKey, values), iconURL, url);
    }
}

class AuthorEmbed extends LangEmbed {
    constructor(context) {
        super(context);
        this.setAuthor(context.user.username, context.user.avatarURL({size: 32, format: "png", dynamic: true}));
    }
}


class PointsEmbed extends AuthorEmbed {
    bot;
    points;
    constructor(context, bot){
        super(context);
        this.bot = bot;
        if(context.getBool("points.enabled"))
            super.setFooter("PointsEmbed was used without calling init()", Icon.points.url)
    }

    async init(points){
        if(!this.context.getBool("points.enabled"))return;
        if(!points)
            await this.bot.database.getPoints(this.context.user.id);
        if(!points)return; // They do not have points. Somehow.
        this.points = points;
        super.setFooter(points.toLocaleString(), Icon.points.url);
    }

    setFooter(text, iconURL ){
        if(!this.context.getBool("points.enabled"))return super.setFooter(text, iconURL);
        return super.setFooter(`${this.points.toLocaleString()} • ${text}`, iconURL || Icon.points.url);
    }
}

module.exports = {PointsEmbed, LangEmbed, AuthorEmbed}