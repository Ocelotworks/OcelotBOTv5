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
        if(context.user)
            this.setAuthor(context.user.username, context.user.avatarURL({size: 32, format: "png", dynamic: true}));
    }
}


class PointsEmbed extends AuthorEmbed {
    bot;
    points;
    pointsString;
    pointsIcon;
    constructor(context, bot){
        super(context);
        this.bot = bot;
        if(context.getBool("points.enabled"))
            super.setFooter("PointsEmbed was used without calling init()", Icon.points.url)
    }

    async init(points){
        if(!this.context.getBool("points.enabled"))return;
        if(!points)
            points = await this.bot.database.getPoints(this.context.user.id);
        this.points = points;
        this.pointsString = points < 100 ? `${points.toLocaleString()} Low points! Check out ${this.context.getSetting("prefix")}points earn` : points.toLocaleString();
        this.pointsIcon = points < 100 ? Icon.points_ending.url : Icon.points.url
        super.setFooter(this.pointsString, this.pointsIcon);
    }

    setFooter(text, iconURL ){
        if(!this.context.getBool("points.enabled"))return super.setFooter(text, iconURL);
        return super.setFooter(`${this.pointsString} • ${text}`, iconURL || this.pointsIcon);
    }
}

module.exports = {PointsEmbed, LangEmbed, AuthorEmbed}