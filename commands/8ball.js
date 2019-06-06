module.exports = {
  name: "Magic 8-ball",
  usage: "8ball <question>",
  detailedHelp: "Gives an 8-ball style response to your question",
  usageExample: "8ball is OcelotBOT the best bot ever made?",
  categories: ["tools", "fun"],
  commands: ["8ball", "magic8ball"],
  run: function run(message, args, bot) {
    message.replyLang(args.length < 2 ? "8BALL_NO_QUESTION" : `8BALL_RESPONSE_${message.getSetting("8ball.rig") || bot.util.intBetween(0,14)}`);
  },
  test: function(test){
      test('8ball with args', function(t){
          const message = {
              replyLang: function(message){
                t.is(message, "8BALL_RESPONSE_0");
              },
              getSetting: function(setting){
                  t.is(setting, "8ball.rig");
                  return null;
              }
          };
          const args = ["some", "arguments", "here"];
          const bot = {
              util: {
                  intBetween: function(x, y){
                      return 0;
                  }
              }
          };
          module.exports.run(message, args, bot);
      });
      test('8ball with no args', function(t){
          const message = {
              replyLang: function(message){
                  t.is(message, "8BALL_NO_QUESTION");
              },
              getSetting: function(setting){
                  t.is(setting, "8ball.rig");
                  return null;
              }

          };
          const args = [];
          module.exports.run(message, args);
      });
      test('8ball rigged', function(t){
          const message = {
              replyLang: function(message){
                  t.is(message, "8BALL_RESPONSE_5");
              },
              getSetting: function(setting){
                  t.is(setting, "8ball.rig");
                  return 5;
              }
          };
          const args = ["some", "arguments", "here"];
          const bot = {
              util: {
                  intBetween: function(x, y){
                      t.fail();
                      return 0;
                  }
              }
          };
          module.exports.run(message, args, bot);
      });

  }
};