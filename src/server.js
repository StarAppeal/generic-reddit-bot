const GenericBot = require("./bot/genericBot")

const bots = require("./config/robots.json").bots;

bots.forEach(startBot);

async function startBot(botConfig) {
  let bot = new GenericBot(botConfig);
  if (botConfig.respondToMentions) {
    bot.inboxLoop();
  }
  
  bot.startBot();
}
