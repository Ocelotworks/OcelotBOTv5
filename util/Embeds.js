const Discord = require("discord.js");


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
}

class AuthorEmbed extends LangEmbed {
    constructor(context) {
        super(context);
        this.setAuthor(context.user.username, context.user.avatarURL({size: 32, format: "png", dynamic: true}));
    }
}

module.exports = {LangEmbed, AuthorEmbed}