module.exports = {
    name: "User Avatar",
    usage: "avatar <@User>",
    detailedHelp: "Get a user's avatar. Or your own.",
    categories: ["image", "tools"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["avatar"],
    run: function(message){
        let target = message.author;
        if(message.mentions && message.mentions.users && message.mentions.users.size > 0){
            target = message.mentions.users.first();
        }
        message.channel.send("", {
            embed:{
                title: `${target.username}'s Avatar:`,
                image: {
                    url: target.avatarURL({dynamic: true, format: "png"})
                }
            }

        })
    },
    test: function(test){
        test('avatar author', function(t){
            const message = {
                author: {
                    username: "abc",
                    avatar: "def"
                },
                channel: {
                    send: function(message, embed){
                        t.deepEqual(embed, {
                            embed: {
                                title: "abc's Avatar:",
                                image: {
                                    url: "def"
                                }
                            }
                        })
                    }
                }
            };
            module.exports.run(message);
        });
        test('avatar mention', function(t){
            const message = {
                author: {
                    username: "abc",
                    avatar: "def"
                },
                mentions: {
                  users: {
                      size: 1,
                      first: function(){
                          return {
                              username: "xyz",
                              avatar: "lmn"
                          }
                      }
                  }
                },
                channel: {
                    send: function(message, embed){
                        t.deepEqual(embed, {
                            embed: {
                                title: "xyz's Avatar:",
                                image: {
                                    url: "lmn"
                                }
                            }
                        })
                    }
                }
            };
            module.exports.run(message);
        });
    }
};