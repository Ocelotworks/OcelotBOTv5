const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
module.exports = {
    name: "Add Role",
    usage: "addRole <colour> <emoji> or <@role> <emoji>",
    commands: ["addrole", "ar"],
    run: async function (message, args, bot, roleData) {
        if(!roleData[message.guild.id])return message.channel.send(`You have not set a message yet, use ${args[0]} setMessage to create a role message.`);
        if(args.length < 3 && message.mentions.roles.size === 0)return message.channel.send("You need to supply a role colour and an emoji or @ a role ");
        let role;
        const emoji = args[3];
        if(!emoji.startsWith("<:") && !emoji.includes(":") && !emojiRegex.test(emoji))
            return message.channel.send("Invalid emoji, please include a Discord emoji (e.g <:peter:478962397281779713>) or a default emoji (e.g 👌)");
        if(emoji.startsWith("<:") && !bot.client.emojis.resolve(emoji.split(":")[2].replace(">", "")))
            return message.channel.send("Invalid emoji, please make sure the emoji is one that OcelotBOT can use.")
        if(message.mentions.roles.size === 0){
            const colour = args[2];
            try {
                role = await message.guild.roles.create({
                    data: {
                        name: colour,
                        color: colour,
                        hoist: false,
                        position: message.guild.me.roles.highest.position-1,
                    },
                    reason: "role button role creation"
                })
            }catch(e){
                console.log(e);
                return message.channel.send("Failed to create role, check that OcelotBOT has Administrator permissions.");
            }

        }else{
            role = message.mentions.roles.first();
        }

        await bot.database.addRoleButton(roleData[message.guild.id].messageID, emoji, role.id);
        message.channel.send("Added the button successfully!")
        const discordMessage = roleData[message.guild.id].message;
        if(emoji.startsWith("<")){
            await discordMessage.react(emoji.split(":")[2].replace(">", ""));
        }else
            await discordMessage.react(emoji);

        if(!roleData.loaded[discordMessage.id])
            roleData.loaded[discordMessage.id] = {};
        roleData.loaded[discordMessage.id][emoji] = role.id;
    }
};